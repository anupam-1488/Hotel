/**
 * @voilajs/appkit - Row-level multi-tenancy strategy
 * @module @voilajs/appkit/tenantdb/strategies/row
 */

/**
 * Row-level multi-tenancy strategy
 * All tenants share the same database and tables, with tenant isolation via a tenantId column
 */
export class RowStrategy {
    constructor(options) {
      this.options = options;
      this.prismaClient = null;
    }
  
    /**
     * Gets database connection for tenant
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<Object>} Prisma client with tenant middleware
     */
    async getConnection(tenantId) {
      const { PrismaClient } = this.options.prismaClient || await import('@prisma/client');
      
      const prisma = new PrismaClient({
        datasourceUrl: this.options.url,
        log: this.options.log || ['error']
      });
  
      // Add middleware to inject tenantId
      prisma.$use(async (params, next) => {
        // Inject tenantId on create
        if (params.action === 'create' || params.action === 'createMany') {
          if (params.action === 'create') {
            params.args.data = {
              ...params.args.data,
              tenantId
            };
          } else {
            params.args.data = params.args.data.map(item => ({
              ...item,
              tenantId
            }));
          }
        }
  
        // Add tenantId filter on queries
        if (['findFirst', 'findMany', 'findUnique', 'update', 'updateMany', 'delete', 'deleteMany', 'count'].includes(params.action)) {
          if (!params.args) params.args = {};
          if (!params.args.where) params.args.where = {};
          
          // Handle different where clause formats
          if (params.args.where.AND) {
            params.args.where.AND.push({ tenantId });
          } else {
            params.args.where = {
              ...params.args.where,
              tenantId
            };
          }
        }
  
        return next(params);
      });
  
      return prisma;
    }
  
    /**
     * Creates a new tenant (no-op for row-level strategy)
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async createTenant(tenantId) {
      // For row-level strategy, no special setup needed
      // Tenant is created implicitly when first record is inserted
      return Promise.resolve();
    }
  
    /**
     * Deletes a tenant's data
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async deleteTenant(tenantId) {
      const { PrismaClient } = this.options.prismaClient || await import('@prisma/client');
      const prisma = new PrismaClient({
        datasourceUrl: this.options.url
      });
  
      try {
        // Get all models
        const modelNames = Object.keys(prisma).filter(key => 
          !key.startsWith('$') && 
          !key.startsWith('_') && 
          typeof prisma[key].deleteMany === 'function'
        );
  
        // Delete all records for tenant
        for (const modelName of modelNames) {
          await prisma[modelName].deleteMany({
            where: { tenantId }
          });
        }
      } finally {
        await prisma.$disconnect();
      }
    }
  
    /**
     * Runs migrations (no-op for row-level strategy)
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<void>}
     */
    async migrateTenant(tenantId) {
      // For row-level strategy, migrations are run once for all tenants
      return Promise.resolve();
    }
  
    /**
     * Lists all tenants
     * @returns {Promise<string[]>} Array of tenant IDs
     */
    async listTenants() {
      const { PrismaClient } = this.options.prismaClient || await import('@prisma/client');
      const prisma = new PrismaClient({
        datasourceUrl: this.options.url
      });
  
      try {
        // Assumes a tenants table exists
        const tenants = await prisma.$queryRaw`
          SELECT DISTINCT "tenantId" FROM (
            SELECT "tenantId" FROM "User"
            UNION
            SELECT "tenantId" FROM "Post"
            -- Add other tables as needed
          ) AS all_tenants
          WHERE "tenantId" IS NOT NULL
        `;
        
        return tenants.map(t => t.tenantId);
      } catch (error) {
        // Fallback: query each table
        const modelNames = Object.keys(prisma).filter(key => 
          !key.startsWith('$') && 
          !key.startsWith('_') && 
          typeof prisma[key].findMany === 'function'
        );
  
        const tenantIds = new Set();
        
        for (const modelName of modelNames) {
          try {
            const records = await prisma[modelName].findMany({
              select: { tenantId: true },
              distinct: ['tenantId']
            });
            
            records.forEach(r => {
              if (r.tenantId) tenantIds.add(r.tenantId);
            });
          } catch (e) {
            // Model might not have tenantId field
          }
        }
        
        return Array.from(tenantIds);
      } finally {
        await prisma.$disconnect();
      }
    }
  
    /**
     * Checks if tenant exists
     * @param {string} tenantId - Tenant identifier
     * @returns {Promise<boolean>}
     */
    async tenantExists(tenantId) {
      const { PrismaClient } = this.options.prismaClient || await import('@prisma/client');
      const prisma = new PrismaClient({
        datasourceUrl: this.options.url
      });
  
      try {
        // Check if any record exists for this tenant
        const modelNames = Object.keys(prisma).filter(key => 
          !key.startsWith('$') && 
          !key.startsWith('_') && 
          typeof prisma[key].findFirst === 'function'
        );
  
        for (const modelName of modelNames) {
          try {
            const record = await prisma[modelName].findFirst({
              where: { tenantId }
            });
            
            if (record) return true;
          } catch (e) {
            // Model might not have tenantId field
          }
        }
        
        return false;
      } finally {
        await prisma.$disconnect();
      }
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