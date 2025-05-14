/**
 * @voilajs/appkit - Cache key generator
 * @module @voilajs/appkit/cache/key-generator
 */

/**
 * Generates cache key from prefix and parameters
 * @param {string} prefix - Key prefix
 * @param {Object} [params] - Parameters to include in key
 * @returns {string} Generated cache key
 */
export function generateCacheKey(prefix, params) {
  if (!params || Object.keys(params).length === 0) {
    return prefix;
  }

  // Sort parameters for consistent keys
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join(':');

  return `${prefix}:${sortedParams}`;
}
