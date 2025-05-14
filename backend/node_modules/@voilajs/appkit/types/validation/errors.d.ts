/**
 * @voilajs/appkit - Validation errors
 * @module @voilajs/appkit/validation/errors
 */
/**
 * Validation error class
 */
export class ValidationError extends Error {
    constructor(message: any, errors?: any[]);
    errors: any[];
    /**
     * Get formatted error messages
     * @returns {Array<string>} Error messages
     */
    getMessages(): Array<string>;
    /**
     * Get errors by field path
     * @param {string} path - Field path
     * @returns {Array<Object>} Field errors
     */
    getFieldErrors(path: string): Array<any>;
    /**
     * Check if field has errors
     * @param {string} path - Field path
     * @returns {boolean} Has errors
     */
    hasFieldErrors(path: string): boolean;
    /**
     * Convert to plain object
     * @returns {Object} Error object
     */
    toJSON(): any;
}
