/**
 * @voilajs/appkit - Input sanitization utilities
 * @module @voilajs/appkit/security/sanitizer
 */
/**
 * Sanitizes HTML input
 * @param {string} input - HTML string to sanitize
 * @param {Object} [options] - Sanitization options
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(input: string, options?: any): string;
/**
 * Escapes special characters in a string
 * @param {string} input - String to escape
 * @returns {string} Escaped string
 */
export function escapeString(input: string): string;
/**
 * Escapes HTML for safe display
 * @param {string} input - HTML string to escape
 * @returns {string} Escaped HTML
 */
export function escapeHtml(input: string): string;
/**
 * Sanitizes an object by escaping all string values
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(obj: any): any;
/**
 * Removes potentially dangerous characters from filenames
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename: string): string;
