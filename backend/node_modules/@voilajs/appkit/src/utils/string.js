/**
 * @voilajs/appkit - String utilities
 * @module @voilajs/appkit/utils/string
 */

import crypto from 'crypto';

/**
 * Capitalizes first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts string to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 */
export function camelCase(str) {
  if (!str) return '';

  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
}

/**
 * Converts string to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 */
export function snakeCase(str) {
  if (!str) return '';

  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Converts string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} kebab-case string
 */
export function kebabCase(str) {
  if (!str) return '';

  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts string to PascalCase
 * @param {string} str - String to convert
 * @returns {string} PascalCase string
 */
export function pascalCase(str) {
  if (!str) return '';

  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[a-z]/, (chr) => chr.toUpperCase());
}

/**
 * Converts string to Title Case
 * @param {string} str - String to convert
 * @returns {string} Title Case string
 */
export function titleCase(str) {
  if (!str) return '';

  return str.toLowerCase().replace(/(?:^|\s)\S/g, (chr) => chr.toUpperCase());
}

/**
 * Generates random ID
 * @param {number} length - ID length
 * @param {string} prefix - Optional prefix
 * @returns {string} Random ID
 */
export function generateId(length = 16, prefix = '') {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = prefix;

  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return id;
}

/**
 * Generates UUID v4
 * @returns {string} UUID
 */
export function generateUuid() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates URL-friendly slug
 * @param {string} str - String to slugify
 * @param {Object} options - Slugify options
 * @returns {string} Slug
 */
export function slugify(str, options = {}) {
  const {
    separator = '-',
    lowercase = true,
    strict = false,
    maxLength = 100,
  } = options;

  if (!str) return '';

  let slug = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim();

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  if (strict) {
    slug = slug.replace(/[^a-zA-Z0-9]+/g, separator);
  } else {
    slug = slug
      .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and dashes)
      .replace(/[\s_-]+/g, separator); // Replace spaces, underscores and dashes with separator
  }

  // Remove multiple separators and trim separators from ends
  slug = slug
    .replace(new RegExp(`${separator}+`, 'g'), separator)
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

  if (maxLength && slug.length > maxLength) {
    slug = slug
      .substring(0, maxLength)
      .replace(new RegExp(`${separator}$`), '');
  }

  return slug;
}

/**
 * Truncates string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix for truncated strings
 * @returns {string} Truncated string
 */
export function truncate(str, length, suffix = '...') {
  if (!str || str.length <= length) return str;

  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Pads string start
 * @param {string} str - String to pad
 * @param {number} length - Target length
 * @param {string} char - Pad character
 * @returns {string} Padded string
 */
export function padStart(str, length, char = ' ') {
  str = String(str);
  if (str.length >= length) return str;

  const padLength = length - str.length;
  const pad = char
    .repeat(Math.ceil(padLength / char.length))
    .substring(0, padLength);

  return pad + str;
}

/**
 * Pads string end
 * @param {string} str - String to pad
 * @param {number} length - Target length
 * @param {string} char - Pad character
 * @returns {string} Padded string
 */
export function padEnd(str, length, char = ' ') {
  str = String(str);
  if (str.length >= length) return str;

  const padLength = length - str.length;
  const pad = char
    .repeat(Math.ceil(padLength / char.length))
    .substring(0, padLength);

  return str + pad;
}

/**
 * Simple template function
 * @param {string} str - Template string
 * @param {Object} data - Template data
 * @returns {string} Rendered string
 */
export function template(str, data) {
  if (!str || !data) return str;

  return str.replace(/\${([^}]+)}/g, (match, key) => {
    const keys = key.trim().split('.');
    let value = data;

    for (const k of keys) {
      if (value == null) return match;
      value = value[k];
    }

    return value != null ? value : match;
  });
}

/**
 * Escapes HTML entities
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (!str) return '';

  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return String(str).replace(/[&<>"'/]/g, (char) => escapeMap[char]);
}

/**
 * Unescapes HTML entities
 * @param {string} str - String to unescape
 * @returns {string} Unescaped string
 */
export function unescapeHtml(str) {
  if (!str) return '';

  const unescapeMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
  };

  return String(str).replace(
    /&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/g,
    (entity) => unescapeMap[entity]
  );
}

/**
 * Escapes RegExp special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeRegExp(str) {
  if (!str) return '';

  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Masks sensitive string data
 * @param {string} str - String to mask
 * @param {Object} options - Mask options
 * @returns {string} Masked string
 */
export function maskString(str, options = {}) {
  if (!str) return '';

  const {
    showFirst = 0,
    showLast = 0,
    maskChar = '*',
    minMaskLength = 3,
  } = options;

  str = String(str);
  const length = str.length;
  const visibleLength = showFirst + showLast;

  if (length <= visibleLength) {
    return maskChar.repeat(Math.max(length, minMaskLength));
  }

  const start = str.substring(0, showFirst);
  const end = str.substring(length - showLast);
  const maskLength = Math.max(length - visibleLength, minMaskLength);
  const mask = maskChar.repeat(maskLength);

  return start + mask + end;
}
