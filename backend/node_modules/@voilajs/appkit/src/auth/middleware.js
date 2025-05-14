/**
 * @voilajs/appkit - Authentication middleware
 * @module @voilajs/appkit/auth/middleware
 */

import { verifyToken } from './jwt.js';

/**
 * Creates authentication middleware
 * @param {Object} options - Middleware options
 * @param {Function} [options.getToken] - Function to extract token from request
 * @param {string} options.secret - JWT secret key
 * @param {Function} [options.onError] - Custom error handler
 * @returns {Function} Express middleware function
 */
export function createAuthMiddleware(options) {
  if (!options?.secret) {
    throw new Error('JWT secret is required');
  }

  // Smart default: check Authorization header, then cookies, then query
  const defaultGetToken = (req) => {
    // 1. Check Authorization header (most common)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    
    // 2. Check cookies (for web apps)
    if (req.cookies?.token) {
      return req.cookies.token;
    }
    
    // 3. Check query params (for special cases like email links)
    if (req.query?.token) {
      return req.query.token;
    }
    
    return null;
  };

  const {
    getToken = defaultGetToken,
    secret,
    onError = defaultAuthErrorHandler
  } = options;

  return async (req, res, next) => {
    try {
      const token = getToken(req);
      
      if (!token) {
        throw new Error('No token provided');
      }

      const payload = verifyToken(token, { secret });
      req.user = payload;
      next();
    } catch (error) {
      onError(error, req, res);
    }
  };
}

/**
 * Creates authorization middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 * @param {Object} [options={}] - Middleware options
 * @param {Function} [options.getRoles] - Function to extract roles from request
 * @returns {Function} Express middleware function
 */
export function createAuthorizationMiddleware(allowedRoles, options = {}) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('allowedRoles must be a non-empty array');
  }

  const {
    getRoles = defaultGetRoles
  } = options;

  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new Error('Authentication required');
      }

      const userRoles = getRoles(req);
      
      if (!userRoles || userRoles.length === 0) {
        throw new Error('No roles found for user');
      }

      const hasRole = userRoles.some(role => allowedRoles.includes(role));
      
      if (!hasRole) {
        throw new Error('Insufficient permissions');
      }

      next();
    } catch (error) {
      res.status(403).json({
        error: 'Authorization failed',
        message: error.message
      });
    }
  };
}

/**
 * Default error handler for auth middleware
 * @private
 */
function defaultAuthErrorHandler(error, req, res) {
  // Map technical errors to user-friendly messages
  const errorResponses = {
    'No token provided': { 
      status: 401, 
      message: 'Authentication required' 
    },
    'Token has expired': { 
      status: 401, 
      message: 'Your session has expired. Please sign in again.' 
    },
    'Invalid token': { 
      status: 401, 
      message: 'Invalid authentication. Please sign in again.' 
    },
    'jwt malformed': { 
      status: 401, 
      message: 'Invalid authentication. Please sign in again.' 
    },
    'jwt signature is required': { 
      status: 401, 
      message: 'Invalid authentication. Please sign in again.' 
    },
    'invalid signature': { 
      status: 401, 
      message: 'Invalid authentication. Please sign in again.' 
    }
  };

  const errorResponse = errorResponses[error.message] || {
    status: 401,
    message: 'Authentication failed'
  };

  res.status(errorResponse.status).json({
    error: 'Authentication failed',
    message: errorResponse.message
  });
}

/**
 * Default function to extract roles from request
 * @private
 */
function defaultGetRoles(req) {
  return req.user?.roles || [];
}