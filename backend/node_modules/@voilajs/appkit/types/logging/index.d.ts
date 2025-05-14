export { FileTransport } from "./transports/file.js";
export { ConsoleTransport } from "./transports/console.js";
export type LoggerOptions = import("./logger.js").LoggerOptions;
export type LogEntry = import("./logger.js").LogEntry;
export type BaseTransport = import("./transports/base.js").BaseTransport;
export { createLogger, Logger } from "./logger.js";
