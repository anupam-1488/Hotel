/**
 * Creates a logger instance
 * @param {LoggerOptions} [options={}] - Logger configuration
 * @returns {Logger} Logger instance
 */
export function createLogger(options?: LoggerOptions): Logger;
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
    constructor(options?: LoggerOptions);
    level: LogLevel;
    defaultMeta: {
        [x: string]: any;
    };
    transports: BaseTransport[];
    levelValue: number;
    /**
     * Gets default transports based on environment
     * @private
     * @param {LoggerOptions} options - Logger options
     * @returns {BaseTransport[]} Default transports
     */
    private getDefaultTransports;
    /**
     * Logs info message
     * @param {string} message - Log message
     * @param {Object<string, any>} [meta={}] - Additional metadata
     * @returns {void}
     */
    info(message: string, meta?: {
        [x: string]: any;
    }): void;
    /**
     * Logs error message
     * @param {string} message - Log message
     * @param {Object<string, any>} [meta={}] - Additional metadata
     * @returns {void}
     */
    error(message: string, meta?: {
        [x: string]: any;
    }): void;
    /**
     * Logs warning message
     * @param {string} message - Log message
     * @param {Object<string, any>} [meta={}] - Additional metadata
     * @returns {void}
     */
    warn(message: string, meta?: {
        [x: string]: any;
    }): void;
    /**
     * Logs debug message
     * @param {string} message - Log message
     * @param {Object<string, any>} [meta={}] - Additional metadata
     * @returns {void}
     */
    debug(message: string, meta?: {
        [x: string]: any;
    }): void;
    /**
     * Creates child logger with additional context
     * @param {Object<string, any>} bindings - Additional context bindings
     * @returns {Logger} Child logger instance
     */
    child(bindings: {
        [x: string]: any;
    }): Logger;
    /**
     * Core logging method
     * @private
     * @param {LogLevel} level - Log level
     * @param {string} message - Log message
     * @param {Object<string, any>} meta - Metadata
     * @returns {void}
     */
    private log;
    /**
     * Flushes all transports
     * @returns {Promise<void>}
     */
    flush(): Promise<void>;
    /**
     * Closes all transports
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
}
export type LogLevel = "error" | "warn" | "info" | "debug";
export type LogEntry = {
    /**
     * - ISO timestamp
     */
    timestamp: string;
    /**
     * - Log level
     */
    level: LogLevel;
    /**
     * - Log message
     */
    message: string;
    /**
     * - Additional metadata
     */
    meta?: {
        [x: string]: any;
    };
};
export type LoggerOptions = {
    /**
     * - Minimum log level
     */
    level?: LogLevel;
    /**
     * - Default metadata included in all logs
     */
    defaultMeta?: {
        [x: string]: any;
    };
    /**
     * - Custom log transports
     */
    transports?: BaseTransport[];
    /**
     * - Enable file logging
     */
    enableFileLogging?: boolean;
    /**
     * - Directory for log files
     */
    dirname?: string;
    /**
     * - Base filename for logs
     */
    filename?: string;
    /**
     * - Days to retain log files
     */
    retentionDays?: number;
    /**
     * - Maximum file size before rotation
     */
    maxSize?: number;
};
/**
 * Log levels enumeration
 */
export type LogLevels = number;
export namespace LogLevels {
    let error: number;
    let warn: number;
    let info: number;
    let debug: number;
}
