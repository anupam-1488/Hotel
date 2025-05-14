/**
 * @voilajs/appkit - Input sanitization utilities
 * @module @voilajs/appkit/security/sanitizer
 */

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes special characters in a string to prevent XSS
 * @param {string} input - String to escape
 * @returns {string} Escaped string
 */
export function escapeString(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return input.replace(/[&<>"'/]/g, (char) => ESCAPE_MAP[char]);
}

/**
 * Sanitizes HTML input by removing dangerous elements
 * @param {string} input - HTML string to sanitize
 * @param {Object} [options] - Sanitization options
 * @param {boolean} [options.stripAllTags=false] - Remove all tags
 * @param {string[]} [options.allowedTags] - Only allow specific tags
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(input, options = {}) {
  if (typeof input !== 'string') {
    return '';
  }

  // Option to strip all tags
  if (options.stripAllTags) {
    return input.replace(/<[^>]*>/g, '');
  }

  let sanitized = input
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove dangerous protocols
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '');

  // Filter to allowed tags if specified
  if (Array.isArray(options.allowedTags) && options.allowedTags.length > 0) {
    try {
      const allowedPattern = options.allowedTags.join('|');
      const tagPattern = new RegExp(
        `<(?!\/?(?:${allowedPattern})\\b)[^>]+>`,
        'gi'
      );
      sanitized = sanitized.replace(tagPattern, '');
    } catch (e) {
      // If regex fails, fall back to removing all tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
  }

  return sanitized;
}

/**
 * Sanitizes a filename to prevent path traversal attacks
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') {
    return '';
  }

  // Remove path traversal sequences and limit to safe characters
  const sanitized = filename
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '');

  return sanitized.slice(0, 255);
}
