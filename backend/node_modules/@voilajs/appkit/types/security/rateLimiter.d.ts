/**
 * @voilajs/appkit - Rate limiting middleware
 * @module @voilajs/appkit/security/rateLimiter
 */
/**
 * Creates rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} [options.message] - Error message
 * @param {Function} [options.keyGenerator] - Function to generate key
 * @returns {Function} Express middleware function
 */
export function createRateLimiter(options: {
    windowMs: number;
    max: number;
    message?: string;
    keyGenerator?: Function;
}): Function;
