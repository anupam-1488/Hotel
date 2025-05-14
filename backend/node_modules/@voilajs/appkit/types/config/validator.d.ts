/**
 * Validates configuration against schema
 * @param {Object} config - Configuration to validate
 * @param {Object} schema - Validation schema
 * @returns {boolean} True if valid
 * @throws {ConfigError} If validation fails
 */
export function validateConfig(config: any, schema: any): boolean;
/**
 * Defines a reusable schema
 * @param {string} name - Schema name
 * @param {Object} schema - Schema definition
 */
export function defineSchema(name: string, schema: any): void;
/**
 * Gets a defined schema
 * @param {string} name - Schema name
 * @returns {Object} Schema definition
 */
export function getConfigSchema(name: string): any;
