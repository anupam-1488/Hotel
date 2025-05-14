/**
 * @voilajs/appkit - Sanitizers
 * @module @voilajs/appkit/validation/sanitizers
 */
/**
 * Sanitizes data based on rules
 * @param {*} data - Data to sanitize
 * @param {Object} rules - Sanitization rules
 * @returns {*} Sanitized data
 */
export function sanitize(data: any, rules: any): any;
/**
 * Creates a reusable sanitizer function
 * @param {Object} rules - Sanitization rules
 * @returns {Function} Sanitizer function
 */
export function createSanitizer(rules: any): Function;
/**
 * Sanitizes string value
 * @param {string} input - String to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {string} Sanitized string
 */
export function sanitizeString(input: string, rules?: any): string;
/**
 * Sanitizes HTML content
 * @param {string} input - HTML to sanitize
 * @param {Object} [options] - Sanitization options
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(input: string, options?: any): string;
/**
 * Sanitizes number value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {number} Sanitized number
 */
export function sanitizeNumber(input: any, rules?: any): number;
/**
 * Sanitizes boolean value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {boolean} Sanitized boolean
 */
export function sanitizeBoolean(input: any, rules?: any): boolean;
/**
 * Sanitizes array value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {Array} Sanitized array
 */
export function sanitizeArray(input: any, rules?: any): any[];
/**
 * Sanitizes object value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(input: any, rules?: any): any;
/**
 * Common sanitizers
 */
export function sanitizeEmail(email: any): string;
export function sanitizeUsername(username: any): string;
export function sanitizePassword(password: any): string;
export function sanitizePhone(phone: any): string;
export function sanitizeUrl(url: any): string;
export function sanitizeSlug(slug: any): string;
export function sanitizeSearch(query: any): string;
export function sanitizeCreditCard(card: any): string;
export function sanitizePostalCode(code: any): string;
export function sanitizeTags(tags: any): any[];
