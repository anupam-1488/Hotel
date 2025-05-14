/**
 * @voilajs/appkit - File transport for logging
 * @module @voilajs/appkit/logging/transports/file
 */

import fs from 'fs';
import path from 'path';
import { BaseTransport } from './base.js';

/**
 * @typedef {import('./base.js').TransportOptions} TransportOptions
 * @typedef {import('./base.js').LogEntry} LogEntry
 */

/**
 * @typedef {Object} FileTransportOptions
 * @property {string} [dirname='logs'] - Directory for log files
 * @property {string} [filename='app.log'] - Base filename for logs
 * @property {number} [maxSize=10485760] - Maximum file size before rotation (10MB default)
 * @property {number} [retentionDays=5] - Days to retain log files
 * @property {string} [datePattern='YYYY-MM-DD'] - Date pattern for filename
 */

/**
 * File transport implementation with rotation and retention
 * @extends BaseTransport
 */
export class FileTransport extends BaseTransport {
  /**
   * Creates a new FileTransport instance
   * @param {FileTransportOptions & TransportOptions} [options={}] - File transport options
   */
  constructor(options = {}) {
    super(options);

    // Configuration with smart defaults
    this.dirname = options.dirname || 'logs';
    this.filename = options.filename || 'app.log';
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    this.retentionDays = options.retentionDays ?? 5; // 5 days default
    this.datePattern = options.datePattern || 'YYYY-MM-DD';

    // State
    this.currentSize = 0;
    this.currentDate = this.getCurrentDate();
    this.stream = null;

    // Initialize
    this.ensureDirectoryExists();
    this.createStream();
    this.setupRetentionCleanup();
  }

  /**
   * Ensures log directory exists
   * @private
   * @returns {void}
   */
  ensureDirectoryExists() {
    if (!fs.existsSync(this.dirname)) {
      fs.mkdirSync(this.dirname, { recursive: true });
    }
  }

  /**
   * Gets current date string for filename
   * @private
   * @returns {string} Formatted date
   */
  getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * Gets current log filename
   * @private
   * @returns {string} Current log filename
   */
  getCurrentFilename() {
    const base = path.basename(this.filename, path.extname(this.filename));
    const ext = path.extname(this.filename);
    return `${base}-${this.currentDate}${ext}`;
  }

  /**
   * Creates write stream for current log file
   * @private
   * @returns {void}
   */
  createStream() {
    const filename = this.getCurrentFilename();
    const filepath = path.join(this.dirname, filename);

    // Get current file size if it exists
    try {
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        this.currentSize = stats.size;
      } else {
        this.currentSize = 0;
      }
    } catch (error) {
      this.currentSize = 0;
    }

    // Create write stream in append mode
    this.stream = fs.createWriteStream(filepath, { flags: 'a' });

    this.stream.on('error', (error) => {
      console.error('Log file write error:', error);
    });
  }

  /**
   * Rotates log file if needed
   * @private
   * @returns {void}
   */
  checkRotation() {
    const currentDate = this.getCurrentDate();

    // Date-based rotation
    if (currentDate !== this.currentDate) {
      this.rotate();
      return;
    }

    // Size-based rotation
    if (this.currentSize >= this.maxSize) {
      this.rotateSizeBased();
    }
  }

  /**
   * Performs date-based rotation
   * @private
   * @returns {void}
   */
  rotate() {
    if (this.stream) {
      this.stream.end();
    }

    this.currentDate = this.getCurrentDate();
    this.currentSize = 0;
    this.createStream();
  }

  /**
   * Performs size-based rotation
   * @private
   * @returns {void}
   */
  rotateSizeBased() {
    if (this.stream) {
      this.stream.end();
    }

    const filename = this.getCurrentFilename();
    const filepath = path.join(this.dirname, filename);

    try {
      // Check if file exists before rotation
      if (!fs.existsSync(filepath)) {
        // File doesn't exist, just create new stream
        this.currentSize = 0;
        this.createStream();
        return;
      }

      // Find next available rotation number
      let rotation = 1;
      while (fs.existsSync(`${filepath}.${rotation}`)) {
        rotation++;
      }

      // Rename current file
      fs.renameSync(filepath, `${filepath}.${rotation}`);
    } catch (error) {
      console.error('Error during file rotation:', error);
    }

    // Create new stream
    this.currentSize = 0;
    this.createStream();
  }

  /**
   * Sets up retention cleanup
   * @private
   * @returns {void}
   */
  setupRetentionCleanup() {
    // Run cleanup on startup
    this.cleanOldLogs();

    // Run cleanup daily
    this.cleanupInterval = setInterval(
      () => {
        this.cleanOldLogs();
      },
      24 * 60 * 60 * 1000
    );
  }

  /**
   * Cleans old log files based on retention policy
   * @private
   * @returns {Promise<void>}
   */
  async cleanOldLogs() {
    if (this.retentionDays <= 0) return; // Retention disabled

    try {
      const files = await fs.promises.readdir(this.dirname);
      const now = Date.now();
      const maxAge = this.retentionDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        // Only process log files that match our filename pattern
        const base = path.basename(this.filename, path.extname(this.filename));
        if (!file.startsWith(base)) {
          continue;
        }

        const filepath = path.join(this.dirname, file);
        const stats = await fs.promises.stat(filepath);

        if (now - stats.mtimeMs > maxAge) {
          await fs.promises.unlink(filepath);
          console.log(`Deleted old log file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning old logs:', error);
    }
  }

  /**
   * Logs entry to file
   * @param {LogEntry} entry - Log entry
   * @returns {void}
   */
  log(entry) {
    try {
      this.checkRotation();

      const line = JSON.stringify(entry) + '\n';
      const size = Buffer.byteLength(line);

      this.stream.write(line);
      this.currentSize += size;
    } catch (error) {
      console.error('Error logging to file:', error);
    }
  }

  /**
   * Flushes any pending writes
   * @returns {Promise<void>}
   */
  flush() {
    return new Promise((resolve) => {
      if (this.stream && this.stream.writable) {
        this.stream.once('drain', resolve);
        this.stream.write('');
      } else {
        resolve();
      }
    });
  }

  /**
   * Closes the transport
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve) => {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      if (this.stream) {
        this.stream.end(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
