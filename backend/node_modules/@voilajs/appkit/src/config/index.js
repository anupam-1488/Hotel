/**
 * @voilajs/appkit - Configuration module
 * @module @voilajs/appkit/config
 */

export {
  loadConfig,
  setConfig,
  getConfig,
  getEnv,
  reloadConfig,
  hasConfig,
  clearConfig,
} from './loader.js';

export { validateConfig, defineSchema, getConfigSchema } from './validator.js';

export { ConfigError } from './errors.js';
