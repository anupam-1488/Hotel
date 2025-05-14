/**
 * @voilajs/appkit - Logger implementation
 * @module @voilajs/appkit/logging/logger
 */

import { ConsoleTransport } from './transports/console.js';
import { FileTransport } from './transports/file.js';

/**
 * Log levels enumeration
 * @enum {number}
 */
const LogLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * @typedef {'error'|'warn'|'info'|'debug'} LogLevel
 */

/**
 * @typedef {Object} LogEntry
 * @property {string} timestamp - ISO timestamp
 * @property {LogLevel} level - Log level
 * @property {string} message - Log message
 * @property {Object<string, any>} [meta] - Additional metadata
 */

/**
 * @typedef {Object} LoggerOptions
 * @property {LogLevel} [level='info'] - Minimum log level
 * @property {Object<string, any>} [defaultMeta] - Default metadata included in all logs
 * @property {BaseTransport[]} [transports] - Custom log transports
 * @property {boolean} [enableFileLogging=true] - Enable file logging
 * @property {string} [dirname='logs'] - Directory for log files
 * @property {string} [filename='app.log'] - Base filename for logs
 * @property {number} [retentionDays=5] - Days to retain log files
 * @property {number} [maxSize=10485760] - Maximum file size before rotation
 */

/**
 * Logger class
 */
export class Logger {
  /**
   * Creates a new Logger instance
   * @param {LoggerOptions} [options={}] - Logger configuration
   */
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.defaultMeta = options.defaultMeta || {};
    this.transports = options.transports || this.getDefaultTransports(options);
    this.levelValue = LogLevels[this.level];
  }

  /**
   * Gets default transports based on environment
   * @private
   * @param {LoggerOptions} options - Logger options
   * @returns {BaseTransport[]} Default transports
   */
  getDefaultTransports(options) {
    const transports = [];

    // Always include console transport
    transports.push(
      new ConsoleTransport({
        colorize: process.env.NODE_ENV !== 'production',
        prettyPrint: process.env.NODE_ENV === 'development',
      })
    );

    // Add file transport unless explicitly disabled
    if (options.enableFileLogging !== false) {
      transports.push(
        new FileTransport({
          filename: options.filename,
          dirname: options.dirname,
          retentionDays: options.retentionDays,
          maxSize: options.maxSize,
        })
      );
    }

    return transports;
  }

  /**
   * Logs info message
   * @param {string} message - Log message
   * @param {Object<string, any>} [meta={}] - Additional metadata
   * @returns {void}
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Logs error message
   * @param {string} message - Log message
   * @param {Object<string, any>} [meta={}] - Additional metadata
   * @returns {void}
   */
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  /**
   * Logs warning message
   * @param {string} message - Log message
   * @param {Object<string, any>} [meta={}] - Additional metadata
   * @returns {void}
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Logs debug message
   * @param {string} message - Log message
   * @param {Object<string, any>} [meta={}] - Additional metadata
   * @returns {void}
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Creates child logger with additional context
   * @param {Object<string, any>} bindings - Additional context bindings
   * @returns {Logger} Child logger instance
   */
  child(bindings) {
    return new Logger({
      level: this.level,
      defaultMeta: { ...this.defaultMeta, ...bindings },
      transports: this.transports,
    });
  }

  /**
   * Core logging method
   * @private
   * @param {LogLevel} level - Log level
   * @param {string} message - Log message
   * @param {Object<string, any>} meta - Metadata
   * @returns {void}
   */
  log(level, message, meta) {
    // Check if this level should be logged
    if (LogLevels[level] > this.levelValue) {
      return;
    }

    // Handle missing message gracefully
    if (message === undefined) {
      message = '';
    }

    // Handle null metadata
    if (meta === null) {
      meta = {};
    }

    // Create log entry
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.defaultMeta,
      ...meta,
    };

    // Send to all transports
    this.transports.forEach((transport) => {
      try {
        transport.log(entry);
      } catch (error) {
        console.error('Transport error:', error);
      }
    });
  }

  /**
   * Flushes all transports
   * @returns {Promise<void>}
   */
  async flush() {
    await Promise.all(
      this.transports.map((transport) =>
        transport.flush ? transport.flush() : Promise.resolve()
      )
    );
  }

  /**
   * Closes all transports
   * @returns {Promise<void>}
   */
  async close() {
    await Promise.all(
      this.transports.map((transport) =>
        transport.close ? transport.close() : Promise.resolve()
      )
    );
  }
}

/**
 * Creates a logger instance
 * @param {LoggerOptions} [options={}] - Logger configuration
 * @returns {Logger} Logger instance
 */
export function createLogger(options = {}) {
  return new Logger(options);
}

// Only export actual JavaScript values
export { LogLevels };
