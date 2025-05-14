/**
 * Creates a custom error
 * @param {string} type - Error type
 * @param {string} message - Error message
 * @param {Object} [details] - Additional details
 * @returns {AppError} Application error instance
 */
export function createError(type: string, message: string, details?: any): AppError;
/**
 * Creates a validation error
 * @param {Object} errors - Validation errors object
 * @returns {AppError} Validation error instance
 */
export function validationError(errors: any): AppError;
/**
 * Creates a not found error
 * @param {string} entity - Entity type that was not found
 * @param {string} id - Entity identifier
 * @returns {AppError} Not found error instance
 */
export function notFoundError(entity: string, id: string): AppError;
/**
 * Creates an authentication error
 * @param {string} [message='Authentication failed'] - Error message
 * @returns {AppError} Authentication error instance
 */
export function authenticationError(message?: string): AppError;
/**
 * Creates an authorization error
 * @param {string} [message='Insufficient permissions'] - Error message
 * @returns {AppError} Authorization error instance
 */
export function authorizationError(message?: string): AppError;
/**
 * Creates a conflict error
 * @param {string} message - Error message
 * @param {Object} [details] - Conflict details
 * @returns {AppError} Conflict error instance
 */
export function conflictError(message: string, details?: any): AppError;
/**
 * Creates a bad request error
 * @param {string} message - Error message
 * @param {Object} [details] - Error details
 * @returns {AppError} Bad request error instance
 */
export function badRequestError(message: string, details?: any): AppError;
/**
 * Creates a rate limit error
 * @param {string} [message='Rate limit exceeded'] - Error message
 * @param {Object} [details] - Rate limit details
 * @returns {AppError} Rate limit error instance
 */
export function rateLimitError(message?: string, details?: any): AppError;
/**
 * Creates a service unavailable error
 * @param {string} [message='Service temporarily unavailable'] - Error message
 * @returns {AppError} Service unavailable error instance
 */
export function serviceUnavailableError(message?: string): AppError;
/**
 * Creates an internal server error
 * @param {string} [message='Internal server error'] - Error message
 * @param {Object} [details] - Error details
 * @returns {AppError} Internal error instance
 */
export function internalError(message?: string, details?: any): AppError;
export namespace ErrorTypes {
    let VALIDATION: string;
    let NOT_FOUND: string;
    let AUTHENTICATION: string;
    let AUTHORIZATION: string;
    let CONFLICT: string;
    let INTERNAL: string;
    let BAD_REQUEST: string;
    let RATE_LIMIT: string;
    let SERVICE_UNAVAILABLE: string;
}
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
    constructor(type: string, message: string, details?: any, statusCode?: number);
    type: string;
    details: any;
    statusCode: number;
    timestamp: string;
    /**
     * Converts error to JSON-serializable object
     * @returns {Object} Error object
     */
    toJSON(): any;
}
