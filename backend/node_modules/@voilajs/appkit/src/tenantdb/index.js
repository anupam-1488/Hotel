/**
 * @voilajs/appkit - Multi-tenant database module
 * @module @voilajs/appkit/tenantdb
 */

// Main database functions
export { createDb, createMultiTenantDb } from './database.js';

// Middleware functions
export { createMiddleware, createTenantContext } from './middleware.js';

// Strategy classes
export { RowStrategy } from './strategies/row.js';
export { SchemaStrategy } from './strategies/schema.js';
export { DatabaseStrategy } from './strategies/database.js';

// Adapter classes
export { BaseAdapter } from './adapters/base.js';
export { PrismaAdapter } from './adapters/prisma.js';
export { MongooseAdapter } from './adapters/mongoose.js';
export { KnexAdapter } from './adapters/knex.js';
export { TypeORMAdapter } from './adapters/typeorm.js';