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
    constructor(options?: TransportOptions);
    options: TransportOptions;
    /**
     * Logs an entry
     * @abstract
     * @param {LogEntry} entry - Log entry
     * @returns {void}
     */
    log(entry: LogEntry): void;
    /**
     * Formats log entry
     * @param {LogEntry} entry - Log entry
     * @returns {string} Formatted entry
     */
    format(entry: LogEntry): string;
    /**
     * Flushes any pending logs
     * @returns {Promise<void>}
     */
    flush(): Promise<void>;
    /**
     * Closes the transport
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
}
export type TransportOptions = {
    /**
     * - Minimum log level for this transport
     */
    level?: string;
};
export type LogEntry = {
    /**
     * - ISO timestamp
     */
    timestamp: string;
    /**
     * - Log level
     */
    level: "error" | "warn" | "info" | "debug";
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
