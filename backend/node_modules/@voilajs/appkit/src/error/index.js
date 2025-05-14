/**
 * @voilajs/appkit - Error module
 * @module @voilajs/appkit/error
 */

// Main exports file with all available functions
export {
  AppError,
  ErrorTypes,
  createError,
  validationError,
  notFoundError,
  authenticationError,
  authorizationError,
  conflictError,
  badRequestError,
  rateLimitError,
  serviceUnavailableError,
  internalError,
} from './errors.js';

export {
  formatErrorResponse,
  createErrorHandler,
  asyncHandler,
  notFoundHandler,
  handleUnhandledRejections,
  handleUncaughtExceptions,
  validateRequest,
} from './handlers.js';
