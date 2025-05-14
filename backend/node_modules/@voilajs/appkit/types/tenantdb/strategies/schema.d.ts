/**
 * @voilajs/appkit - Schema-per-tenant strategy
 * @module @voilajs/appkit/tenantdb/strategies/schema
 */
/**
 * Schema-per-tenant strategy (PostgreSQL only)
 * Each tenant has their own schema within the same database
 */
export class SchemaStrategy {
    constructor(options: any);
    options: any;
    adminClient: any;
    /**
     * Gets admin connection
     * @private
     * @returns {Promise<Object>} Admin Prisma client
     */
    private getAdminConnection;
    /**
     * Gets database connection for tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<Object>} Prisma client for tenant schema
     */
    getConnection(tenantId: string): Promise<any>;
    /**
     * Creates a new tenant schema
     * @param {string} tenantId - Tenant identifier
     * @param {Object} [options] - Creation options
     * @returns {Promise<void>}
     */
    createTenant(tenantId: string, options?: any): Promise<void>;
    /**
     * Deletes a tenant schema
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    deleteTenant(tenantId: string): Promise<void>;
    /**
     * Runs migrations for a tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    migrateTenant(tenantId: string): Promise<void>;
    /**
     * Lists all tenant schemas
     * @returns {Promise<string[]>} Array of tenant IDs
     */
    listTenants(): Promise<string[]>;
    /**
     * Checks if tenant schema exists
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<boolean>}
     */
    tenantExists(tenantId: string): Promise<boolean>;
    /**
     * Copies schema structure from template
     * @private
     * @param {string} fromSchema - Source schema
     * @param {string} toSchema - Target schema
     * @returns {Promise<void>}
     */
    private copySchemaStructure;
    /**
     * Sanitizes schema name to prevent SQL injection
     * @private
     * @param {string} tenantId - Tenant identifier
     * @returns {string} Sanitized schema name
     */
    private sanitizeSchemaName;
    /**
     * Disconnects all connections
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
}
