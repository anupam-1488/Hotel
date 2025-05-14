/**
 * @voilajs/appkit - Prisma adapter for multi-tenant database
 * @module @voilajs/appkit/tenantdb/adapters/prisma
 */

import { BaseAdapter } from './base.js';

/**
 * Prisma adapter implementation
 */
export class PrismaAdapter extends BaseAdapter {
  async connect(config) {
    const { PrismaClient } = await import('@prisma/client');
    this.client = new PrismaClient({
      datasourceUrl: config.url || this.options.url,
      log: this.options.log || ['error']
    });
    await this.client.$connect();
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.$disconnect();
      this.client = null;
    }
  }

  async createClient(config) {
    const { PrismaClient } = await import('@prisma/client');
    const client = new PrismaClient({
      datasourceUrl: config.url,
      log: this.options.log || ['error']
    });
    await client.$connect();
    return client;
  }

  async executeQuery(query, params = []) {
    if (!this.client) {
      throw new Error('Not connected to database');
    }
    return this.client.$executeRawUnsafe(query, ...params);
  }

  async createDatabase(name) {
    const sanitizedName = this.sanitizeName(name);
    const provider = this.detectProvider();

    switch (provider) {
      case 'postgresql':
        await this.executeQuery(`CREATE DATABASE "${sanitizedName}"`);
        break;
      case 'mysql':
        await this.executeQuery(`CREATE DATABASE \`${sanitizedName}\``);
        break;
      default:
        throw new Error(`Database creation not supported for provider: ${provider}`);
    }
  }

  async dropDatabase(name) {
    const sanitizedName = this.sanitizeName(name);
    const provider = this.detectProvider();

    switch (provider) {
      case 'postgresql':
        // Terminate existing connections
        await this.executeQuery(`
          SELECT pg_terminate_backend(pg_stat_activity.pid)
          FROM pg_stat_activity
          WHERE pg_stat_activity.datname = '${sanitizedName}'
            AND pid <> pg_backend_pid()
        `);
        await this.executeQuery(`DROP DATABASE IF EXISTS "${sanitizedName}"`);
        break;
      case 'mysql':
        await this.executeQuery(`DROP DATABASE IF EXISTS \`${sanitizedName}\``);
        break;
      default:
        throw new Error(`Database deletion not supported for provider: ${provider}`);
    }
  }

  async createSchema(name) {
    const sanitizedName = this.sanitizeName(name);
    const provider = this.detectProvider();

    if (provider !== 'postgresql') {
      throw new Error('Schema creation only supported for PostgreSQL');
    }

    await this.executeQuery(`CREATE SCHEMA IF NOT EXISTS "${sanitizedName}"`);
  }

  async dropSchema(name) {
    const sanitizedName = this.sanitizeName(name);
    const provider = this.detectProvider();

    if (provider !== 'postgresql') {
      throw new Error('Schema deletion only supported for PostgreSQL');
    }

    await this.executeQuery(`DROP SCHEMA IF EXISTS "${sanitizedName}" CASCADE`);
  }

  async listDatabases() {
    const provider = this.detectProvider();

    switch (provider) {
      case 'postgresql':
        const pgResult = await this.executeQuery(`
          SELECT datname FROM pg_database 
          WHERE datistemplate = false 
          AND datname NOT IN ('postgres', 'template0', 'template1')
        `);
        return pgResult.map(row => row.datname);
      
      case 'mysql':
        const mysqlResult = await this.executeQuery(`
          SELECT SCHEMA_NAME FROM information_schema.SCHEMATA
          WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
        `);
        return mysqlResult.map(row => row.SCHEMA_NAME);
      
      default:
        throw new Error(`Listing databases not supported for provider: ${provider}`);
    }
  }

  async listSchemas() {
    const provider = this.detectProvider();

    if (provider !== 'postgresql') {
      throw new Error('Schema listing only supported for PostgreSQL');
    }

    const result = await this.executeQuery(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('public', 'information_schema', 'pg_catalog', 'pg_toast')
      AND schema_name NOT LIKE 'pg_%'
    `);

    return result.map(row => row.schema_name);
  }

  applyTenantMiddleware(client, tenantId) {
    // Apply Prisma middleware for row-level isolation
    client.$use(async (params, next) => {
      // Inject tenantId on create
      if (params.action === 'create' || params.action === 'createMany') {
        if (params.action === 'create') {
          params.args.data = {
            ...params.args.data,
            tenantId
          };
        } else if (params.args.data) {
          params.args.data = params.args.data.map(item => ({
            ...item,
            tenantId
          }));
        }
      }

      // Add tenantId filter on queries
      if (['findFirst', 'findMany', 'findUnique', 'findUniqueOrThrow', 'findFirstOrThrow', 
           'update', 'updateMany', 'delete', 'deleteMany', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        
        // Handle complex where clauses
        if (params.args.where.AND) {
          params.args.where.AND.push({ tenantId });
        } else if (params.args.where.OR) {
          // Wrap OR conditions and add tenantId
          params.args.where = {
            AND: [
              { tenantId },
              { OR: params.args.where.OR }
            ]
          };
        } else {
          params.args.where = {
            ...params.args.where,
            tenantId
          };
        }
      }

      return next(params);
    });

    return client;
  }

  sanitizeName(name) {
    // Remove any characters that aren't alphanumeric, underscore, or hyphen
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }
}