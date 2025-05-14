/**
 * @voilajs/appkit - Cache wrapper
 * @module @voilajs/appkit/cache/wrapper
 */

/**
 * Wrapper around cache strategy to provide enhanced functionality
 */
export class CacheWrapper {
  /**
   * Create a new cache wrapper
   * @param {Object} strategy - Strategy instance to wrap
   */
  constructor(strategy) {
    this.strategy = strategy;
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null if not found
   */
  async get(key) {
    return this.strategy.get(key);
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl) {
    return this.strategy.set(key, value, ttl);
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    return this.strategy.delete(key);
  }

  /**
   * Clear the entire cache
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    return this.strategy.clear();
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if key exists
   */
  async has(key) {
    return this.strategy.has(key);
  }

  /**
   * Get multiple values from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<Array<any>>} Array of values (null for missing keys)
   */
  async getMany(keys) {
    const result = await this.strategy.getMany(keys);

    // Convert object result to array in the same order as keys
    return keys.map((key) => result[key]);
  }

  /**
   * Set multiple values in cache
   * @param {Object} items - Object with key-value pairs
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async setMany(items, ttl) {
    return this.strategy.setMany(items, ttl);
  }

  /**
   * Delete multiple keys from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<number>} Number of keys deleted
   */
  async deleteMany(keys) {
    return this.strategy.deleteMany(keys);
  }

  /**
   * Close the cache connection
   * @returns {Promise<void>}
   */
  async disconnect() {
    return this.strategy.disconnect();
  }

  /**
   * Delete keys matching a pattern
   * @param {string} pattern - Pattern to match
   * @returns {Promise<number>} Number of keys deleted
   */
  async deletePattern(pattern) {
    if (typeof this.strategy.deletePattern === 'function') {
      return this.strategy.deletePattern(pattern);
    }

    // Fallback if strategy doesn't support deletePattern
    const keys = await this.keys(pattern);
    return this.deleteMany(keys);
  }

  /**
   * Get time-to-live for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds, -1 if no TTL, -2 if key doesn't exist
   */
  async ttl(key) {
    if (typeof this.strategy.ttl === 'function') {
      return this.strategy.ttl(key);
    }

    // Default implementation for strategies without TTL support
    const exists = await this.has(key);
    return exists ? -1 : -2;
  }

  /**
   * Update the expiration time for a key
   * @param {string} key - Cache key
   * @param {number} ttl - New TTL in seconds
   * @returns {Promise<boolean>} Success status
   */
  async expire(key, ttl) {
    if (typeof this.strategy.expire === 'function') {
      return this.strategy.expire(key, ttl);
    }

    // Default implementation: get and set again with new TTL
    const value = await this.get(key);
    if (value === null) return false;

    return this.set(key, value, ttl);
  }

  /**
   * Get all keys matching a pattern
   * @param {string} [pattern='*'] - Pattern to match
   * @returns {Promise<string[]>} Array of matching keys
   */
  async keys(pattern = '*') {
    if (typeof this.strategy.keys === 'function') {
      return this.strategy.keys(pattern);
    }
    throw new Error('Pattern matching not supported by this cache strategy');
  }

  /**
   * Create a namespaced cache instance
   * @param {string} prefix - Namespace prefix
   * @returns {CacheWrapper} Namespaced cache instance
   */
  namespace(prefix) {
    return new NamespacedCache(this, prefix);
  }

  /**
   * Get a value from cache or set it if not found
   * @param {string} key - Cache key
   * @param {Function} factory - Function to generate value on cache miss
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<any>} Cached or generated value
   */
  async getOrSet(key, factory, ttl) {
    const value = await this.get(key);
    if (value !== null) return value;

    const generated = await factory();
    await this.set(key, generated, ttl);
    return generated;
  }
}

/**
 * Namespaced cache that prefixes all keys
 * @private
 */
class NamespacedCache {
  /**
   * Create a namespaced cache
   * @param {CacheWrapper} parent - Parent cache instance
   * @param {string} prefix - Key prefix
   */
  constructor(parent, prefix) {
    this.parent = parent;
    this.prefix = prefix;
  }

  /**
   * Add namespace prefix to key
   * @private
   * @param {string} key - Original key
   * @returns {string} Prefixed key
   */
  _prefixKey(key) {
    return `${this.prefix}:${key}`;
  }

  /**
   * Add namespace prefix to multiple keys
   * @private
   * @param {string[]} keys - Original keys
   * @returns {string[]} Prefixed keys
   */
  _prefixKeys(keys) {
    return keys.map((key) => this._prefixKey(key));
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    return this.parent.get(this._prefixKey(key));
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl) {
    return this.parent.set(this._prefixKey(key), value, ttl);
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    return this.parent.delete(this._prefixKey(key));
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if key exists
   */
  async has(key) {
    return this.parent.has(this._prefixKey(key));
  }

  /**
   * Get multiple values from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<Array<any>>} Array of values (null for missing keys)
   */
  async getMany(keys) {
    return this.parent.getMany(this._prefixKeys(keys));
  }

  /**
   * Set multiple values in cache
   * @param {Object} items - Object with key-value pairs
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async setMany(items, ttl) {
    const prefixedItems = {};
    for (const [key, value] of Object.entries(items)) {
      prefixedItems[this._prefixKey(key)] = value;
    }
    return this.parent.setMany(prefixedItems, ttl);
  }

  /**
   * Delete multiple keys from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<number>} Number of keys deleted
   */
  async deleteMany(keys) {
    return this.parent.deleteMany(this._prefixKeys(keys));
  }

  /**
   * Clear all keys in this namespace
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    return this.parent.deletePattern(`${this.prefix}:*`);
  }

  /**
   * Get time-to-live for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds
   */
  async ttl(key) {
    return this.parent.ttl(this._prefixKey(key));
  }

  /**
   * Update expiration for a key
   * @param {string} key - Cache key
   * @param {number} ttl - New TTL in seconds
   * @returns {Promise<boolean>} Success status
   */
  async expire(key, ttl) {
    return this.parent.expire(this._prefixKey(key), ttl);
  }

  /**
   * Delete keys matching a pattern within this namespace
   * @param {string} pattern - Pattern to match
   * @returns {Promise<number>} Number of keys deleted
   */
  async deletePattern(pattern) {
    return this.parent.deletePattern(`${this.prefix}:${pattern}`);
  }

  /**
   * Get all keys matching a pattern within this namespace
   * @param {string} [pattern='*'] - Pattern to match
   * @returns {Promise<string[]>} Array of matching keys
   */
  async keys(pattern = '*') {
    // Get keys with namespace prefix
    const keys = await this.parent.keys(`${this.prefix}:${pattern}`);

    // Remove namespace prefix from returned keys
    const prefixLength = this.prefix.length + 1; // +1 for the colon
    return keys.map((key) => key.slice(prefixLength));
  }

  /**
   * Create a nested namespace
   * @param {string} prefix - Additional prefix
   * @returns {NamespacedCache} Nested namespaced cache
   */
  namespace(prefix) {
    return new NamespacedCache(this.parent, `${this.prefix}:${prefix}`);
  }

  /**
   * Get a value from cache or set it if not found
   * @param {string} key - Cache key
   * @param {Function} factory - Function to generate value on cache miss
   * @param {number} [ttl] - Time to live in seconds
   * @returns {Promise<any>} Cached or generated value
   */
  async getOrSet(key, factory, ttl) {
    const prefixedKey = this._prefixKey(key);
    return this.parent.getOrSet(prefixedKey, factory, ttl);
  }

  /**
   * Close the cache connection (delegates to parent)
   * @returns {Promise<void>}
   */
  async disconnect() {
    return this.parent.disconnect();
  }
}
