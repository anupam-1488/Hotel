/**
 * @voilajs/appkit - Object utilities
 * @module @voilajs/appkit/utils/object
 */

/**
 * Picks specified keys from object
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to pick
 * @returns {Object} New object with picked keys
 */
export function pick(obj, keys) {
  if (!obj || typeof obj !== 'object') return {};

  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

/**
 * Omits specified keys from object
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to omit
 * @returns {Object} New object without omitted keys
 */
export function omit(obj, keys) {
  if (!obj || typeof obj !== 'object') return {};

  const keysToOmit = new Set(keys);
  return Object.keys(obj).reduce((result, key) => {
    if (!keysToOmit.has(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

/**
 * Deep merges multiple objects
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Creates deep clone of object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item));
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }

  if (obj instanceof Map) {
    const mapCopy = new Map();
    for (const [key, value] of obj) {
      mapCopy.set(key, deepClone(value));
    }
    return mapCopy;
  }

  if (obj instanceof Set) {
    const setCopy = new Set();
    for (const value of obj) {
      setCopy.add(deepClone(value));
    }
    return setCopy;
  }

  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
}

/**
 * Gets nested property value
 * @param {Object} obj - Source object
 * @param {string|Array<string>} path - Property path
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Property value
 */
export function get(obj, path, defaultValue = undefined) {
  if (!obj || typeof obj !== 'object') return defaultValue;

  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}

/**
 * Sets nested property value
 * @param {Object} obj - Target object
 * @param {string|Array<string>} path - Property path
 * @param {*} value - Value to set
 * @returns {Object} Modified object
 */
export function set(obj, path, value) {
  if (!obj || typeof obj !== 'object') return obj;

  const keys = Array.isArray(path) ? path : path.split('.');
  const lastKey = keys.pop();

  let current = obj;
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
}

/**
 * Checks if object has nested property
 * @param {Object} obj - Source object
 * @param {string|Array<string>} path - Property path
 * @returns {boolean} Has property
 */
export function has(obj, path) {
  if (!obj || typeof obj !== 'object') return false;

  const keys = Array.isArray(path) ? path : path.split('.');
  let current = obj;

  for (const key of keys) {
    if (!current || !(key in current)) return false;
    current = current[key];
  }

  return true;
}

/**
 * Flattens nested object
 * @param {Object} obj - Object to flatten
 * @param {string} separator - Key separator
 * @returns {Object} Flattened object
 */
export function flatten(obj, separator = '.') {
  const result = {};

  function recurse(current, path = '') {
    for (const key in current) {
      if (!current.hasOwnProperty(key)) continue;

      const newPath = path ? `${path}${separator}${key}` : key;

      if (isObject(current[key]) && !Array.isArray(current[key])) {
        recurse(current[key], newPath);
      } else {
        result[newPath] = current[key];
      }
    }
  }

  recurse(obj);
  return result;
}

/**
 * Unflattens object
 * @param {Object} obj - Flattened object
 * @param {string} separator - Key separator
 * @returns {Object} Nested object
 */
export function unflatten(obj, separator = '.') {
  const result = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const keys = key.split(separator);
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = obj[key];
  }

  return result;
}

/**
 * Checks if two values are deeply equal
 * @param {*} a - First value
 * @param {*} b - Second value
 * @returns {boolean} Are equal
 */
export function isEqual(a, b) {
  if (a === b) return true;

  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null
  ) {
    return false;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }

    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Checks if value is empty
 * @param {*} value - Value to check
 * @returns {boolean} Is empty
 */
export function isEmpty(value) {
  if (value == null) return true;

  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0;
  }

  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Sets default values for undefined properties
 * @param {Object} obj - Target object
 * @param {Object} defaultValues - Default values
 * @returns {Object} Object with defaults
 */
export function defaults(obj, defaultValues) {
  const result = { ...obj };

  for (const key in defaultValues) {
    if (result[key] === undefined) {
      result[key] = defaultValues[key];
    }
  }

  return result;
}

/**
 * Maps object keys
 * @param {Object} obj - Source object
 * @param {Function} iteratee - Key mapper function
 * @returns {Object} Object with mapped keys
 */
export function mapKeys(obj, iteratee) {
  const result = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = iteratee(key, obj[key], obj);
      result[newKey] = obj[key];
    }
  }

  return result;
}

/**
 * Maps object values
 * @param {Object} obj - Source object
 * @param {Function} iteratee - Value mapper function
 * @returns {Object} Object with mapped values
 */
export function mapValues(obj, iteratee) {
  const result = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = iteratee(obj[key], key, obj);
    }
  }

  return result;
}

/**
 * Groups array of objects by key
 * @param {Array} array - Array of objects
 * @param {string|Function} key - Group key or function
 * @returns {Object} Grouped objects
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];

    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Creates object from array with key extraction
 * @param {Array} array - Array of objects
 * @param {string|Function} key - Key property or function
 * @returns {Object} Keyed object
 */
export function keyBy(array, key) {
  return array.reduce((result, item) => {
    const itemKey = typeof key === 'function' ? key(item) : item[key];
    result[itemKey] = item;
    return result;
  }, {});
}

/**
 * Helper to check if value is plain object
 * @private
 * @param {*} item - Value to check
 * @returns {boolean} Is plain object
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}
