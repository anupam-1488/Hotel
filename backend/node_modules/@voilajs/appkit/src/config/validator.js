/**
 * @voilajs/appkit - Configuration validator
 * @module @voilajs/appkit/config/validator
 */

import { ConfigError } from './errors.js';

// Schema store
const schemas = new Map();

/**
 * Validates configuration against schema
 * @param {Object} config - Configuration to validate
 * @param {Object} schema - Validation schema
 * @returns {boolean} True if valid
 * @throws {ConfigError} If validation fails
 */
export function validateConfig(config, schema) {
  const errors = validateObject(config, schema, '');

  if (errors.length > 0) {
    throw new ConfigError(
      'Configuration validation failed',
      'VALIDATION_ERROR',
      { errors }
    );
  }

  return true;
}

/**
 * Defines a reusable schema
 * @param {string} name - Schema name
 * @param {Object} schema - Schema definition
 */
export function defineSchema(name, schema) {
  if (schemas.has(name)) {
    throw new ConfigError(`Schema '${name}' already defined`, 'SCHEMA_EXISTS');
  }

  schemas.set(name, schema);
}

/**
 * Gets a defined schema
 * @param {string} name - Schema name
 * @returns {Object} Schema definition
 */
export function getConfigSchema(name) {
  const schema = schemas.get(name);

  if (!schema) {
    throw new ConfigError(`Schema '${name}' not found`, 'SCHEMA_NOT_FOUND');
  }

  return schema;
}

/**
 * Validates an object against a schema
 * @private
 * @param {*} value - Value to validate
 * @param {Object} schema - Schema definition
 * @param {string} path - Current path
 * @returns {Array<Object>} Validation errors
 */
function validateObject(value, schema, path) {
  const errors = [];

  // Handle schema references
  if (schema.$ref) {
    const refSchema = getConfigSchema(schema.$ref);
    return validateObject(value, refSchema, path);
  }

  // Check type
  if (schema.type) {
    const typeError = validateType(value, schema.type, path);
    if (typeError) {
      errors.push(typeError);
      return errors; // Stop validation if type is wrong
    }
  }

  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (value && !(field in value)) {
        errors.push({
          path: path ? `${path}.${field}` : field,
          message: 'Required field missing',
        });
      }
    }
  }

  // Validate properties
  if (schema.properties && typeof value === 'object' && value !== null) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const propPath = path ? `${path}.${key}` : key;
      const propValue = value[key];

      if (propValue === undefined && propSchema.default !== undefined) {
        value[key] = propSchema.default;
        continue;
      }

      if (propValue !== undefined) {
        errors.push(...validateObject(propValue, propSchema, propPath));
      }
    }
  }

  // Validate array items
  if (schema.items && Array.isArray(value)) {
    value.forEach((item, index) => {
      const itemPath = `${path}[${index}]`;
      errors.push(...validateObject(item, schema.items, itemPath));
    });
  }

  // Custom validators
  if (schema.validate && typeof schema.validate === 'function') {
    try {
      const result = schema.validate(value, path);
      if (result !== true) {
        errors.push({
          path,
          message: result || 'Custom validation failed',
        });
      }
    } catch (error) {
      errors.push({
        path,
        message: `Validation error: ${error.message}`,
      });
    }
  }

  // Additional validations
  if (value !== undefined && value !== null) {
    // String validations
    if (typeof value === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push({
          path,
          message: `String length must be at least ${schema.minLength}`,
        });
      }

      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push({
          path,
          message: `String length must not exceed ${schema.maxLength}`,
        });
      }

      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push({
          path,
          message: `String does not match pattern: ${schema.pattern}`,
        });
      }

      if (schema.enum && !schema.enum.includes(value)) {
        errors.push({
          path,
          message: `Value must be one of: ${schema.enum.join(', ')}`,
        });
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push({
          path,
          message: `Value must be at least ${schema.minimum}`,
        });
      }

      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push({
          path,
          message: `Value must not exceed ${schema.maximum}`,
        });
      }

      if (schema.multipleOf && value % schema.multipleOf !== 0) {
        errors.push({
          path,
          message: `Value must be a multiple of ${schema.multipleOf}`,
        });
      }
    }

    // Array validations
    if (Array.isArray(value)) {
      if (schema.minItems && value.length < schema.minItems) {
        errors.push({
          path,
          message: `Array must contain at least ${schema.minItems} items`,
        });
      }

      if (schema.maxItems && value.length > schema.maxItems) {
        errors.push({
          path,
          message: `Array must not contain more than ${schema.maxItems} items`,
        });
      }

      if (schema.uniqueItems) {
        const seen = new Set();
        for (let i = 0; i < value.length; i++) {
          const item = JSON.stringify(value[i]);
          if (seen.has(item)) {
            errors.push({
              path: `${path}[${i}]`,
              message: 'Array items must be unique',
            });
          }
          seen.add(item);
        }
      }
    }

    // Object validations
    if (typeof value === 'object' && !Array.isArray(value)) {
      const keys = Object.keys(value);

      if (schema.minProperties && keys.length < schema.minProperties) {
        errors.push({
          path,
          message: `Object must have at least ${schema.minProperties} properties`,
        });
      }

      if (schema.maxProperties && keys.length > schema.maxProperties) {
        errors.push({
          path,
          message: `Object must not have more than ${schema.maxProperties} properties`,
        });
      }

      if (schema.additionalProperties === false) {
        const allowedKeys = new Set(Object.keys(schema.properties || {}));
        for (const key of keys) {
          if (!allowedKeys.has(key)) {
            errors.push({
              path: path ? `${path}.${key}` : key,
              message: 'Additional property not allowed',
            });
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Validates value type
 * @private
 * @param {*} value - Value to check
 * @param {string|Array<string>} type - Expected type(s)
 * @param {string} path - Current path
 * @returns {Object|null} Error object or null
 */
function validateType(value, type, path) {
  const types = Array.isArray(type) ? type : [type];
  const actualType = getType(value);

  if (!types.includes(actualType)) {
    return {
      path,
      message: `Expected type '${types.join(' or ')}', got '${actualType}'`,
    };
  }

  return null;
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
  return typeof value;
}

// Predefined schemas - only the essential ones
defineSchema('server', {
  type: 'object',
  required: ['port'],
  properties: {
    host: {
      type: 'string',
      default: 'localhost',
    },
    port: {
      type: 'number',
      minimum: 1,
      maximum: 65535,
    },
    ssl: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', default: false },
        key: { type: 'string' },
        cert: { type: 'string' },
      },
    },
  },
});

defineSchema('database', {
  type: 'object',
  required: ['url'],
  properties: {
    url: {
      type: 'string',
      pattern: '^(postgres|mysql|mongodb)://',
    },
    pool: {
      type: 'object',
      properties: {
        min: { type: 'number', minimum: 0, default: 2 },
        max: { type: 'number', minimum: 1, default: 10 },
        idleTimeout: { type: 'number', minimum: 0, default: 30000 },
      },
    },
    ssl: { type: 'boolean', default: false },
  },
});

defineSchema('logging', {
  type: 'object',
  properties: {
    level: {
      type: 'string',
      enum: ['error', 'warn', 'info', 'debug'],
      default: 'info',
    },
    format: {
      type: 'string',
      enum: ['json', 'simple', 'detailed'],
      default: 'json',
    },
  },
});

// Simple app schema that uses the predefined schemas
defineSchema('app', {
  type: 'object',
  required: ['server'],
  properties: {
    name: { type: 'string' },
    version: { type: 'string' },
    environment: {
      type: 'string',
      enum: ['development', 'staging', 'production'],
      default: 'development',
    },
    server: { $ref: 'server' },
    database: { $ref: 'database' },
    logging: { $ref: 'logging' },
    features: {
      type: 'object',
      additionalProperties: { type: 'boolean' },
    },
  },
});
