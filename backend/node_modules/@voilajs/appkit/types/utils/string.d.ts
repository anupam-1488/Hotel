/**
 * Capitalizes first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str: string): string;
/**
 * Converts string to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
export function camelCase(str: string): string;
/**
 * Converts string to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 */
export function snakeCase(str: string): string;
/**
 * Converts string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} kebab-case string
 */
export function kebabCase(str: string): string;
/**
 * Converts string to PascalCase
 * @param {string} str - String to convert
 * @returns {string} PascalCase string
 */
export function pascalCase(str: string): string;
/**
 * Converts string to Title Case
 * @param {string} str - String to convert
 * @returns {string} Title Case string
 */
export function titleCase(str: string): string;
/**
 * Generates random ID
 * @param {number} length - ID length
 * @param {string} prefix - Optional prefix
 * @returns {string} Random ID
 */
export function generateId(length?: number, prefix?: string): string;
/**
 * Generates UUID v4
 * @returns {string} UUID
 */
export function generateUuid(): string;
/**
 * Creates URL-friendly slug
 * @param {string} str - String to slugify
 * @param {Object} options - Slugify options
 * @returns {string} Slug
 */
export function slugify(str: string, options?: any): string;
/**
 * Truncates string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix for truncated strings
 * @returns {string} Truncated string
 */
export function truncate(str: string, length: number, suffix?: string): string;
/**
 * Pads string start
 * @param {string} str - String to pad
 * @param {number} length - Target length
 * @param {string} char - Pad character
 * @returns {string} Padded string
 */
export function padStart(str: string, length: number, char?: string): string;
/**
 * Pads string end
 * @param {string} str - String to pad
 * @param {number} length - Target length
 * @param {string} char - Pad character
 * @returns {string} Padded string
 */
export function padEnd(str: string, length: number, char?: string): string;
/**
 * Simple template function
 * @param {string} str - Template string
 * @param {Object} data - Template data
 * @returns {string} Rendered string
 */
export function template(str: string, data: any): string;
/**
 * Escapes HTML entities
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str: string): string;
/**
 * Unescapes HTML entities
 * @param {string} str - String to unescape
 * @returns {string} Unescaped string
 */
export function unescapeHtml(str: string): string;
/**
 * Escapes RegExp special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeRegExp(str: string): string;
/**
 * Masks sensitive string data
 * @param {string} str - String to mask
 * @param {Object} options - Mask options
 * @returns {string} Masked string
 */
export function maskString(str: string, options?: any): string;
