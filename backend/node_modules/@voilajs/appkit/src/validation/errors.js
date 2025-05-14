/**
 * @voilajs/appkit - Validation errors
 * @module @voilajs/appkit/validation/errors
 */

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  /**
   * Get formatted error messages
   * @returns {Array<string>} Error messages
   */
  getMessages() {
    return this.errors.map((error) => {
      if (error.path) {
        return `${error.path}: ${error.message}`;
      }
      return error.message;
    });
  }

  /**
   * Get errors by field path
   * @param {string} path - Field path
   * @returns {Array<Object>} Field errors
   */
  getFieldErrors(path) {
    return this.errors.filter((error) => error.path === path);
  }

  /**
   * Check if field has errors
   * @param {string} path - Field path
   * @returns {boolean} Has errors
   */
  hasFieldErrors(path) {
    return this.errors.some((error) => error.path === path);
  }

  /**
   * Convert to plain object
   * @returns {Object} Error object
   */
  toJSON() {
    return {
      message: this.message,
      errors: this.errors,
    };
  }
}
