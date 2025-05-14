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
export function pick(obj: any, keys: string[]): any;
/**
 * Omits specified keys from object
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to omit
 * @returns {Object} New object without omitted keys
 */
export function omit(obj: any, keys: string[]): any;
/**
 * Deep merges multiple objects
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
export function deepMerge(target: any, ...sources: any[]): any;
/**
 * Creates deep clone of object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj: any): any;
/**
 * Gets nested property value
 * @param {Object} obj - Source object
 * @param {string|Array<string>} path - Property path
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Property value
 */
export function get(obj: any, path: string | Array<string>, defaultValue?: any): any;
/**
 * Sets nested property value
 * @param {Object} obj - Target object
 * @param {string|Array<string>} path - Property path
 * @param {*} value - Value to set
 * @returns {Object} Modified object
 */
export function set(obj: any, path: string | Array<string>, value: any): any;
/**
 * Checks if object has nested property
 * @param {Object} obj - Source object
 * @param {string|Array<string>} path - Property path
 * @returns {boolean} Has property
 */
export function has(obj: any, path: string | Array<string>): boolean;
/**
 * Flattens nested object
 * @param {Object} obj - Object to flatten
 * @param {string} separator - Key separator
 * @returns {Object} Flattened object
 */
export function flatten(obj: any, separator?: string): any;
/**
 * Unflattens object
 * @param {Object} obj - Flattened object
 * @param {string} separator - Key separator
 * @returns {Object} Nested object
 */
export function unflatten(obj: any, separator?: string): any;
/**
 * Checks if two values are deeply equal
 * @param {*} a - First value
 * @param {*} b - Second value
 * @returns {boolean} Are equal
 */
export function isEqual(a: any, b: any): boolean;
/**
 * Checks if value is empty
 * @param {*} value - Value to check
 * @returns {boolean} Is empty
 */
export function isEmpty(value: any): boolean;
/**
 * Sets default values for undefined properties
 * @param {Object} obj - Target object
 * @param {Object} defaultValues - Default values
 * @returns {Object} Object with defaults
 */
export function defaults(obj: any, defaultValues: any): any;
/**
 * Maps object keys
 * @param {Object} obj - Source object
 * @param {Function} iteratee - Key mapper function
 * @returns {Object} Object with mapped keys
 */
export function mapKeys(obj: any, iteratee: Function): any;
/**
 * Maps object values
 * @param {Object} obj - Source object
 * @param {Function} iteratee - Value mapper function
 * @returns {Object} Object with mapped values
 */
export function mapValues(obj: any, iteratee: Function): any;
/**
 * Groups array of objects by key
 * @param {Array} array - Array of objects
 * @param {string|Function} key - Group key or function
 * @returns {Object} Grouped objects
 */
export function groupBy(array: any[], key: string | Function): any;
/**
 * Creates object from array with key extraction
 * @param {Array} array - Array of objects
 * @param {string|Function} key - Key property or function
 * @returns {Object} Keyed object
 */
export function keyBy(array: any[], key: string | Function): any;
