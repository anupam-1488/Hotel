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
export function sanitize(data, rules) {
  if (typeof rules === 'function') {
    return rules(data);
  }

  if (Array.isArray(rules)) {
    return rules.reduce((result, rule) => sanitize(result, rule), data);
  }

  const type = getType(data);

  switch (type) {
    case 'string':
      return sanitizeString(data, rules);
    case 'number':
      return sanitizeNumber(data, rules);
    case 'boolean':
      return sanitizeBoolean(data, rules);
    case 'array':
      return sanitizeArray(data, rules);
    case 'object':
      return sanitizeObject(data, rules);
    default:
      return data;
  }
}

/**
 * Creates a reusable sanitizer function
 * @param {Object} rules - Sanitization rules
 * @returns {Function} Sanitizer function
 */
export function createSanitizer(rules) {
  return (data) => sanitize(data, rules);
}

/**
 * Sanitizes string value
 * @param {string} input - String to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {string} Sanitized string
 */
export function sanitizeString(input, rules = {}) {
  if (typeof input !== 'string') {
    input = String(input);
  }

  let result = input;

  if (rules.trim !== false) {
    result = result.trim();
  }

  if (rules.lowercase) {
    result = result.toLowerCase();
  }

  if (rules.uppercase) {
    result = result.toUpperCase();
  }

  if (rules.capitalize) {
    result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  }

  if (rules.escape) {
    result = escapeString(result);
  }

  if (rules.truncate) {
    const length = typeof rules.truncate === 'number' ? rules.truncate : 255;
    if (result.length > length) {
      result = result.substring(0, length - 3) + '...';
    }
  }

  if (rules.normalize) {
    result = result.normalize(
      rules.normalize === true ? 'NFC' : rules.normalize
    );
  }

  if (rules.replace) {
    for (const [pattern, replacement] of Object.entries(rules.replace)) {
      result = result.replace(new RegExp(pattern, 'g'), replacement);
    }
  }

  if (rules.remove) {
    if (Array.isArray(rules.remove)) {
      for (const pattern of rules.remove) {
        result = result.replace(new RegExp(pattern, 'g'), '');
      }
    } else {
      result = result.replace(new RegExp(rules.remove, 'g'), '');
    }
  }

  if (rules.slug) {
    result = result
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
  }

  if (rules.alphanumeric) {
    result = result.replace(/[^a-zA-Z0-9]/g, '');
  }

  if (rules.alpha) {
    result = result.replace(/[^a-zA-Z]/g, '');
  }

  if (rules.numeric) {
    result = result.replace(/[^0-9]/g, '');
  }

  if (rules.email) {
    result = result.toLowerCase().trim();
  }

  if (rules.url) {
    try {
      const url = new URL(result);
      result = url.toString();
    } catch {
      // Invalid URL, return as is
    }
  }

  return result;
}

/**
 * Sanitizes HTML content
 * @param {string} input - HTML to sanitize
 * @param {Object} [options] - Sanitization options
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(input, options = {}) {
  const {
    allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    allowedAttributes = {
      a: ['href', 'title', 'target'],
    },
    allowedSchemes = ['http', 'https', 'mailto'],
    stripEmpty = true,
  } = options;

  // Basic HTML sanitization (for demonstration)
  // In production, use a library like DOMPurify
  let result = String(input);

  // Remove script tags
  result = result.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Remove style tags
  result = result.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    ''
  );

  // Remove event handlers
  result = result.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: URLs
  result = result.replace(/javascript\s*:/gi, '');

  // Simple tag validation (production should use proper parser)
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  result = result.replace(tagRegex, (match, tag) => {
    if (!allowedTags.includes(tag.toLowerCase())) {
      return '';
    }
    return match;
  });

  if (stripEmpty) {
    // Remove empty tags
    result = result.replace(/<([^>]+)>\s*<\/\1>/g, '');
  }

  return result;
}

/**
 * Sanitizes number value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {number} Sanitized number
 */
export function sanitizeNumber(input, rules = {}) {
  let result = Number(input);

  if (isNaN(result)) {
    result = rules.default || 0;
  }

  if (rules.integer) {
    result = Math.floor(result);
  }

  if (rules.min !== undefined && result < rules.min) {
    result = rules.min;
  }

  if (rules.max !== undefined && result > rules.max) {
    result = rules.max;
  }

  if (rules.precision !== undefined) {
    result = Number(result.toFixed(rules.precision));
  }

  if (rules.positive && result < 0) {
    result = Math.abs(result);
  }

  if (rules.negative && result > 0) {
    result = -Math.abs(result);
  }

  return result;
}

/**
 * Sanitizes boolean value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {boolean} Sanitized boolean
 */
export function sanitizeBoolean(input, rules = {}) {
  if (typeof input === 'boolean') {
    return input;
  }

  const truthy = rules.truthy || ['true', '1', 'yes', 'on'];
  const falsy = rules.falsy || ['false', '0', 'no', 'off'];

  const stringValue = String(input).toLowerCase();

  if (truthy.includes(stringValue)) {
    return true;
  }

  if (falsy.includes(stringValue)) {
    return false;
  }

  return Boolean(input);
}

/**
 * Sanitizes array value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {Array} Sanitized array
 */
export function sanitizeArray(input, rules = {}) {
  if (!Array.isArray(input)) {
    if (rules.parse && typeof input === 'string') {
      try {
        input = JSON.parse(input);
      } catch {
        input = [];
      }
    } else {
      input = [input];
    }
  }

  let result = [...input];

  if (rules.compact) {
    result = result.filter(
      (item) =>
        item !== null &&
        item !== undefined &&
        item !== '' &&
        (typeof item !== 'number' || !isNaN(item))
    );
  }

  if (rules.unique) {
    result = [...new Set(result)];
  }

  if (rules.items) {
    result = result.map((item) => sanitize(item, rules.items));
  }

  if (rules.filter) {
    result = result.filter(rules.filter);
  }

  if (rules.sort) {
    if (typeof rules.sort === 'function') {
      result.sort(rules.sort);
    } else {
      result.sort();
    }
  }

  if (rules.limit && result.length > rules.limit) {
    result = result.slice(0, rules.limit);
  }

  return result;
}

/**
 * Sanitizes object value
 * @param {*} input - Value to sanitize
 * @param {Object} [rules] - Sanitization rules
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(input, rules = {}) {
  if (typeof input !== 'object' || input === null) {
    if (rules.parse && typeof input === 'string') {
      try {
        input = JSON.parse(input);
      } catch {
        input = {};
      }
    } else {
      input = {};
    }
  }

  let result = { ...input };

  if (rules.pick && Array.isArray(rules.pick)) {
    result = rules.pick.reduce((obj, key) => {
      if (key in input) {
        obj[key] = input[key];
      }
      return obj;
    }, {});
  }

  if (rules.omit && Array.isArray(rules.omit)) {
    for (const key of rules.omit) {
      delete result[key];
    }
  }

  if (rules.rename) {
    for (const [oldKey, newKey] of Object.entries(rules.rename)) {
      if (oldKey in result) {
        result[newKey] = result[oldKey];
        delete result[oldKey];
      }
    }
  }

  if (rules.defaults) {
    result = { ...rules.defaults, ...result };
  }

  if (rules.properties) {
    for (const [key, propRules] of Object.entries(rules.properties)) {
      if (key in result) {
        result[key] = sanitize(result[key], propRules);
      }
    }
  }

  if (rules.filter) {
    for (const [key, value] of Object.entries(result)) {
      if (!rules.filter(value, key)) {
        delete result[key];
      }
    }
  }

  if (rules.mapKeys) {
    const mapped = {};
    for (const [key, value] of Object.entries(result)) {
      const newKey = rules.mapKeys(key);
      mapped[newKey] = value;
    }
    result = mapped;
  }

  if (rules.mapValues) {
    for (const [key, value] of Object.entries(result)) {
      result[key] = rules.mapValues(value, key);
    }
  }

  return result;
}

/**
 * Escapes HTML entities
 * @param {string} input - String to escape
 * @returns {string} Escaped string
 */
function escapeString(input) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return String(input).replace(/[&<>"'/]/g, (char) => escapeMap[char]);
}

/**
 * Gets the type of a value
 * @param {*} value - Value to check
 * @returns {string} Type name
 */
function getType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  return typeof value;
}

/**
 * Common sanitizers
 */

export function sanitizeEmail(email) {
  return sanitizeString(email, {
    trim: true,
    lowercase: true,
    email: true,
  });
}

export function sanitizeUsername(username) {
  return sanitizeString(username, {
    trim: true,
    lowercase: true,
    alphanumeric: true,
    truncate: 32,
  });
}

export function sanitizePassword(password) {
  return sanitizeString(password, {
    trim: false, // Don't trim passwords
    truncate: 128,
  });
}

export function sanitizePhone(phone) {
  return sanitizeString(phone, {
    trim: true,
    numeric: true,
    truncate: 15,
  });
}

export function sanitizeUrl(url) {
  return sanitizeString(url, {
    trim: true,
    url: true,
  });
}

export function sanitizeSlug(slug) {
  return sanitizeString(slug, {
    trim: true,
    slug: true,
    truncate: 100,
  });
}

export function sanitizeSearch(query) {
  return sanitizeString(query, {
    trim: true,
    truncate: 100,
    remove: ['<', '>', '\\', '/', '"', "'"],
  });
}

export function sanitizeCreditCard(card) {
  return sanitizeString(card, {
    trim: true,
    numeric: true,
    truncate: 19,
  });
}

export function sanitizePostalCode(code) {
  return sanitizeString(code, {
    trim: true,
    uppercase: true,
    replace: {
      '[^A-Z0-9 -]': '',
    },
  });
}

export function sanitizeTags(tags) {
  if (typeof tags === 'string') {
    tags = tags.split(',');
  }

  return sanitizeArray(tags, {
    compact: true,
    unique: true,
    items: {
      trim: true,
      lowercase: true,
      slug: true,
      truncate: 50,
    },
    limit: 20,
  });
}
