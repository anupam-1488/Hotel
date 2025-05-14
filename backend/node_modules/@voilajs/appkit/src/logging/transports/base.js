/**
 * @voilajs/appkit - Base transport interface
 * @module @voilajs/appkit/logging/transports/base
 */

/**
 * @typedef {Object} TransportOptions
 * @property {string} [level] - Minimum log level for this transport
 */

/**
 * @typedef {Object} LogEntry
 * @property {string} timestamp - ISO timestamp
 * @property {'error'|'warn'|'info'|'debug'} level - Log level
 * @property {string} message - Log message
 * @property {Object<string, any>} [meta] - Additional metadata
 */

/**
 * Base transport class
 * @abstract
 */
export class BaseTransport {
  /**
   * Creates a new BaseTransport instance
   * @param {TransportOptions} [options={}] - Transport options
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Logs an entry
   * @abstract
   * @param {LogEntry} entry - Log entry
   * @returns {void}
   */
  log(entry) {
    throw new Error('log() must be implemented by transport');
  }

  /**
   * Formats log entry
   * @param {LogEntry} entry - Log entry
   * @returns {string} Formatted entry
   */
  format(entry) {
    const { timestamp, level, message, ...meta } = entry;
    let formatted = `${timestamp} [${level.toUpperCase()}] ${message}`;

    if (Object.keys(meta).length > 0) {
      formatted += ` ${JSON.stringify(meta)}`;
    }

    return formatted;
  }

  /**
   * Flushes any pending logs
   * @returns {Promise<void>}
   */
  async flush() {
    // Override in subclasses if needed
  }

  /**
   * Closes the transport
   * @returns {Promise<void>}
   */
  async close() {
    // Override in subclasses if needed
  }
}
