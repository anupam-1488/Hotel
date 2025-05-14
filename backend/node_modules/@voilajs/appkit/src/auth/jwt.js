/**
 * @voilajs/appkit - JWT utilities
 * @module @voilajs/appkit/auth/jwt
 */

import jwt from 'jsonwebtoken';

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
export function generateToken(payload, options) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }
  
  if (!options?.secret) {
    throw new Error('JWT secret is required');
  }

  const {
    secret,
    expiresIn = '7d',  // Changed from '1h' to '7d' for better UX
    algorithm = 'HS256'
  } = options;

  try {
    return jwt.sign(payload, secret, {
      expiresIn,
      algorithm
    });
  } catch (error) {
    throw new Error(`Failed to generate token: ${error.message}`);
  }
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token - JWT token to verify
 * @param {Object} options - Verification options
 * @param {string} options.secret - JWT secret key
 * @param {string[]} [options.algorithms=['HS256']] - Allowed algorithms
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token, options) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a string');
  }
  
  if (!options?.secret) {
    throw new Error('JWT secret is required');
  }

  const {
    secret,
    algorithms = ['HS256']
  } = options;

  try {
    return jwt.verify(token, secret, {
      algorithms
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
}