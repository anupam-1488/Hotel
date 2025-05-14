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
export function createDb(config: {
    url: string;
    strategy?: string;
    adapter?: string;
    pooling?: any;
    cache?: any;
    adapterConfig?: any;
}): any;
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
export function createMultiTenantDb(config: {
    url: string;
    strategy?: string;
    adapter?: string;
    pooling?: any;
    cache?: any;
    adapterConfig?: any;
}): any;
