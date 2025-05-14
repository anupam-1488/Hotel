/**
 * @voilajs/appkit - Cache factory
 * @module @voilajs/appkit/cache/factory
 */

import { RedisStrategy } from './strategies/redis.js';
import { MemcachedStrategy } from './strategies/memcached.js';
import { MemoryStrategy } from './strategies/memory.js';
import { CacheWrapper } from './wrapper.js';

const strategies = {
  redis: RedisStrategy,
  memcached: MemcachedStrategy,
  memory: MemoryStrategy,
};

/**
 * Creates a new cache instance with the specified options
 * @param {Object} options - Cache options
 * @param {string} [options.strategy='memory'] - Cache strategy ('redis', 'memcached', 'memory')
 * @param {string} [options.url] - Connection URL (for Redis)
 * @param {string[]} [options.servers] - Server list (for Memcached)
 * @param {number} [options.maxItems] - Maximum items (for Memory)
 * @param {string} [options.keyPrefix] - Key prefix for all cache keys
 * @param {number} [options.defaultTTL] - Default TTL in seconds
 * @param {Object} [options.serializer] - Custom serializer
 * @returns {Promise<Object>} Cache instance
 * @throws {Error} If strategy is invalid or connection fails
 */
export async function createCache(options = {}) {
  const { strategy = 'memory', ...config } = options;

  const StrategyClass = strategies[strategy];
  if (!StrategyClass) {
    throw new Error(`Unknown cache strategy: ${strategy}`);
  }

  const instance = new StrategyClass(config);
  await instance.connect();

  // Wrap the strategy instance to provide a more convenient API
  return new CacheWrapper(instance);
}
