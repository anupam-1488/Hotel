/**
 * @voilajs/appkit - Memory cache strategy
 * @module @voilajs/appkit/cache/strategies/memory
 */

import { CacheStrategy } from './base.js';

/**
 * In-memory cache strategy implementation
 * @extends CacheStrategy
 */
export class MemoryStrategy extends CacheStrategy {
  /**
   * Create a new memory cache strategy
   * @param {Object} config - Strategy configuration
   * @param {number} [config.maxItems=1000] - Maximum items to store
   * @param {number} [config.defaultTTL] - Default TTL in seconds
   */
  constructor(config) {
    super(config);
    this.store = new Map();
    this.timers = new Map();
    this.maxItems = config.maxItems || 1000;
  }

  /**
   * Connect to cache (no-op for memory cache)
   * @returns {Promise<void>}
   */
  async connect() {
    // No connection needed for memory cache
    return Promise.resolve();
  }

  /**
   * Disconnect from cache (cleanup timers)
   * @returns {Promise<void>}
   */
  async disconnect() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.store.clear();
    return Promise.resolve();
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    const item = this.store.get(key);

    if (!item) return null;

    // Check expiration
    if (item.expires && item.expires < Date.now()) {
      await this.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = this.defaultTTL) {
    // Enforce max items limit
    if (!this.store.has(key) && this.store.size >= this.maxItems) {
      // Remove oldest item (first in map)
      const firstKey = this.store.keys().next().value;
      await this.delete(firstKey);
    }

    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    const item = {
      value,
      expires: ttl ? Date.now() + ttl * 1000 : null,
    };

    this.store.set(key, item);

    // Set expiration timer
    if (ttl) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);

      this.timers.set(key, timer);
    }

    return true;
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    return this.store.delete(key);
  }

  /**
   * Clear entire cache
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.store.clear();
    return true;
  }

  /**
   * Get all keys matching a pattern
   * @param {string} pattern - Pattern to match
   * @returns {Promise<string[]>} Matching keys
   */
  async keys(pattern) {
    // Simple glob-style pattern matching
    const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');

    const regex = new RegExp(`^${regexPattern}$`);

    return Array.from(this.store.keys()).filter((key) => regex.test(key));
  }

  /**
   * Delete keys matching a pattern
   * @param {string} pattern - Pattern to match
   * @returns {Promise<number>} Number of keys deleted
   */
  async deletePattern(pattern) {
    const keys = await this.keys(pattern);
    return this.deleteMany(keys);
  }

  /**
   * Get time-to-live for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds, -1 if no TTL, -2 if key doesn't exist
   */
  async ttl(key) {
    const item = this.store.get(key);

    if (!item) return -2;

    if (!item.expires) return -1;

    const remainingMs = item.expires - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : -2;
  }

  /**
   * Update expiration for a key
   * @param {string} key - Cache key
   * @param {number} ttl - New TTL in seconds
   * @returns {Promise<boolean>} Success status
   */
  async expire(key, ttl) {
    const item = this.store.get(key);

    if (!item) return false;

    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Set new expiration
    item.expires = ttl ? Date.now() + ttl * 1000 : null;

    // Set new timer if TTL is provided
    if (ttl) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);

      this.timers.set(key, timer);
    }

    return true;
  }
}
