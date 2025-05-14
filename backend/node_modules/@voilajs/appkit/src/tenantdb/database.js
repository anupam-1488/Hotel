/**
 * @voilajs/appkit - Multi-tenant database manager
 * @module @voilajs/appkit/tenantdb/database
 */

import { RowStrategy } from './strategies/row.js';
import { SchemaStrategy } from './strategies/schema.js';
import { DatabaseStrategy } from './strategies/database.js';
import { PrismaAdapter } from './adapters/prisma.js';
import { MongooseAdapter } from './adapters/mongoose.js';
import { KnexAdapter } from './adapters/knex.js';
import { TypeORMAdapter } from './adapters/typeorm.js';

// Available strategies
const strategies = {
  row: RowStrategy,
  schema: SchemaStrategy,
  database: DatabaseStrategy
};

// Available adapters
const adapters = {
  prisma: PrismaAdapter,
  mongoose: MongooseAdapter,
  knex: KnexAdapter,
  typeorm: TypeORMAdapter  
};

// Default configuration
const DEFAULT_OPTIONS = {
  strategy: 'row',
  adapter: 'prisma',
  pooling: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000
  },
  cache: {
    enabled: true,
    ttl: 300000 // 5 minutes
  }
};

/**
 * Creates a multi-tenant database instance
 * @param {Object} config - Configuration options
 * @param {string} config.url - Database connection URL
 * @param {string} [config.strategy='row'] - Tenancy strategy: 'row', 'schema', or 'database'
 * @param {string} [config.adapter='prisma'] - Database adapter: 'prisma', 'mongoose', or 'knex'
 * @param {Object} [config.pooling] - Connection pooling options
 * @param {Object} [config.cache] - Connection cache options
 * @param {Object} [config.adapterConfig] - Adapter-specific configuration
 * @returns {Object} Multi-tenant database instance
 */
export function createDb(config) {
  const options = {
    ...DEFAULT_OPTIONS,
    ...config,
    pooling: { ...DEFAULT_OPTIONS.pooling, ...config.pooling },
    cache: { ...DEFAULT_OPTIONS.cache, ...config.cache }
  };

  if (!options.url) {
    throw new Error('Database URL is required');
  }

  // Initialize adapter
  const AdapterClass = adapters[options.adapter];
  if (!AdapterClass) {
    throw new Error(`Unknown adapter: ${options.adapter}. Supported: ${Object.keys(adapters).join(', ')}`);
  }

  const adapter = new AdapterClass(options);

  // Initialize strategy
  const StrategyClass = strategies[options.strategy];
  if (!StrategyClass) {
    throw new Error(`Unknown strategy: ${options.strategy}. Supported: ${Object.keys(strategies).join(', ')}`);
  }

  const strategy = new StrategyClass(options, adapter);

  // Connection cache
  const connectionCache = new Map();
  const connectionCounts = new Map();

  // Cache management
  let cacheCleanupInterval;
  if (options.cache.enabled) {
    // Periodically clean up stale connections
    cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [tenantId, cached] of connectionCache.entries()) {
        if (now - cached.timestamp > options.cache.ttl) {
          cached.client.$disconnect?.();
          connectionCache.delete(tenantId);
          connectionCounts.delete(tenantId);
        }
      }
    }, options.cache.ttl);
  }

  const instance = {
    /**
     * Gets database connection for a specific tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<Object>} Database client for the tenant
     */
    async forTenant(tenantId) {
      if (!tenantId) {
        throw new Error('Tenant ID is required');
      }

      // Check cache first
      if (options.cache.enabled && connectionCache.has(tenantId)) {
        const cached = connectionCache.get(tenantId);
        if (Date.now() - cached.timestamp < options.cache.ttl) {
          connectionCounts.set(tenantId, (connectionCounts.get(tenantId) || 0) + 1);
          return cached.client;
        } else {
          // Cache expired, disconnect old client
          await cached.client.$disconnect?.();
          connectionCache.delete(tenantId);
        }
      }

      // Create new connection through strategy
      const client = await strategy.getConnection(tenantId);
      
      // Cache connection if enabled
      if (options.cache.enabled) {
        connectionCache.set(tenantId, {
          client,
          timestamp: Date.now()
        });
        connectionCounts.set(tenantId, 1);
      }

      return client;
    },

    /**
     * Creates a new tenant
     * @param {string} tenantId - Tenant identifier
     * @param {Object} [options] - Creation options
     * @returns {Promise<void>}
     */
    async createTenant(tenantId, options = {}) {
      if (!tenantId) {
        throw new Error('Tenant ID is required');
      }

      // Validate tenant ID format
      if (!/^[a-zA-Z0-9_-]+$/.test(tenantId)) {
        throw new Error('Tenant ID must contain only alphanumeric characters, underscores, and hyphens');
      }

      // Check if tenant already exists
      const exists = await this.tenantExists(tenantId);
      if (exists) {
        throw new Error(`Tenant '${tenantId}' already exists`);
      }

      return strategy.createTenant(tenantId, options);
    },

    /**
     * Deletes a tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async deleteTenant(tenantId) {
      if (!tenantId) {
        throw new Error('Tenant ID is required');
      }

      // Clear from cache first
      if (connectionCache.has(tenantId)) {
        const cached = connectionCache.get(tenantId);
        await cached.client.$disconnect?.();
        connectionCache.delete(tenantId);
        connectionCounts.delete(tenantId);
      }

      return strategy.deleteTenant(tenantId);
    },

    /**
     * Runs migrations for a tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async migrateTenant(tenantId) {
      if (!tenantId) {
        throw new Error('Tenant ID is required');
      }

      return strategy.migrateTenant(tenantId);
    },

    /**
     * Lists all tenants
     * @returns {Promise<string[]>} Array of tenant IDs
     */
    async listTenants() {
      return strategy.listTenants();
    },

    /**
     * Checks if tenant exists
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<boolean>}
     */
    async tenantExists(tenantId) {
      if (!tenantId) {
        return false;
      }

      return strategy.tenantExists(tenantId);
    },

    /**
     * Gets connection statistics
     * @returns {Object} Connection stats
     */
    getStats() {
      return {
        adapter: options.adapter,
        strategy: options.strategy,
        cachedConnections: connectionCache.size,
        connectionCounts: Object.fromEntries(connectionCounts),
        totalConnections: Array.from(connectionCounts.values()).reduce((a, b) => a + b, 0),
        cacheEnabled: options.cache.enabled,
        cacheConfig: options.cache
      };
    },

    /**
     * Clears connection cache
     * @returns {Promise<void>}
     */
    async clearCache() {
      for (const [tenantId, cached] of connectionCache.entries()) {
        try {
          await cached.client.$disconnect?.();
        } catch (error) {
          console.error(`Error disconnecting tenant ${tenantId}:`, error);
        }
      }
      connectionCache.clear();
      connectionCounts.clear();
    },

    /**
     * Disconnects all connections and cleans up
     * @returns {Promise<void>}
     */
    async disconnect() {
      // Clear cache cleanup interval
      if (cacheCleanupInterval) {
        clearInterval(cacheCleanupInterval);
      }

      // Clear all cached connections
      await this.clearCache();
      
      // Disconnect adapter
      await adapter.disconnect();
      
      // Disconnect strategy
      await strategy.disconnect();
    },

    /**
     * Gets the raw adapter instance
     * @returns {Object} Raw adapter
     */
    getAdapter() {
      return adapter;
    },

    /**
     * Gets the raw strategy instance
     * @returns {Object} Raw strategy
     */
    getStrategy() {
      return strategy;
    },

    /**
     * Health check for the database connection
     * @returns {Promise<boolean>} True if healthy
     */
    async healthCheck() {
      try {
        // Try to list tenants as a basic health check
        await this.listTenants();
        return true;
      } catch (error) {
        return false;
      }
    },

    /**
     * Gets configuration
     * @returns {Object} Current configuration
     */
    getConfig() {
      return { ...options };
    }
  };

  // Add cleanup on process exit
  process.on('SIGINT', async () => {
    await instance.disconnect();
  });

  process.on('SIGTERM', async () => {
    await instance.disconnect();
  });

  return instance;
}

/**
 * Alias for backward compatibility
 */
export const createMultiTenantDb = createDb;