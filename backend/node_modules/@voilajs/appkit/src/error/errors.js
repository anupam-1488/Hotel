/**
 * @voilajs/appkit - Custom error classes
 * @module @voilajs/appkit/error/errors
 */

/**
 * Error types enumeration
 */
export const ErrorTypes = {
    VALIDATION: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    AUTHENTICATION: 'AUTHENTICATION_ERROR',
    AUTHORIZATION: 'AUTHORIZATION_ERROR',
    CONFLICT: 'CONFLICT',
    INTERNAL: 'INTERNAL_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
    RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
  };
  
  /**
   * Custom application error class
   * @extends Error
   */
  export class AppError extends Error {
    /**
     * Creates an application error
     * @param {string} type - Error type from ErrorTypes
     * @param {string} message - Error message
     * @param {Object} [details] - Additional error details
     * @param {number} [statusCode=500] - HTTP status code
     */
    constructor(type, message, details = null, statusCode = 500) {
      super(message);
      
      this.name = 'AppError';
      this.type = type;
      this.message = message;
      this.details = details;
      this.statusCode = statusCode;
      this.timestamp = new Date().toISOString();
      
      // Capture stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  
    /**
     * Converts error to JSON-serializable object
     * @returns {Object} Error object
     */
    toJSON() {
      return {
        type: this.type,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp
      };
    }
  }
  
  /**
   * Creates a custom error
   * @param {string} type - Error type
   * @param {string} message - Error message
   * @param {Object} [details] - Additional details
   * @returns {AppError} Application error instance
   */
  export function createError(type, message, details = null) {
    // Map error types to status codes
    const statusCodes = {
      [ErrorTypes.VALIDATION]: 400,
      [ErrorTypes.NOT_FOUND]: 404,
      [ErrorTypes.AUTHENTICATION]: 401,
      [ErrorTypes.AUTHORIZATION]: 403,
      [ErrorTypes.CONFLICT]: 409,
      [ErrorTypes.BAD_REQUEST]: 400,
      [ErrorTypes.RATE_LIMIT]: 429,
      [ErrorTypes.SERVICE_UNAVAILABLE]: 503,
      [ErrorTypes.INTERNAL]: 500
    };
  
    const statusCode = statusCodes[type] || 500;
    return new AppError(type, message, details, statusCode);
  }
  
  /**
   * Creates a validation error
   * @param {Object} errors - Validation errors object
   * @returns {AppError} Validation error instance
   */
  export function validationError(errors) {
    return createError(
      ErrorTypes.VALIDATION,
      'Validation failed',
      { errors }
    );
  }
  
  /**
   * Creates a not found error
   * @param {string} entity - Entity type that was not found
   * @param {string} id - Entity identifier
   * @returns {AppError} Not found error instance
   */
  export function notFoundError(entity, id) {
    return createError(
      ErrorTypes.NOT_FOUND,
      `${entity} not found`,
      { entity, id }
    );
  }
  
  /**
   * Creates an authentication error
   * @param {string} [message='Authentication failed'] - Error message
   * @returns {AppError} Authentication error instance
   */
  export function authenticationError(message = 'Authentication failed') {
    return createError(
      ErrorTypes.AUTHENTICATION,
      message
    );
  }
  
  /**
   * Creates an authorization error
   * @param {string} [message='Insufficient permissions'] - Error message
   * @returns {AppError} Authorization error instance
   */
  export function authorizationError(message = 'Insufficient permissions') {
    return createError(
      ErrorTypes.AUTHORIZATION,
      message
    );
  }
  
  /**
   * Creates a conflict error
   * @param {string} message - Error message
   * @param {Object} [details] - Conflict details
   * @returns {AppError} Conflict error instance
   */
  export function conflictError(message, details = null) {
    return createError(
      ErrorTypes.CONFLICT,
      message,
      details
    );
  }
  
  /**
   * Creates a bad request error
   * @param {string} message - Error message
   * @param {Object} [details] - Error details
   * @returns {AppError} Bad request error instance
   */
  export function badRequestError(message, details = null) {
    return createError(
      ErrorTypes.BAD_REQUEST,
      message,
      details
    );
  }
  
  /**
   * Creates a rate limit error
   * @param {string} [message='Rate limit exceeded'] - Error message
   * @param {Object} [details] - Rate limit details
   * @returns {AppError} Rate limit error instance
   */
  export function rateLimitError(message = 'Rate limit exceeded', details = null) {
    return createError(
      ErrorTypes.RATE_LIMIT,
      message,
      details
    );
  }
  
  /**
   * Creates a service unavailable error
   * @param {string} [message='Service temporarily unavailable'] - Error message
   * @returns {AppError} Service unavailable error instance
   */
  export function serviceUnavailableError(message = 'Service temporarily unavailable') {
    return createError(
      ErrorTypes.SERVICE_UNAVAILABLE,
      message
    );
  }
  
  /**
   * Creates an internal server error
   * @param {string} [message='Internal server error'] - Error message
   * @param {Object} [details] - Error details
   * @returns {AppError} Internal error instance
   */
  export function internalError(message = 'Internal server error', details = null) {
    return createError(
      ErrorTypes.INTERNAL,
      message,
      details
    );
  }