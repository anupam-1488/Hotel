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
    constructor(options?: FileTransportOptions & TransportOptions);
    dirname: string;
    filename: string;
    maxSize: number;
    retentionDays: number;
    datePattern: string;
    currentSize: number;
    currentDate: string;
    stream: any;
    /**
     * Ensures log directory exists
     * @private
     * @returns {void}
     */
    private ensureDirectoryExists;
    /**
     * Gets current date string for filename
     * @private
     * @returns {string} Formatted date
     */
    private getCurrentDate;
    /**
     * Gets current log filename
     * @private
     * @returns {string} Current log filename
     */
    private getCurrentFilename;
    /**
     * Creates write stream for current log file
     * @private
     * @returns {void}
     */
    private createStream;
    /**
     * Rotates log file if needed
     * @private
     * @returns {void}
     */
    private checkRotation;
    /**
     * Performs date-based rotation
     * @private
     * @returns {void}
     */
    private rotate;
    /**
     * Performs size-based rotation
     * @private
     * @returns {void}
     */
    private rotateSizeBased;
    /**
     * Sets up retention cleanup
     * @private
     * @returns {void}
     */
    private setupRetentionCleanup;
    cleanupInterval: any;
    /**
     * Cleans old log files based on retention policy
     * @private
     * @returns {Promise<void>}
     */
    private cleanOldLogs;
}
export type TransportOptions = import("./base.js").TransportOptions;
export type LogEntry = import("./base.js").LogEntry;
export type FileTransportOptions = {
    /**
     * - Directory for log files
     */
    dirname?: string;
    /**
     * - Base filename for logs
     */
    filename?: string;
    /**
     * - Maximum file size before rotation (10MB default)
     */
    maxSize?: number;
    /**
     * - Days to retain log files
     */
    retentionDays?: number;
    /**
     * - Date pattern for filename
     */
    datePattern?: string;
};
import { BaseTransport } from './base.js';
