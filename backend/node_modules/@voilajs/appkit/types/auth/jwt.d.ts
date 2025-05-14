/**
 * Generates a JWT token
 * @param {Object} payload - Token payload
 * @param {Object} options - Token options
 * @param {string} options.secret - JWT secret key
 * @param {string} [options.expiresIn='7d'] - Token expiration time
 * @param {string} [options.algorithm='HS256'] - JWT algorithm
 * @returns {string} Generated JWT token
 * @throws {Error} If payload or secret is invalid
 */
export function generateToken(payload: any, options: {
    secret: string;
    expiresIn?: string;
    algorithm?: string;
}): string;
/**
 * Verifies and decodes a JWT token
 * @param {string} token - JWT token to verify
 * @param {Object} options - Verification options
 * @param {string} options.secret - JWT secret key
 * @param {string[]} [options.algorithms=['HS256']] - Allowed algorithms
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token: string, options: {
    secret: string;
    algorithms?: string[];
}): any;
