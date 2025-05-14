/**
 * Hashes a password using bcrypt
 * @param {string} password - Password to hash
 * @param {number} [rounds=10] - Number of salt rounds
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If password is invalid
 */
export function hashPassword(password: string, rounds?: number): Promise<string>;
/**
 * Compares a password with a hash
 * @param {string} password - Password to compare
 * @param {string} hash - Hash to compare against
 * @returns {Promise<boolean>} True if password matches hash
 * @throws {Error} If password or hash is invalid
 */
export function comparePassword(password: string, hash: string): Promise<boolean>;
