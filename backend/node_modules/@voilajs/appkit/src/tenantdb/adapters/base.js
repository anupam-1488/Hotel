/**
 * @voilajs/appkit - Base adapter for multi-tenant database
 * @module @voilajs/appkit/tenantdb/adapters/base
 */

/**
 * Base adapter class that defines the interface for all adapters
 */
export class BaseAdapter {
  constructor(options) {
    this.options = options;
    this.client = null;
  }

  /**
   * Connects to the database
   * @param {Object} config - Connection configuration
   * @returns {Promise<Object>} Database client
   */
  async connect(config) {
    throw new Error('connect() must be implemented by adapter');
  }

  /**
   * Disconnects from the database
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented by adapter');
  }

  /**
   * Creates a new database client instance
   * @param {Object} config - Client configuration
   * @returns {Promise<Object>} New client instance
   */
  async createClient(config) {
    throw new Error('createClient() must be implemented by adapter');
  }

  /**
   * Executes a raw query
   * @param {string} query - SQL/database query
   * @param {Array} [params] - Query parameters
   * @returns {Promise<any>} Query result
   */
  async executeQuery(query, params = []) {
    throw new Error('executeQuery() must be implemented by adapter');
  }

  /**
   * Creates a new database
   * @param {string} name - Database name
   * @returns {Promise<void>}
   */
  async createDatabase(name) {
    throw new Error('createDatabase() must be implemented by adapter');
  }

  /**
   * Drops a database
   * @param {string} name - Database name
   * @returns {Promise<void>}
   */
  async dropDatabase(name) {
    throw new Error('dropDatabase() must be implemented by adapter');
  }

  /**
   * Creates a schema
   * @param {string} name - Schema name
   * @returns {Promise<void>}
   */
  async createSchema(name) {
    throw new Error('createSchema() must be implemented by adapter');
  }

  /**
   * Drops a schema
   * @param {string} name - Schema name
   * @returns {Promise<void>}
   */
  async dropSchema(name) {
    throw new Error('dropSchema() must be implemented by adapter');
  }

  /**
   * Lists all databases
   * @returns {Promise<string[]>} Array of database names
   */
  async listDatabases() {
    throw new Error('listDatabases() must be implemented by adapter');
  }

  /**
   * Lists all schemas
   * @returns {Promise<string[]>} Array of schema names
   */
  async listSchemas() {
    throw new Error('listSchemas() must be implemented by adapter');
  }

  /**
   * Detects the database provider from connection URL
   * @returns {string} Provider name
   */
  detectProvider() {
    const url = this.options.url;
    if (url.includes('postgresql://') || url.includes('postgres://')) {
      return 'postgresql';
    }
    if (url.includes('mysql://')) {
      return 'mysql';
    }
    if (url.includes('mongodb://') || url.includes('mongodb+srv://')) {
      return 'mongodb';
    }
    if (url.includes('sqlite://') || url.includes('file:')) {
      return 'sqlite';
    }
    return 'unknown';
  }

  /**
   * Applies middleware to client (for row-level isolation)
   * @param {Object} client - Database client
   * @param {string} tenantId - Tenant identifier
   * @returns {Object} Client with middleware
   */
  applyTenantMiddleware(client, tenantId) {
    throw new Error('applyTenantMiddleware() must be implemented by adapter');
  }
}