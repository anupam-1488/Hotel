/**
 * Initialize all core services with a single configuration object
 *
 * @param {Object} options - Configuration for all services
 * @param {Object} [options.auth] - Auth module configuration
 * @param {Object} [options.database] - Database module configuration
 * @param {Object} [options.cache] - Cache module configuration
 * @param {Object} [options.events] - Events module configuration
 * @param {Object} [options.security] - Security module configuration
 * @param {Object} [options.logging] - Logging module configuration
 * @param {Object} [options.storage] - Storage module configuration
 * @param {Object} [options.email] - Email module configuration
 * @param {Object} [options.queue] - Queue module configuration
 * @param {Object} [options.config] - Additional config options
 * @returns {Promise<Object>} Initialized services
 */
export function initializeApp(options?: {
    auth?: any;
    database?: any;
    cache?: any;
    events?: any;
    security?: any;
    logging?: any;
    storage?: any;
    email?: any;
    queue?: any;
    config?: any;
}): Promise<any>;
/**
 * Shutdown all initialized services
 *
 * @returns {Promise<void>}
 */
export function shutdownApp(): Promise<void>;
export * as auth from "./auth/index.js";
export * as tenantdb from "./tenantdb/index.js";
export * as cache from "./cache/index.js";
export * as events from "./events/index.js";
export * as security from "./security/index.js";
export * as error from "./error/index.js";
export * as logging from "./logging/index.js";
export * as storage from "./storage/index.js";
export * as email from "./email/index.js";
export * as queue from "./queue/index.js";
export * as config from "./config/index.js";
export * as validation from "./validation/index.js";
export * as utils from "./utils/index.js";
/**
 * Library version
 * @type {string}
 */
export const VERSION: string;
