/**
 * @voilajs/appkit - Base adapter for multi-tenant database
 * @module @voilajs/appkit/tenantdb/adapters/base
 */
/**
 * Base adapter class that defines the interface for all adapters
 */
export class BaseAdapter {
    constructor(options: any);
    options: any;
    client: any;
    /**
     * Connects to the database
     * @param {Object} config - Connection configuration
     * @returns {Promise<Object>} Database client
     */
    connect(config: any): Promise<any>;
    /**
     * Disconnects from the database
     * @returns {Promise<void>}
     */
    disconnect(): Promise<void>;
    /**
     * Creates a new database client instance
     * @param {Object} config - Client configuration
     * @returns {Promise<Object>} New client instance
     */
    createClient(config: any): Promise<any>;
    /**
     * Executes a raw query
     * @param {string} query - SQL/database query
     * @param {Array} [params] - Query parameters
     * @returns {Promise<any>} Query result
     */
    executeQuery(query: string, params?: any[]): Promise<any>;
    /**
     * Creates a new database
     * @param {string} name - Database name
     * @returns {Promise<void>}
     */
    createDatabase(name: string): Promise<void>;
    /**
     * Drops a database
     * @param {string} name - Database name
     * @returns {Promise<void>}
     */
    dropDatabase(name: string): Promise<void>;
    /**
     * Creates a schema
     * @param {string} name - Schema name
     * @returns {Promise<void>}
     */
    createSchema(name: string): Promise<void>;
    /**
     * Drops a schema
     * @param {string} name - Schema name
     * @returns {Promise<void>}
     */
    dropSchema(name: string): Promise<void>;
    /**
     * Lists all databases
     * @returns {Promise<string[]>} Array of database names
     */
    listDatabases(): Promise<string[]>;
    /**
     * Lists all schemas
     * @returns {Promise<string[]>} Array of schema names
     */
    listSchemas(): Promise<string[]>;
    /**
     * Detects the database provider from connection URL
     * @returns {string} Provider name
     */
    detectProvider(): string;
    /**
     * Applies middleware to client (for row-level isolation)
     * @param {Object} client - Database client
     * @param {string} tenantId - Tenant identifier
     * @returns {Object} Client with middleware
     */
    applyTenantMiddleware(client: any, tenantId: string): any;
}
