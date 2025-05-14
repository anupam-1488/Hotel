/**
 * @voilajs/appkit - Authentication module
 * @module @voilajs/appkit/auth
 */

// Main exports file - re-exports all auth utilities
export { generateToken, verifyToken } from './jwt.js';
export { hashPassword, comparePassword } from './password.js';
export { createAuthMiddleware, createAuthorizationMiddleware } from './middleware.js';