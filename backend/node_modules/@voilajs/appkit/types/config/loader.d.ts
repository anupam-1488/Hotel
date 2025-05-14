/**
 * Loads configuration from file or object
 * @param {string|Object} pathOrConfig - File path or configuration object
 * @param {Object} [options] - Load options
 * @returns {Object} Loaded configuration
 */
export function loadConfig(pathOrConfig: string | any, options?: any): any;
/**
 * Sets configuration value
 * @param {Object} config - Configuration object
 */
export function setConfig(config: any): void;
/**
 * Gets configuration value by key
 * @param {string} [key] - Configuration key (dot notation)
 * @param {*} [defaultValue] - Default value if key not found
 * @returns {*} Configuration value
 */
export function getConfig(key?: string, defaultValue?: any): any;
/**
 * Gets environment variable value
 * @param {string} key - Environment variable name
 * @param {*} [defaultValue] - Default value if not found
 * @returns {string} Environment variable value
 */
export function getEnv(key: string, defaultValue?: any): string;
/**
 * Reloads configuration from file
 * @param {string} [filePath] - Configuration file path
 * @returns {Promise<Object>} Reloaded configuration
 */
export function reloadConfig(filePath?: string): Promise<any>;
/**
 * Checks if configuration has a key
 * @param {string} key - Configuration key (dot notation)
 * @returns {boolean} True if key exists
 */
export function hasConfig(key: string): boolean;
/**
 * Clears configuration
 */
export function clearConfig(): void;
