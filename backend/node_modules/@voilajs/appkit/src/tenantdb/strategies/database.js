/**
 * @voilajs/appkit - Database-per-tenant strategy
 * @module @voilajs/appkit/tenantdb/strategies/database
 */

/**
 * Database-per-tenant strategy
 * Each tenant has their own separate database
 */
export class DatabaseStrategy {
    constructor(options) {
      this.options = options;
      this.baseUrl = this.parseBaseUrl(options.url);
    }
  
    /**
     * Parses base URL for database connections
     * @private
     * @param {string} url - Database URL with {tenant} placeholder
     * @returns {Object} Parsed URL components
     */
    parseBaseUrl(url) {
      // Handle URLs like: postgresql://user:pass@host:5432/{tenant}
      const match = url.match(/^(.+?)\/\{tenant\}(.*)$/);
      if (!match) {
        throw new Error('Database URL must contain {tenant} placeholder');
      }
  
      return {
        prefix: match[1],
        suffix: match[2] || ''
      };
    }
  
    /**
     * Gets database connection for tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<Object>} Prisma client for tenant database
     */
    async getConnection(tenantId) {
      const { PrismaClient } = this.options.prismaClient || await import('@prisma/client');
      
      // Build tenant-specific database URL
      const databaseUrl = this.buildDatabaseUrl(tenantId);
      
      const prisma = new PrismaClient({
        datasourceUrl: databaseUrl,
        log: this.options.log || ['error']
      });
  
      // Test connection
      try {
        await prisma.$connect();
      } catch (error) {
        throw new Error(`Failed to connect to tenant database: ${error.message}`);
      }
  
      return prisma;
    }
  
    /**
     * Creates a new tenant database
     * @param {string} tenantId - Tenant identifier
     * @param {Object} [options] - Creation options
     * @returns {Promise<void>}
     */
    async createTenant(tenantId, options = {}) {
      const dbName = this.sanitizeDatabaseName(tenantId);
      
      // Connect to system database to create new database
      const { PrismaClient } = this.options.prismaClient || await import('@prisma/client');
      const systemUrl = this.buildSystemUrl();
      
      const systemClient = new PrismaClient({
        datasourceUrl: systemUrl
      });
  
      try {
        // Create database
        const provider = this.detectProvider();
        
        switch (provider) {
          case 'postgresql':
            await systemClient.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);
            break;
            
          case 'mysql':
            await systemClient.$executeRawUnsafe(`CREATE DATABASE \`${dbName}\``);
            break;
            
          default:
            throw new Error(`Database creation not supported for provider: ${provider}`);
        }
  
        // Run migrations
        if (options.runMigrations !== false) {
          await this.migrateTenant(tenantId);
        }
      } finally {
        await systemClient.$disconnect();
      }
    }
  
    /**
     * Deletes a tenant database
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async deleteTenant(tenantId) {
      const dbName = this.sanitizeDatabaseName(tenantId);
      
      const { PrismaClient } = this.options.prismaClient || await import('@prisma/client');
      const systemUrl = this.buildSystemUrl();
      
      const systemClient = new PrismaClient({
        datasourceUrl: systemUrl
      });
  
      try {
        const provider = this.detectProvider();
        
        switch (provider) {
          case 'postgresql':
            // Terminate connections to the database
            await systemClient.$executeRawUnsafe(`
              SELECT pg_terminate_backend(pg_stat_activity.pid)
              FROM pg_stat_activity
              WHERE pg_stat_activity.datname = '${dbName}'
                AND pid <> pg_backend_pid()
            `);
            
            await systemClient.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
            break;
            
          case 'mysql':
            await systemClient.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${dbName}\``);
            break;
            
          default:
            throw new Error(`Database deletion not supported for provider: ${provider}`);
        }
      } finally {
        await systemClient.$disconnect();
      }
    }
  
    /**
     * Runs migrations for a tenant database
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async migrateTenant(tenantId) {
      // This would typically use Prisma Migrate or another migration tool
      // For now, this is a placeholder
      const client = await this.getConnection(tenantId);
      
      try {
        // Run your migration logic here
        console.log(`Running migrations for tenant: ${tenantId}`);
      } finally {
        await client.$disconnect();
      }
    }
  
    /**
     * Lists all tenant databases
     * @returns {Promise<string[]>} Array of tenant IDs
     */
    async listTenants() {
      const { PrismaClient } = this.options.prismaClient || await import('@prisma/client');
      const systemUrl = this.buildSystemUrl();
      
      const systemClient = new PrismaClient({
        datasourceUrl: systemUrl
      });
  
      try {
        const provider = this.detectProvider();
        let databases;
        
        switch (provider) {
          case 'postgresql':
            databases = await systemClient.$queryRaw`
              SELECT datname FROM pg_database 
              WHERE datistemplate = false 
              AND datname NOT IN ('postgres', 'template0', 'template1')
            `;
            return databases.map(db => db.datname);
            
          case 'mysql':
            databases = await systemClient.$queryRaw`
              SELECT SCHEMA_NAME FROM information_schema.SCHEMATA
              WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
            `;
            return databases.map(db => db.SCHEMA_NAME);
            
          default:
            throw new Error(`Listing databases not supported for provider: ${provider}`);
        }
      } finally {
        await systemClient.$disconnect();
      }
    }
  
    /**
     * Checks if tenant database exists
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<boolean>}
     */
    async tenantExists(tenantId) {
      const dbName = this.sanitizeDatabaseName(tenantId);
      const tenants = await this.listTenants();
      return tenants.includes(dbName);
    }
  
    /**
     * Builds database URL for tenant
     * @private
     * @param {string} tenantId - Tenant identifier
     * @returns {string} Database URL
     */
    buildDatabaseUrl(tenantId) {
      const dbName = this.sanitizeDatabaseName(tenantId);
      return `${this.baseUrl.prefix}/${dbName}${this.baseUrl.suffix}`;
    }
  
    /**
     * Builds system database URL
     * @private
     * @returns {string} System database URL
     */
    buildSystemUrl() {
      const provider = this.detectProvider();

      switch (provider) {
        case 'postgresql':
          return `${this.baseUrl.prefix}/postgres${this.baseUrl.suffix}`;
        case 'mysql':
          return `${this.baseUrl.prefix}/mysql${this.baseUrl.suffix}`;
        default:
          // Use the first part without database name
          return this.baseUrl.prefix;
      }
    }

    /**
     * Detects database provider from URL
     * @private
     * @returns {string} Provider name
     */
    detectProvider() {
        if (this.baseUrl.prefix.includes('postgresql://') || this.baseUrl.prefix.includes('postgres://')) {
        return 'postgresql';
        }
        if (this.baseUrl.prefix.includes('mysql://')) {
        return 'mysql';
        }
        throw new Error('Unsupported database provider');
    }

    /**
     * Sanitizes database name to prevent SQL injection
     * @private
     * @param {string} tenantId - Tenant identifier
     * @returns {string} Sanitized database name
     */
    sanitizeDatabaseName(tenantId) {
        // Remove any characters that aren't alphanumeric, underscore, or hyphen
        return tenantId.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    }
    
    /**
     * Disconnects all connections
     * @returns {Promise<void>}
     */
    async disconnect() {
        // No persistent connections in this strategy
        return Promise.resolve();
    }
 }