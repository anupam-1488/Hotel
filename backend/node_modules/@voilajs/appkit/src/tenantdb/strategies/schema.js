/**
 * @voilajs/appkit - Schema-per-tenant strategy
 * @module @voilajs/appkit/tenantdb/strategies/schema
 */

/**
 * Schema-per-tenant strategy (PostgreSQL only)
 * Each tenant has their own schema within the same database
 */
export class SchemaStrategy {
    constructor(options) {
      this.options = options;
      this.adminClient = null;
    }
  
    /**
     * Gets admin connection
     * @private
     * @returns {Promise<Object>} Admin Prisma client
     */
    async getAdminConnection() {
      if (!this.adminClient) {
        const { PrismaClient } = this.options.prismaClient || await import('@prisma/client');
        this.adminClient = new PrismaClient({
          datasourceUrl: this.options.url
        });
      }
      return this.adminClient;
    }
  
    /**
     * Gets database connection for tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<Object>} Prisma client for tenant schema
     */
    async getConnection(tenantId) {
      const { PrismaClient } = this.options.prismaClient || await import('@prisma/client');
      
      // Validate schema name
      const schemaName = this.sanitizeSchemaName(tenantId);
      
      const prisma = new PrismaClient({
        datasourceUrl: this.options.url,
        log: this.options.log || ['error']
      });
  
      // Set search_path to tenant schema
      await prisma.$executeRawUnsafe(`SET search_path TO "${schemaName}"`);
  
      return prisma;
    }
  
    /**
     * Creates a new tenant schema
     * @param {string} tenantId - Tenant identifier
     * @param {Object} [options] - Creation options
     * @returns {Promise<void>}
     */
    async createTenant(tenantId, options = {}) {
      const schemaName = this.sanitizeSchemaName(tenantId);
      const admin = await this.getAdminConnection();
  
      try {
        // Create schema
        await admin.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
  
        // Copy structure from template schema if specified
        if (options.template) {
          await this.copySchemaStructure(options.template, schemaName);
        }
  
        // Run migrations for the new schema
        if (options.runMigrations !== false) {
          await this.migrateTenant(tenantId);
        }
      } catch (error) {
        throw new Error(`Failed to create tenant schema: ${error.message}`);
      }
    }
  
    /**
     * Deletes a tenant schema
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async deleteTenant(tenantId) {
      const schemaName = this.sanitizeSchemaName(tenantId);
      const admin = await this.getAdminConnection();
  
      try {
        await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      } catch (error) {
        throw new Error(`Failed to delete tenant schema: ${error.message}`);
      }
    }
  
    /**
     * Runs migrations for a tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async migrateTenant(tenantId) {
      const schemaName = this.sanitizeSchemaName(tenantId);
      
      // This is a simplified version
      // In practice, you'd use Prisma Migrate or a migration tool
      const admin = await this.getAdminConnection();
      
      try {
        // Set search_path for migrations
        await admin.$executeRawUnsafe(`SET search_path TO "${schemaName}"`);
        
        // Run your migration logic here
        // This could involve executing SQL files or using a migration library
        
        // Reset search_path
        await admin.$executeRawUnsafe(`SET search_path TO public`);
      } catch (error) {
        throw new Error(`Failed to migrate tenant schema: ${error.message}`);
      }
    }
  
    /**
     * Lists all tenant schemas
     * @returns {Promise<string[]>} Array of tenant IDs
     */
    async listTenants() {
      const admin = await this.getAdminConnection();
      
      try {
        const result = await admin.$queryRaw`
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name NOT IN ('public', 'information_schema', 'pg_catalog', 'pg_toast')
          AND schema_name NOT LIKE 'pg_%'
        `;
        
        return result.map(row => row.schema_name);
      } catch (error) {
        throw new Error(`Failed to list tenants: ${error.message}`);
      }
    }
  
    /**
     * Checks if tenant schema exists
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<boolean>}
     */
    async tenantExists(tenantId) {
      const schemaName = this.sanitizeSchemaName(tenantId);
      const admin = await this.getAdminConnection();
      
      try {
        const result = await admin.$queryRaw`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.schemata 
            WHERE schema_name = ${schemaName}
          ) as exists
        `;
        
        return result[0].exists;
      } catch (error) {
        throw new Error(`Failed to check tenant existence: ${error.message}`);
      }
    }
  
    /**
     * Copies schema structure from template
     * @private
     * @param {string} fromSchema - Source schema
     * @param {string} toSchema - Target schema
     * @returns {Promise<void>}
     */
    async copySchemaStructure(fromSchema, toSchema) {
      const admin = await this.getAdminConnection();
      
      // This is a simplified version
      // In practice, you'd need more sophisticated schema copying logic
      try {
        const tables = await admin.$queryRaw`
          SELECT tablename FROM pg_tables 
          WHERE schemaname = ${fromSchema}
        `;
        
        for (const table of tables) {
          await admin.$executeRawUnsafe(`
            CREATE TABLE "${toSchema}"."${table.tablename}" 
            (LIKE "${fromSchema}"."${table.tablename}" INCLUDING ALL)
          `);
        }
      } catch (error) {
        throw new Error(`Failed to copy schema structure: ${error.message}`);
      }
    }
  
    /**
     * Sanitizes schema name to prevent SQL injection
     * @private
     * @param {string} tenantId - Tenant identifier
     * @returns {string} Sanitized schema name
     */
    sanitizeSchemaName(tenantId) {
      // Remove any characters that aren't alphanumeric, underscore, or hyphen
      return tenantId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    }
  
    /**
     * Disconnects all connections
     * @returns {Promise<void>}
     */
    async disconnect() {
      if (this.adminClient) {
        await this.adminClient.$disconnect();
        this.adminClient = null;
      }
    }
  }