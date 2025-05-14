/**
 * @voilajs/appkit - Configuration errors
 * @module @voilajs/appkit/config/errors
 */

/**
 * Configuration-specific error class
 */
export class ConfigError extends Error {
  constructor(message, code = 'CONFIG_ERROR', details = {}) {
    super(message);
    this.name = 'ConfigError';
    this.code = code;
    this.details = details;
  }
}
