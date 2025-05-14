/**
 * @voilajs/appkit - A minimal, framework-agnostic Node.js application toolkit
 * Main library entry point
 *
 * This file re-exports all public APIs from individual modules, providing a
 * consolidated access point to the entire library functionality.
 *
 * @module @voilajs/appkit
 */

// Export all modules as namespaces
export * as auth from './auth/index.js';
export * as tenantdb from './tenantdb/index.js';
export * as cache from './cache/index.js';
export * as events from './events/index.js';
export * as security from './security/index.js';
export * as error from './error/index.js';
export * as logging from './logging/index.js';
export * as storage from './storage/index.js';
export * as email from './email/index.js';
export * as queue from './queue/index.js';
export * as config from './config/index.js';
export * as validation from './validation/index.js';
export * as utils from './utils/index.js';

/**
 * Library version
 * @type {string}
 */
export const VERSION = '1.0.0';

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
export async function initializeApp(options = {}) {
  // Set configuration
  if (options.config) {
    config.setConfig(options.config);
  }

  // Initialize logger first for proper error tracking
  let services = {};
  if (options.logging) {
    services.logger = logging.createLogger(options.logging);
  }

  try {
    // Initialize database if configured
    if (options.database) {
      const { adapter, ...dbConfig } = options.database;
      services.database = await database.initDatabase(adapter, dbConfig);
    }

    // Initialize cache if configured
    if (options.cache) {
      const { strategy, ...cacheConfig } = options.cache;
      services.cache = await cache.initCache(strategy, cacheConfig);
    }

    // Initialize storage if configured
    if (options.storage) {
      const { provider, ...storageConfig } = options.storage;
      services.storage = await storage.initStorage(provider, storageConfig);
    }

    // Initialize email if configured
    if (options.email) {
      const { provider, ...emailConfig } = options.email;
      services.email = await email.initEmail(provider, emailConfig);
    }

    // Initialize queue if configured
    if (options.queue) {
      const { adapter, ...queueConfig } = options.queue;
      services.queue = await queue.initQueue(adapter, queueConfig);
    }

    return services;
  } catch (error) {
    // Log initialization error
    if (services.logger) {
      services.logger.error('Failed to initialize app', { error });
    }
    throw error;
  }
}

/**
 * Shutdown all initialized services
 *
 * @returns {Promise<void>}
 */
export async function shutdownApp() {
  try {
    // Close database connection if initialized
    try {
      await database.closeDatabase();
    } catch (error) {
      console.error('Error closing database connection', error);
    }

    // Additional cleanup for other services can be added here

    return true;
  } catch (error) {
    console.error('Error during app shutdown', error);
    throw error;
  }
}
