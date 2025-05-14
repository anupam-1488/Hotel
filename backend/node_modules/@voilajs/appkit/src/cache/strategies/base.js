/**
 * @voilajs/appkit - Base cache strategy
 * @module @voilajs/appkit/cache/strategies/base
 */

/**
 * Base cache strategy interface
 * @abstract
 */
export class CacheStrategy {
  /**
   * Create a new cache strategy
   * @param {Object} config - Strategy configuration
   */
  constructor(config) {
    this.config = config;
    this.keyPrefix = config.keyPrefix || '';
    this.defaultTTL = config.defaultTTL || null;
  }

  /**
   * Connect to cache backend
   * @abstract
   * @returns {Promise<void>}
   */
  async connect() {
    throw new Error('connect() must be implemented by strategy');
  }

  /**
   * Disconnect from cache backend
   * @abstract
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented by strategy');
  }

  /**
   * Get value from cache
   * @abstract
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    throw new Error('get() must be implemented by strategy');
  }

  /**
   * Set value in cache
   * @abstract
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl) {
    throw new Error('set() must be implemented by strategy');
  }

  /**
   * Delete key from cache
   * @abstract
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    throw new Error('delete() must be implemented by strategy');
  }

  /**
   * Clear entire cache
   * @abstract
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    throw new Error('clear() must be implemented by strategy');
  }

  /**
   * Get multiple values
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<Object>} Object with key-value pairs
   */
  async getMany(keys) {
    const results = {};
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    return results;
  }

  /**
   * Set multiple values
   * @param {Object} items - Object with key-value pairs
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async setMany(items, ttl) {
    const results = await Promise.all(
      Object.entries(items).map(([key, value]) => this.set(key, value, ttl))
    );
    return results.every((result) => result === true);
  }

  /**
   * Delete multiple keys
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<number>} Number of keys deleted
   */
  async deleteMany(keys) {
    const results = await Promise.all(keys.map((key) => this.delete(key)));
    return results.filter((result) => result === true).length;
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if exists
   */
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }
}
