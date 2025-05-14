/**
 * @voilajs/appkit - Tenant middleware
 * @module @voilajs/appkit/tenantdb/middleware
 */

/**
 * Creates tenant middleware for Express-like frameworks
 * @param {Object} db - Multi-tenant database instance
 * @param {Object} [options] - Middleware options
 * @param {Function} [options.getTenantId] - Function to extract tenant ID from request
 * @param {Function} [options.onError] - Error handler
 * @param {boolean} [options.required=true] - Whether tenant ID is required
 * @returns {Function} Middleware function
 */
export function createMiddleware(db, options = {}) {
    const {
      getTenantId = defaultGetTenantId,
      onError = defaultErrorHandler,
      required = true
    } = options;
  
    return async (req, res, next) => {
      try {
        const tenantId = getTenantId(req);
        
        if (!tenantId && required) {
          throw new Error('Tenant ID is required');
        }
  
        if (tenantId) {
          // Check if tenant exists
          const exists = await db.tenantExists(tenantId);
          if (!exists) {
            throw new Error(`Tenant '${tenantId}' not found`);
          }
  
          // Set tenant database connection
          req.db = await db.forTenant(tenantId);
          req.tenantId = tenantId;
        }
  
        next();
      } catch (error) {
        onError(error, req, res);
      }
    };
  }
  
  /**
   * Creates async local storage context for tenant isolation
   * @param {Object} db - Multi-tenant database instance
   * @returns {Object} Context manager
   */
  export function createTenantContext(db) {
    const { AsyncLocalStorage } = require('async_hooks');
    const storage = new AsyncLocalStorage();
  
    return {
      /**
       * Runs function with tenant context
       * @param {string} tenantId - Tenant identifier
       * @param {Function} fn - Function to run
       * @returns {Promise<any>}
       */
      async run(tenantId, fn) {
        const connection = await db.forTenant(tenantId);
        return storage.run({ tenantId, db: connection }, fn);
      },
  
      /**
       * Gets current tenant context
       * @returns {Object|undefined} Current context
       */
      get() {
        return storage.getStore();
      },
  
      /**
       * Gets current tenant ID
       * @returns {string|undefined} Current tenant ID
       */
      getTenantId() {
        return storage.getStore()?.tenantId;
      },
  
      /**
       * Gets current database connection
       * @returns {Object|undefined} Current database connection
       */
      getDb() {
        return storage.getStore()?.db;
      }
    };
  }
  
  /**
   * Default function to extract tenant ID from request
   * @private
   */
  function defaultGetTenantId(req) {
    // Check multiple sources in order of preference
    return (
      req.headers['x-tenant-id'] ||
      req.query.tenantId ||
      req.params.tenantId ||
      req.tenant?.id ||
      req.user?.tenantId ||
      req.body?.tenantId ||
      null
    );
  }
  
  /**
   * Default error handler
   * @private
   */
  function defaultErrorHandler(error, req, res) {
    console.error('Tenant middleware error:', error);
    
    const status = error.message.includes('not found') ? 404 : 400;
    
    res.status(status).json({
      error: 'Tenant error',
      message: error.message
    });
  }