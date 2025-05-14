/**
 * @voilajs/appkit - Redis cache strategy
 * @module @voilajs/appkit/cache/strategies/redis
 */

import { CacheStrategy } from './base.js';
import { createSerializer } from '../serializer.js';

/**
 * Redis cache strategy implementation
 * @extends CacheStrategy
 */
export class RedisStrategy extends CacheStrategy {
  /**
   * Create a new Redis cache strategy
   * @param {Object} config - Strategy configuration
   * @param {string} [config.url] - Redis connection URL
   * @param {string} [config.password] - Redis password
   * @param {Object} [config.options] - Redis client options
   * @param {string} [config.keyPrefix] - Key prefix
   * @param {number} [config.defaultTTL] - Default TTL in seconds
   */
  constructor(config) {
    super(config);
    this.client = null;
    this.serializer = createSerializer(config.serializer);
  }

  /**
   * Connect to Redis
   * @returns {Promise<void>}
   */
  async connect() {
    const redis = await import('redis');

    this.client = redis.createClient({
      url: this.config.url,
      password: this.config.password,
      ...this.config.options,
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await this.client.connect();
  }

  /**
   * Disconnect from Redis
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * Get value from Redis
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    const prefixedKey = this.keyPrefix + key;
    const data = await this.client.get(prefixedKey);

    if (!data) return null;

    try {
      return this.serializer.deserialize(data);
    } catch (error) {
      console.error(`Failed to deserialize cache value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in Redis
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = this.defaultTTL) {
    const prefixedKey = this.keyPrefix + key;
    const serialized = this.serializer.serialize(value);

    try {
      if (ttl) {
        await this.client.setEx(prefixedKey, ttl, serialized);
      } else {
        await this.client.set(prefixedKey, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Failed to set cache value for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from Redis
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    const prefixedKey = this.keyPrefix + key;
    try {
      const result = await this.client.del(prefixedKey);
      return result === 1;
    } catch (error) {
      console.error(`Failed to delete cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear Redis cache
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      if (this.keyPrefix) {
        // Clear only keys with prefix
        const keys = await this.client.keys(`${this.keyPrefix}*`);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } else {
        // Clear entire database
        await this.client.flushDb();
      }
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Get multiple values from Redis
   * @param {string[]} keys - Cache keys
   * @returns {Promise<Object>} Object with key-value pairs
   */
  async getMany(keys) {
    if (keys.length === 0) return {};

    const prefixedKeys = keys.map((key) => this.keyPrefix + key);

    try {
      const values = await this.client.mGet(prefixedKeys);

      const result = {};
      keys.forEach((key, index) => {
        const data = values[index];
        result[key] = data ? this.serializer.deserialize(data) : null;
      });

      return result;
    } catch (error) {
      console.error('Failed to get multiple cache values:', error);
      // Fall back to individual gets
      return super.getMany(keys);
    }
  }

  /**
   * Set multiple values in Redis
   * @param {Object} items - Object with key-value pairs
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async setMany(items, ttl = this.defaultTTL) {
    try {
      const serializedItems = {};

      // Serialize values and add prefix
      for (const [key, value] of Object.entries(items)) {
        const prefixedKey = this.keyPrefix + key;
        serializedItems[prefixedKey] = this.serializer.serialize(value);
      }

      // Use pipeline for efficient batch operation
      const pipeline = this.client.multi();

      for (const [key, value] of Object.entries(serializedItems)) {
        if (ttl) {
          pipeline.setEx(key, ttl, value);
        } else {
          pipeline.set(key, value);
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Failed to set multiple cache values:', error);
      // Fall back to individual sets
      return super.setMany(items, ttl);
    }
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Key pattern
   * @returns {Promise<number>} Number of keys deleted
   */
  async deletePattern(pattern) {
    const prefixedPattern = this.keyPrefix + pattern;

    try {
      const keys = await this.client.keys(prefixedPattern);

      if (keys.length === 0) return 0;

      const result = await this.client.del(keys);
      return result;
    } catch (error) {
      console.error(
        `Failed to delete keys matching pattern ${pattern}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Get all keys matching pattern
   * @param {string} pattern - Key pattern
   * @returns {Promise<string[]>} Matching keys
   */
  async keys(pattern) {
    const prefixedPattern = this.keyPrefix + pattern;

    try {
      const keys = await this.client.keys(prefixedPattern);

      // Remove prefix from keys
      if (this.keyPrefix) {
        return keys.map((key) => key.slice(this.keyPrefix.length));
      }

      return keys;
    } catch (error) {
      console.error(`Failed to get keys matching pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Get TTL for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds, -1 if no TTL, -2 if key doesn't exist
   */
  async ttl(key) {
    const prefixedKey = this.keyPrefix + key;

    try {
      return await this.client.ttl(prefixedKey);
    } catch (error) {
      console.error(`Failed to get TTL for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Update expiration for a key
   * @param {string} key - Cache key
   * @param {number} ttl - New TTL in seconds
   * @returns {Promise<boolean>} Success status
   */
  async expire(key, ttl) {
    const prefixedKey = this.keyPrefix + key;

    try {
      const result = await this.client.expire(prefixedKey, ttl);
      return result === 1;
    } catch (error) {
      console.error(`Failed to update expiration for key ${key}:`, error);
      return false;
    }
  }
}
