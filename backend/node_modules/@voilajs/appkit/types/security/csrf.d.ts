/**
 * Generates a CSRF token
 * @param {Object} session - Session object
 * @returns {string} CSRF token
 */
export function generateCsrfToken(session: any): string;
/**
 * Validates a CSRF token
 * @param {string} token - Token to validate
 * @param {Object} session - Session object
 * @returns {boolean} True if valid
 */
export function validateCsrfToken(token: string, session: any): boolean;
/**
 * Creates CSRF middleware
 * @param {Object} [options] - Middleware options
 * @param {string} [options.tokenField='_csrf'] - Field name for token in body
 * @param {string} [options.headerField='x-csrf-token'] - Header field name
 * @returns {Function} Express middleware function
 */
export function createCsrfMiddleware(options?: {
    tokenField?: string;
    headerField?: string;
}): Function;
