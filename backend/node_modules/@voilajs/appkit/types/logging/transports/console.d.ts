/**
 * @typedef {import('./base.js').TransportOptions} TransportOptions
 * @typedef {import('./base.js').LogEntry} LogEntry
 */
/**
 * @typedef {Object} ConsoleTransportOptions
 * @property {boolean} [colorize=true] - Apply colors to output
 * @property {boolean} [prettyPrint=false] - Pretty print JSON metadata
 */
/**
 * Console transport implementation
 * @extends BaseTransport
 */
export class ConsoleTransport extends BaseTransport {
    /**
     * Creates a new ConsoleTransport instance
     * @param {ConsoleTransportOptions & TransportOptions} [options={}] - Console transport options
     */
    constructor(options?: ConsoleTransportOptions & TransportOptions);
    colorize: boolean;
    prettyPrint: boolean;
    /**
     * Pretty format for development
     * @param {LogEntry} entry - Log entry
     * @returns {string} Formatted entry
     */
    prettyFormat(entry: LogEntry): string;
    /**
     * Apply color to output
     * @param {string} output - Output string
     * @param {'error'|'warn'|'info'|'debug'} level - Log level
     * @returns {string} Colored output
     */
    applyColor(output: string, level: "error" | "warn" | "info" | "debug"): string;
    /**
     * Get level label with emoji
     * @param {'error'|'warn'|'info'|'debug'} level - Log level
     * @returns {string} Level label
     */
    getLevelLabel(level: "error" | "warn" | "info" | "debug"): string;
}
export type TransportOptions = import("./base.js").TransportOptions;
export type LogEntry = import("./base.js").LogEntry;
export type ConsoleTransportOptions = {
    /**
     * - Apply colors to output
     */
    colorize?: boolean;
    /**
     * - Pretty print JSON metadata
     */
    prettyPrint?: boolean;
};
import { BaseTransport } from './base.js';
