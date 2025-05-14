/**
 * @voilajs/appkit - Row-level multi-tenancy strategy
 * @module @voilajs/appkit/tenantdb/strategies/row
 */
/**
 * Row-level multi-tenancy strategy
 * All tenants share the same database and tables, with tenant isolation via a tenantId column
 */
export class RowStrategy {
    constructor(options: any);
    options: any;
    prismaClient: any;
    /**
     * Gets database connection for tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<Object>} Prisma client with tenant middleware
     */
    getConnection(tenantId: string): Promise<any>;
    /**
     * Creates a new tenant (no-op for row-level strategy)
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    createTenant(tenantId: string): Promise<void>;
    /**
     * Deletes a tenant's data
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    deleteTenant(tenantId: string): Promise<void>;
    /**
     * Runs migrations (no-op for row-level strategy)
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    migrateTenant(tenantId: string): Promise<void>;
    /**
     * Lists all tenants
     * @returns {Promise<string[]>} Array of tenant IDs
     */
    listTenants(): Promise<string[]>;
    /**
     * Checks if tenant exists
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<boolean>}
     */
    tenantExists(tenantId: string): Promise<boolean>;
    /**
     * Disconnects all connections
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
}
