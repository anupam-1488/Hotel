/**
 * Initializes cache with specified strategy
 * @param {string} strategy - Cache strategy ('redis', 'memcached', 'memory')
 * @param {Object} config - Cache configuration
 * @returns {Promise<CacheStrategy>} Cache strategy instance
 */
export function initCache(strategy: string, config: any): Promise<CacheStrategy>;
/**
 * Gets current cache instance
 * @returns {CacheStrategy} Cache strategy instance
 */
export function getCache(): CacheStrategy;
/**
 * Closes cache connection
 * @returns {Promise<void>}
 */
export function closeCache(): Promise<void>;
