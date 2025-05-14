/**
 * @voilajs/appkit - Password hashing utilities
 * @module @voilajs/appkit/auth/password
 */

import bcrypt from 'bcrypt';

/**
 * Hashes a password using bcrypt
 * @param {string} password - Password to hash
 * @param {number} [rounds=10] - Number of salt rounds
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If password is invalid
 */
export async function hashPassword(password, rounds = 10) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  // Removed minimum length check for flexibility
  if (password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  try {
    return await bcrypt.hash(password, rounds);
  } catch (error) {
    throw new Error(`Failed to hash password: ${error.message}`);
  }
}

/**
 * Compares a password with a hash
 * @param {string} password - Password to compare
 * @param {string} hash - Hash to compare against
 * @returns {Promise<boolean>} True if password matches hash
 * @throws {Error} If password or hash is invalid
 */
export async function comparePassword(password, hash) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (!hash || typeof hash !== 'string') {
    throw new Error('Hash must be a non-empty string');
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Failed to compare password: ${error.message}`);
  }
}