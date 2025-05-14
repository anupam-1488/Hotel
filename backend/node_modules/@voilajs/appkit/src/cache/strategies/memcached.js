/**
 * @voilajs/appkit - Memcached cache strategy
 * @module @voilajs/appkit/cache/strategies/memcached
 */

import { CacheStrategy } from './base.js';
import { createSerializer } from '../serializer.js';

/**
 * Memcached cache strategy implementation
 * @extends CacheStrategy
 */
export class MemcachedStrategy extends CacheStrategy {
  /**
   * Create a new Memcached cache strategy
   * @param {Object} config - Strategy configuration
   * @param {string[]} [config.servers] - Memcached servers
   * @param {Object} [config.options] - Memcached client options
   * @param {string} [config.keyPrefix] - Key prefix
   * @param {number} [config.defaultTTL] - Default TTL in seconds
   */
  constructor(config) {
    super(config);
    this.client = null;
    this.serializer = createSerializer(config.serializer);
  }

  /**
   * Connect to Memcached
   * @returns {Promise<void>}
   */
  async connect() {
    const Memcached = await import('memcached');

    this.client = new Memcached.default(
      this.config.servers || 'localhost:11211',
      this.config.options || {}
    );

    // Promisify Memcached methods
    this.client.getAsync = this._promisify(this.client.get);
    this.client.setAsync = this._promisify(this.client.set);
    this.client.delAsync = this._promisify(this.client.del);
    this.client.flushAsync = this._promisify(this.client.flush);
    this.client.touchAsync = this._promisify(this.client.touch);
  }

  /**
   * Disconnect from Memcached
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  /**
   * Get value from Memcached
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    const prefixedKey = this.keyPrefix + key;

    try {
      const data = await this.client.getAsync(prefixedKey);
      if (!data) return null;

      return this.serializer.deserialize(data);
    } catch (error) {
      console.error(`Failed to get cache value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in Memcached
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = this.defaultTTL) {
    const prefixedKey = this.keyPrefix + key;

    try {
      const serialized = this.serializer.serialize(value);
      await this.client.setAsync(prefixedKey, serialized, ttl || 0);
      return true;
    } catch (error) {
      console.error(`Failed to set cache value for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from Memcached
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    const prefixedKey = this.keyPrefix + key;

    try {
      await this.client.delAsync(prefixedKey);
      return true;
    } catch (error) {
      console.error(`Failed to delete cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear Memcached cache
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      await this.client.flushAsync();
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
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
      await this.client.touchAsync(prefixedKey, ttl);
      return true;
    } catch (error) {
      console.error(`Failed to update expiration for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Promisify a Memcached method
   * @private
   * @param {Function} method - Method to promisify
   * @returns {Function} Promisified method
   */
  _promisify(method) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        method.call(this.client, ...args, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };
  }
}
