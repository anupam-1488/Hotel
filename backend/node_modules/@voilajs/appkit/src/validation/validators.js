/**
 * @voilajs/appkit - Validators
 * @module @voilajs/appkit/validation/validators
 */

import { ValidationError } from './errors.js';

/**
 * Validates data against schema
 * @param {*} data - Data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Validation options
 * @returns {{valid: boolean, errors?: Array}} Validation result
 */
export function validate(data, schema, options = {}) {
  const context = {
    data,
    path: '',
    errors: [],
    options: {
      abortEarly: options.abortEarly || false,
      allowUnknown: options.allowUnknown || false,
      stripUnknown: options.stripUnknown || false,
      context: options.context || {},
    },
  };

  const result = validateValue(data, schema, context);

  return {
    valid: context.errors.length === 0,
    errors: context.errors,
    value: result,
  };
}

/**
 * Creates a reusable validator function
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Default options
 * @returns {Function} Validator function
 */
export function createValidator(schema, options = {}) {
  return (data, overrideOptions = {}) => {
    return validate(data, schema, { ...options, ...overrideOptions });
  };
}

/**
 * Validates data asynchronously
 * @param {*} data - Data to validate
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Validation options
 * @returns {Promise<{valid: boolean, errors?: Array}>} Validation result
 */
export async function validateAsync(data, schema, options = {}) {
  const context = {
    data,
    path: '',
    errors: [],
    options: {
      abortEarly: options.abortEarly || false,
      allowUnknown: options.allowUnknown || false,
      stripUnknown: options.stripUnknown || false,
      context: options.context || {},
    },
  };

  const result = await validateValueAsync(data, schema, context);

  return {
    valid: context.errors.length === 0,
    errors: context.errors,
    value: result,
  };
}

/**
 * Creates a reusable async validator function
 * @param {Object} schema - Validation schema
 * @param {Object} [options] - Default options
 * @returns {Function} Async validator function
 */
export function createAsyncValidator(schema, options = {}) {
  return async (data, overrideOptions = {}) => {
    return validateAsync(data, schema, { ...options, ...overrideOptions });
  };
}

/**
 * Validates a value against schema
 * @private
 * @param {*} value - Value to validate
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {*} Processed value
 */
function validateValue(value, schema, context) {
  // Handle conditional schemas
  if (schema.when) {
    schema = resolveConditionalSchema(schema, context);
  }

  // Check if required
  if (value === undefined || value === null) {
    if (schema.required) {
      addError(context, 'Value is required');
      return value;
    }

    // Return default value if provided
    if ('default' in schema) {
      return typeof schema.default === 'function'
        ? schema.default(context)
        : schema.default;
    }

    return value;
  }

  // Type validation
  if (schema.type) {
    const typeValid = validateType(value, schema.type, context);
    if (!typeValid && context.options.abortEarly) {
      return value;
    }
  }

  // Custom validation function
  if (schema.validate) {
    try {
      const result = schema.validate(value, context);
      if (result !== true) {
        addError(context, result || 'Validation failed');
        if (context.options.abortEarly) return value;
      }
    } catch (error) {
      addError(context, error.message);
      if (context.options.abortEarly) return value;
    }
  }

  // Type-specific validation
  let processedValue = value;

  switch (getType(value)) {
    case 'string':
      processedValue = validateString(value, schema, context);
      break;
    case 'number':
      processedValue = validateNumber(value, schema, context);
      break;
    case 'boolean':
      processedValue = validateBoolean(value, schema, context);
      break;
    case 'array':
      processedValue = validateArray(value, schema, context);
      break;
    case 'object':
      processedValue = validateObject(value, schema, context);
      break;
    case 'date':
      processedValue = validateDate(value, schema, context);
      break;
  }

  // Transform value if specified
  if (schema.transform && typeof schema.transform === 'function') {
    processedValue = schema.transform(processedValue, context);
  }

  return processedValue;
}

/**
 * Validates a value asynchronously
 * @private
 * @param {*} value - Value to validate
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Promise<*>} Processed value
 */
async function validateValueAsync(value, schema, context) {
  // Similar to validateValue but handles async validators
  if (schema.validateAsync) {
    try {
      const result = await schema.validateAsync(value, context);
      if (result !== true) {
        addError(context, result || 'Validation failed');
        if (context.options.abortEarly) return value;
      }
    } catch (error) {
      addError(context, error.message);
      if (context.options.abortEarly) return value;
    }
  }

  // Regular validation
  return validateValue(value, schema, context);
}

/**
 * Validates string value
 * @private
 * @param {string} value - String value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {string} Processed value
 */
function validateString(value, schema, context) {
  if (schema.trim) {
    value = value.trim();
  }

  if (schema.lowercase) {
    value = value.toLowerCase();
  }

  if (schema.uppercase) {
    value = value.toUpperCase();
  }

  if (schema.minLength !== undefined && value.length < schema.minLength) {
    addError(
      context,
      `String must be at least ${schema.minLength} characters long`
    );
  }

  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    addError(context, `String must not exceed ${schema.maxLength} characters`);
  }

  if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
    addError(context, `String does not match pattern: ${schema.pattern}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    addError(context, `Value must be one of: ${schema.enum.join(', ')}`);
  }

  // Common string validators
  if (schema.email && !isEmail(value)) {
    addError(context, 'Invalid email address');
  }

  if (schema.url && !isUrl(value)) {
    addError(context, 'Invalid URL');
  }

  if (schema.uuid && !isUuid(value)) {
    addError(context, 'Invalid UUID');
  }

  if (schema.creditCard && !isCreditCard(value)) {
    addError(context, 'Invalid credit card number');
  }

  if (schema.phone && !isPhoneNumber(value)) {
    addError(context, 'Invalid phone number');
  }

  return value;
}

/**
 * Validates number value
 * @private
 * @param {number} value - Number value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {number} Processed value
 */
function validateNumber(value, schema, context) {
  if (schema.min !== undefined && value < schema.min) {
    addError(context, `Value must be at least ${schema.min}`);
  }

  if (schema.max !== undefined && value > schema.max) {
    addError(context, `Value must not exceed ${schema.max}`);
  }

  if (schema.integer && !Number.isInteger(value)) {
    addError(context, 'Value must be an integer');
  }

  if (schema.positive && value <= 0) {
    addError(context, 'Value must be positive');
  }

  if (schema.negative && value >= 0) {
    addError(context, 'Value must be negative');
  }

  if (schema.multipleOf && value % schema.multipleOf !== 0) {
    addError(context, `Value must be a multiple of ${schema.multipleOf}`);
  }

  return value;
}

/**
 * Validates boolean value
 * @private
 * @param {boolean} value - Boolean value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {boolean} Processed value
 */
function validateBoolean(value, schema, context) {
  if (schema.truthy && !value) {
    addError(context, 'Value must be true');
  }

  if (schema.falsy && value) {
    addError(context, 'Value must be false');
  }

  return value;
}

/**
 * Validates array value
 * @private
 * @param {Array} value - Array value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Array} Processed value
 */
function validateArray(value, schema, context) {
  const result = [];

  if (schema.minItems !== undefined && value.length < schema.minItems) {
    addError(context, `Array must contain at least ${schema.minItems} items`);
  }

  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    addError(
      context,
      `Array must not contain more than ${schema.maxItems} items`
    );
  }

  if (schema.unique) {
    const seen = new Set();
    for (let i = 0; i < value.length; i++) {
      const item = JSON.stringify(value[i]);
      if (seen.has(item)) {
        addError(
          context,
          `Duplicate value at index ${i}`,
          `${context.path}[${i}]`
        );
      }
      seen.add(item);
    }
  }

  // Validate array items
  if (schema.items) {
    for (let i = 0; i < value.length; i++) {
      const itemContext = {
        ...context,
        path: `${context.path}[${i}]`,
      };
      result[i] = validateValue(value[i], schema.items, itemContext);
    }
  } else {
    result.push(...value);
  }

  return result;
}

/**
 * Validates object value
 * @private
 * @param {Object} value - Object value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Object} Processed value
 */
function validateObject(value, schema, context) {
  const result = {};
  const processedKeys = new Set();

  // Validate defined properties
  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      processedKeys.add(key);
      const propContext = {
        ...context,
        path: context.path ? `${context.path}.${key}` : key,
      };

      if (key in value) {
        result[key] = validateValue(value[key], propSchema, propContext);
      } else if (propSchema.required) {
        addError(propContext, 'Value is required');
      } else if ('default' in propSchema) {
        result[key] =
          typeof propSchema.default === 'function'
            ? propSchema.default(propContext)
            : propSchema.default;
      }
    }
  }

  // Handle additional properties
  for (const [key, val] of Object.entries(value)) {
    if (!processedKeys.has(key)) {
      if (schema.additionalProperties === false) {
        if (!context.options.allowUnknown) {
          addError(
            context,
            `Unknown property: ${key}`,
            context.path ? `${context.path}.${key}` : key
          );
        }
        if (!context.options.stripUnknown) {
          result[key] = val;
        }
      } else if (schema.additionalProperties) {
        const propContext = {
          ...context,
          path: context.path ? `${context.path}.${key}` : key,
        };
        result[key] = validateValue(
          val,
          schema.additionalProperties,
          propContext
        );
      } else {
        result[key] = val;
      }
    }
  }

  // Object-level validations
  if (schema.minProperties !== undefined) {
    const propCount = Object.keys(result).length;
    if (propCount < schema.minProperties) {
      addError(
        context,
        `Object must have at least ${schema.minProperties} properties`
      );
    }
  }

  if (schema.maxProperties !== undefined) {
    const propCount = Object.keys(result).length;
    if (propCount > schema.maxProperties) {
      addError(
        context,
        `Object must not have more than ${schema.maxProperties} properties`
      );
    }
  }

  // Dependencies
  if (schema.dependencies) {
    for (const [key, deps] of Object.entries(schema.dependencies)) {
      if (key in result) {
        if (Array.isArray(deps)) {
          // Property dependencies
          for (const dep of deps) {
            if (!(dep in result)) {
              addError(context, `Property '${key}' requires '${dep}'`);
            }
          }
        } else {
          // Schema dependencies
          validateValue(result, deps, context);
        }
      }
    }
  }

  return result;
}

/**
 * Validates date value
 * @private
 * @param {Date} value - Date value
 * @param {Object} schema - Schema definition
 * @param {Object} context - Validation context
 * @returns {Date} Processed value
 */
function validateDate(value, schema, context) {
  if (schema.min && value < new Date(schema.min)) {
    addError(context, `Date must be after ${schema.min}`);
  }

  if (schema.max && value > new Date(schema.max)) {
    addError(context, `Date must be before ${schema.max}`);
  }

  return value;
}

/**
 * Validates value type
 * @private
 * @param {*} value - Value to check
 * @param {string|Array<string>} type - Expected type(s)
 * @param {Object} context - Validation context
 * @returns {boolean} Type is valid
 */
function validateType(value, type, context) {
  const types = Array.isArray(type) ? type : [type];
  const actualType = getType(value);

  if (!types.includes(actualType)) {
    addError(
      context,
      `Expected type '${types.join(' or ')}', got '${actualType}'`
    );
    return false;
  }

  return true;
}

/**
 * Resolves conditional schema
 * @private
 * @param {Object} schema - Schema with when clause
 * @param {Object} context - Validation context
 * @returns {Object} Resolved schema
 */
function resolveConditionalSchema(schema, context) {
  const { when, then, otherwise, ...baseSchema } = schema;

  let condition = false;

  if (typeof when === 'function') {
    condition = when(context.data, context);
  } else if (typeof when === 'object') {
    // Check if data matches when conditions
    const { is, exists } = when;

    if (exists !== undefined) {
      condition = (context.data !== undefined) === exists;
    } else if (is !== undefined) {
      condition = context.data === is;
    }
  }

  const appliedSchema = condition ? then : otherwise;

  return appliedSchema ? { ...baseSchema, ...appliedSchema } : baseSchema;
}

/**
 * Gets the type of a value
 * @private
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
 * Adds an error to context
 * @private
 * @param {Object} context - Validation context
 * @param {string} message - Error message
 * @param {string} [path] - Error path override
 */
function addError(context, message, path = context.path) {
  context.errors.push({
    path,
    message,
    value: context.data,
  });
}

/**
 * Common validators
 */

export function isEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isUuid(value) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isCreditCard(value) {
  // Basic Luhn algorithm check
  const sanitized = value.replace(/\D/g, '');

  if (sanitized.length < 13 || sanitized.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isPhoneNumber(value) {
  // Basic international phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleaned = value.replace(/[\s-()]/g, '');
  return phoneRegex.test(cleaned);
}

export function isAlphanumeric(value) {
  return /^[a-zA-Z0-9]+$/.test(value);
}

export function isAlpha(value) {
  return /^[a-zA-Z]+$/.test(value);
}

export function isNumeric(value) {
  return /^[0-9]+$/.test(value);
}

export function isHexColor(value) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
}

export function isIpAddress(value) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(value)) {
    const parts = value.split('.');
    return parts.every((part) => {
      const num = parseInt(part);
      return num >= 0 && num <= 255;
    });
  }

  return ipv6Regex.test(value);
}

export function isSlug(value) {
  return /^[a-z0-9-]+$/.test(value);
}

export function isStrongPassword(value) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}
