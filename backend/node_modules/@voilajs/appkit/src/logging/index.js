/**
 * @voilajs/appkit - Logging module
 * @module @voilajs/appkit/logging
 */

// Main exports file
export { createLogger, Logger } from './logger.js';
export { FileTransport } from './transports/file.js';
export { ConsoleTransport } from './transports/console.js';

// Re-export types for better type inference
/**
 * @typedef {import('./logger.js').LoggerOptions} LoggerOptions
 * @typedef {import('./logger.js').LogEntry} LogEntry
 * @typedef {import('./transports/base.js').BaseTransport} BaseTransport
 */
