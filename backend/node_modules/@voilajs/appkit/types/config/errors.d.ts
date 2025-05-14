/**
 * @voilajs/appkit - Configuration errors
 * @module @voilajs/appkit/config/errors
 */
/**
 * Configuration-specific error class
 */
export class ConfigError extends Error {
    constructor(message: any, code?: string, details?: {});
    code: string;
    details: {};
}
