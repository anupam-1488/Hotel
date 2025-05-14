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
export function createMiddleware(db: any, options?: {
    getTenantId?: Function;
    onError?: Function;
    required?: boolean;
}): Function;
/**
 * Creates async local storage context for tenant isolation
 * @param {Object} db - Multi-tenant database instance
 * @returns {Object} Context manager
 */
export function createTenantContext(db: any): any;
