/**
 * Formats error for API response
 * @param {Error} error - Error to format
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error: Error): any;
/**
 * Creates error handler middleware
 * @param {Object} [options] - Handler options
 * @param {Function} [options.logger] - Logger function
 * @param {boolean} [options.includeStack=false] - Include stack trace in response
 * @returns {Function} Express error middleware
 */
export function createErrorHandler(options?: {
    logger?: Function;
    includeStack?: boolean;
}): Function;
/**
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export function asyncHandler(fn: Function): Function;
/**
 * Creates a not found handler middleware
 * @returns {Function} Express middleware
 */
export function notFoundHandler(): Function;
/**
 * Handles unhandled promise rejections
 * @param {Function} [logger] - Logger function
 */
export function handleUnhandledRejections(logger?: Function): void;
/**
 * Handles uncaught exceptions
 * @param {Function} [logger] - Logger function
 */
export function handleUncaughtExceptions(logger?: Function): void;
/**
 * Validates request body against schema
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
export function validateRequest(schema: any): Function;
