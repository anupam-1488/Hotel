/**
 * Creates authentication middleware
 * @param {Object} options - Middleware options
 * @param {Function} [options.getToken] - Function to extract token from request
 * @param {string} options.secret - JWT secret key
 * @param {Function} [options.onError] - Custom error handler
 * @returns {Function} Express middleware function
 */
export function createAuthMiddleware(options: {
    getToken?: Function;
    secret: string;
    onError?: Function;
}): Function;
/**
 * Creates authorization middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 * @param {Object} [options={}] - Middleware options
 * @param {Function} [options.getRoles] - Function to extract roles from request
 * @returns {Function} Express middleware function
 */
export function createAuthorizationMiddleware(allowedRoles: string[], options?: {
    getRoles?: Function;
}): Function;
