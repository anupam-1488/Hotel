/**
 * @voilajs/appkit - Base cache strategy
 * @module @voilajs/appkit/cache/strategies/base
 */
/**
 * Base cache strategy interface
 * @abstract
 */
export class CacheStrategy {
    constructor(config: any);
    config: any;
    /**
     * Connect to cache backend
     * @abstract
     * @returns {Promise<void>}
     */
    connect(): Promise<void>;
    /**
     * Disconnect from cache backend
     * @abstract
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
    /**
     * Get value from cache
     * @abstract
     * @param {string} key - Cache key
     * @returns {Promise<any>} Cached value or null
     */
    get(key: string): Promise<any>;
    /**
     * Set value in cache
     * @abstract
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} [ttl] - Time to live in seconds
     * @returns {Promise<boolean>} Success status
     */
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    /**
     * Delete key from cache
     * @abstract
     * @param {string} key - Cache key
     * @returns {Promise<boolean>} Success status
     */
    delete(key: string): Promise<boolean>;
    /**
     * Clear entire cache
     * @abstract
     * @returns {Promise<boolean>} Success status
     */
    clear(): Promise<boolean>;
    /**
     * Get multiple values
     * @param {string[]} keys - Array of cache keys
     * @returns {Promise<Object>} Object with key-value pairs
     */
    getMany(keys: string[]): Promise<any>;
    /**
     * Set multiple values
     * @param {Object} items - Object with key-value pairs
     * @param {number} [ttl] - Time to live in seconds
     * @returns {Promise<boolean>} Success status
     */
    setMany(items: any, ttl?: number): Promise<boolean>;
    /**
     * Delete multiple keys
     * @param {string[]} keys - Array of cache keys
     * @returns {Promise<number>} Number of keys deleted
     */
    deleteMany(keys: string[]): Promise<number>;
    /**
     * Check if key exists
     * @param {string} key - Cache key
     * @returns {Promise<boolean>} True if exists
     */
    has(key: string): Promise<boolean>;
}
