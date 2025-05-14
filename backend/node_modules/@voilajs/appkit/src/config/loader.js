/**
 * @voilajs/appkit - Configuration loader
 * @module @voilajs/appkit/config/loader
 */

import fs from 'fs';
import path from 'path';
import { ConfigError } from './errors.js';
import { validateConfig } from './validator.js';

// Configuration store
let configStore = {};
let configOptions = {};
let envCache = {};

/**
 * Loads configuration from file or object
 * @param {string|Object} pathOrConfig - File path or configuration object
 * @param {Object} [options] - Load options
 * @returns {Object} Loaded configuration
 */
export async function loadConfig(pathOrConfig, options = {}) {
  configOptions = {
    defaults: options.defaults || {},
    required: options.required || [],
    validate: options.validate !== false,
    schema: options.schema,
    env: options.env !== false,
    watch: options.watch || false,
    interpolate: options.interpolate !== false,
  };

  try {
    let config;

    if (typeof pathOrConfig === 'string') {
      config = await loadFromFile(pathOrConfig);
      configOptions.lastPath = pathOrConfig;
    } else if (typeof pathOrConfig === 'object' && pathOrConfig !== null) {
      config = pathOrConfig;
    } else {
      throw new ConfigError(
        'Configuration must be a file path or object',
        'INVALID_CONFIG_SOURCE'
      );
    }

    // Merge with defaults
    config = mergeWithDefaults(config, configOptions.defaults);

    // Load environment variables
    if (configOptions.env) {
      config = mergeWithEnv(config);
    }

    // Interpolate variables
    if (configOptions.interpolate) {
      config = interpolateVariables(config);
    }

    // Validate required fields
    validateRequiredFields(config, configOptions.required);

    // Validate against schema if provided
    if (configOptions.validate && configOptions.schema) {
      validateConfig(config, configOptions.schema);
    }

    // Store configuration
    configStore = config;

    // Setup file watching if requested
    if (configOptions.watch && typeof pathOrConfig === 'string') {
      watchConfigFile(pathOrConfig);
    }

    return config;
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }
    throw new ConfigError(
      `Failed to load configuration: ${error.message}`,
      'CONFIG_LOAD_ERROR',
      { originalError: error }
    );
  }
}

/**
 * Loads configuration from file
 * @private
 * @param {string} filePath - Configuration file path
 * @returns {Promise<Object>} Configuration object
 */
async function loadFromFile(filePath) {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new ConfigError(
      `Configuration file not found: ${absolutePath}`,
      'FILE_NOT_FOUND'
    );
  }

  const ext = path.extname(absolutePath).toLowerCase();
  let content;

  try {
    content = await fs.promises.readFile(absolutePath, 'utf8');
  } catch (error) {
    throw new ConfigError(
      `Failed to read configuration file: ${error.message}`,
      'FILE_READ_ERROR'
    );
  }

  switch (ext) {
    case '.json':
      return parseJSON(content, absolutePath);
    case '.js':
    case '.mjs':
      return loadJavaScript(absolutePath);
    case '.env':
      return parseDotEnv(content);
    default:
      throw new ConfigError(
        `Unsupported configuration file type: ${ext}`,
        'UNSUPPORTED_FILE_TYPE'
      );
  }
}

/**
 * Parses JSON configuration
 * @private
 * @param {string} content - JSON content
 * @param {string} filePath - File path for error reporting
 * @returns {Object} Parsed configuration
 */
function parseJSON(content, filePath) {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new ConfigError(
      `Invalid JSON in configuration file: ${filePath}`,
      'JSON_PARSE_ERROR',
      { parseError: error.message }
    );
  }
}

/**
 * Loads JavaScript configuration module
 * @private
 * @param {string} filePath - JavaScript file path
 * @returns {Promise<Object>} Module exports
 */
async function loadJavaScript(filePath) {
  try {
    const module = await import(filePath);
    return module.default || module;
  } catch (error) {
    throw new ConfigError(
      `Failed to load JavaScript configuration: ${error.message}`,
      'JS_LOAD_ERROR'
    );
  }
}

/**
 * Parses .env file content
 * @private
 * @param {string} content - .env file content
 * @returns {Object} Parsed environment variables
 */
function parseDotEnv(content) {
  const result = {};
  const lines = content.split('\n');

  for (let line of lines) {
    line = line.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;

    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) continue;

    const key = line.substring(0, equalIndex).trim();
    let value = line.substring(equalIndex + 1).trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

/**
 * Merges configuration with defaults
 * @private
 * @param {Object} config - Configuration object
 * @param {Object} defaults - Default values
 * @returns {Object} Merged configuration
 */
function mergeWithDefaults(config, defaults) {
  return deepMerge(defaults, config);
}

/**
 * Merges configuration with environment variables
 * @private
 * @param {Object} config - Configuration object
 * @returns {Object} Merged configuration
 */
function mergeWithEnv(config) {
  const result = { ...config };

  // Map environment variables to config paths
  const envMappings = {
    PORT: 'server.port',
    HOST: 'server.host',
    NODE_ENV: 'environment',
    LOG_LEVEL: 'logging.level',
    DATABASE_URL: 'database.url',
    REDIS_URL: 'redis.url',
    API_KEY: 'api.key',
    SECRET_KEY: 'security.secretKey',
  };

  // Apply environment variables
  for (const [envKey, configPath] of Object.entries(envMappings)) {
    const envValue = process.env[envKey];
    if (envValue !== undefined) {
      setNestedValue(result, configPath, envValue);
      envCache[envKey] = envValue;
    }
  }

  // Allow custom environment variable prefix
  const prefix = config.envPrefix || 'APP_';
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(prefix)) {
      const configKey = key
        .substring(prefix.length)
        .toLowerCase()
        .replace(/_/g, '.');
      setNestedValue(result, configKey, value);
      envCache[key] = value;
    }
  }

  return result;
}

/**
 * Interpolates variables in configuration
 * @private
 * @param {Object} config - Configuration object
 * @returns {Object} Interpolated configuration
 */
function interpolateVariables(config) {
  const context = {
    ...config,
    env: process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  return interpolateObject(config, context);
}

/**
 * Recursively interpolates variables in an object
 * @private
 * @param {*} obj - Object to interpolate
 * @param {Object} context - Variable context
 * @returns {*} Interpolated object
 */
function interpolateObject(obj, context) {
  if (typeof obj === 'string') {
    return interpolateString(obj, context);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateObject(item, context));
  }

  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, context);
    }
    return result;
  }

  return obj;
}

/**
 * Interpolates variables in a string
 * @private
 * @param {string} str - String to interpolate
 * @param {Object} context - Variable context
 * @returns {string} Interpolated string
 */
function interpolateString(str, context) {
  return str.replace(/\${([^}]+)}/g, (match, expression) => {
    try {
      // Simple property access
      const value = getNestedValue(context, expression);
      return value !== undefined ? value : match;
    } catch (error) {
      // Return original if interpolation fails
      return match;
    }
  });
}

/**
 * Validates required fields
 * @private
 * @param {Object} config - Configuration object
 * @param {Array<string>} required - Required field paths
 */
function validateRequiredFields(config, required) {
  const missing = [];

  for (const field of required) {
    if (getNestedValue(config, field) === undefined) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new ConfigError(
      `Missing required configuration fields: ${missing.join(', ')}`,
      'MISSING_REQUIRED_FIELDS',
      { missing }
    );
  }
}

/**
 * Watches configuration file for changes
 * @private
 * @param {string} filePath - File path to watch
 */
function watchConfigFile(filePath) {
  let reloadTimeout;

  fs.watch(filePath, (eventType) => {
    if (eventType === 'change') {
      // Debounce reloads
      clearTimeout(reloadTimeout);
      reloadTimeout = setTimeout(async () => {
        try {
          await reloadConfig(filePath);
          console.log('Configuration reloaded');
        } catch (error) {
          console.error('Failed to reload configuration:', error.message);
        }
      }, 100);
    }
  });
}

/**
 * Sets configuration value
 * @param {Object} config - Configuration object
 */
export function setConfig(config) {
  if (typeof config !== 'object' || config === null) {
    throw new ConfigError(
      'Configuration must be an object',
      'INVALID_CONFIG_TYPE'
    );
  }

  configStore = { ...config };
}

/**
 * Gets configuration value by key
 * @param {string} [key] - Configuration key (dot notation)
 * @param {*} [defaultValue] - Default value if key not found
 * @returns {*} Configuration value
 */
export function getConfig(key, defaultValue) {
  if (!key) {
    return { ...configStore };
  }

  const value = getNestedValue(configStore, key);
  return value !== undefined ? value : defaultValue;
}

/**
 * Gets environment variable value
 * @param {string} key - Environment variable name
 * @param {*} [defaultValue] - Default value if not found
 * @returns {string} Environment variable value
 */
export function getEnv(key, defaultValue) {
  // Check cache first
  if (key in envCache) {
    return envCache[key];
  }

  const value = process.env[key];
  if (value !== undefined) {
    envCache[key] = value;
    return value;
  }

  return defaultValue;
}

/**
 * Reloads configuration from file
 * @param {string} [filePath] - Configuration file path
 * @returns {Promise<Object>} Reloaded configuration
 */
export async function reloadConfig(filePath) {
  if (!filePath && !configOptions.lastPath) {
    throw new ConfigError(
      'No configuration file path provided',
      'NO_CONFIG_PATH'
    );
  }

  const path = filePath || configOptions.lastPath;
  configOptions.lastPath = path;

  return loadConfig(path, configOptions);
}

/**
 * Checks if configuration has a key
 * @param {string} key - Configuration key (dot notation)
 * @returns {boolean} True if key exists
 */
export function hasConfig(key) {
  return getNestedValue(configStore, key) !== undefined;
}

/**
 * Clears configuration
 */
export function clearConfig() {
  configStore = {};
  envCache = {};
  configOptions = {};
}

/**
 * Deep merges two objects
 * @private
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Gets nested value from object
 * @private
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot notation path
 * @returns {*} Value at path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key];
  }, obj);
}

/**
 * Sets nested value in object
 * @private
 * @param {Object} obj - Object to set value in
 * @param {string} path - Dot notation path
 * @param {*} value - Value to set
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);

  target[lastKey] = value;
}
