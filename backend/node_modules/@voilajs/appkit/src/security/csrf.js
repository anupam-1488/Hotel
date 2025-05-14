/**
 * @voilajs/appkit - CSRF protection utilities
 * @module @voilajs/appkit/security/csrf
 */

import crypto from 'crypto';

/**
 * Generates a CSRF token
 * @param {Object} session - Session object
 * @param {number} [expiryMinutes=60] - Minutes until token expires
 * @returns {string} CSRF token
 */
export function generateCsrfToken(session, expiryMinutes = 60) {
  if (!session || typeof session !== 'object') {
    throw new Error('Session object is required');
  }

  // Generate a random token
  const token = crypto.randomBytes(16).toString('hex');

  // Store in session with expiration
  session.csrfToken = token;
  session.csrfTokenExpiry = Date.now() + expiryMinutes * 60 * 1000;

  return token;
}

/**
 * Validates a CSRF token
 * @param {string} token - Token to validate
 * @param {Object} session - Session object
 * @returns {boolean} True if valid
 */
export function validateCsrfToken(token, session) {
  if (
    !token ||
    typeof token !== 'string' ||
    !session ||
    typeof session !== 'object'
  ) {
    return false;
  }

  // Check expiration
  if (session.csrfTokenExpiry && Date.now() > session.csrfTokenExpiry) {
    return false;
  }

  // Compare tokens
  return session.csrfToken === token;
}

/**
 * Creates CSRF middleware
 * @param {Object} [options] - Middleware options
 * @param {string} [options.tokenField='_csrf'] - Field name for token in body
 * @param {string} [options.headerField='x-csrf-token'] - Header field name
 * @returns {Function} Express middleware function
 */
export function createCsrfMiddleware(options = {}) {
  const { tokenField = '_csrf', headerField = 'x-csrf-token' } = options;

  return (req, res, next) => {
    // Skip GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Get token from request
    const token =
      (req.body && req.body[tokenField]) ||
      (req.headers && req.headers[headerField.toLowerCase()]) ||
      (req.query && req.query[tokenField]);

    // Validate token
    if (!validateCsrfToken(token, req.session)) {
      const error = new Error('Invalid CSRF token');
      error.code = 'EBADCSRFTOKEN';
      error.status = 403;
      return next(error);
    }

    next();
  };
}
