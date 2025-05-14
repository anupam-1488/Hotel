/**
 * @voilajs/appkit - Knex adapter for multi-tenant database
 * @module @voilajs/appkit/tenantdb/adapters/knex
 */

import { BaseAdapter } from './base.js';

/**
 * Knex adapter implementation
 */
export class KnexAdapter extends BaseAdapter {
  async connect(config) {
    const knex = await import('knex');
    
    const knexConfig = {
      client: this.options.client || this.detectKnexClient(),
      connection: config.url || this.options.url,
      pool: {
        min: this.options.pooling?.min || 2,
        max: this.options.pooling?.max || 10
      },
      ...this.options.knexOptions
    };
    
    this.client = knex.default(knexConfig);
    
    // Test connection
    await this.client.raw('SELECT 1');
    
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
    }
  }

  async createClient(config) {
    const knex = await import('knex');
    
    const knexConfig = {
      client: this.options.client || this.detectKnexClient(),
      connection: config.url,
      pool: {
        min: 0,
        max: 1
      },
      ...this.options.knexOptions
    };
    
    return knex.default(knexConfig);
  }

  async executeQuery(query, params = []) {
    if (!this.client) {
      throw new Error('Not connected to database');
    }
    
    return this.client.raw(query, params);
  }

  async createDatabase(name) {
    const sanitizedName = this.sanitizeName(name);
    const provider = this.detectProvider();
    
    // Create a connection to system database
    const systemUrl = this.getSystemUrl();
    const systemClient = await this.createClient({ url: systemUrl });
    
    try {
      switch (provider) {
        case 'postgresql':
          await systemClient.raw(`CREATE DATABASE ?? `, [sanitizedName]);
          break;
        case 'mysql':
          await systemClient.raw(`CREATE DATABASE ?? `, [sanitizedName]);
          break;
        default:
          throw new Error(`Database creation not supported for provider: ${provider}`);
      }
    } finally {
      await systemClient.destroy();
    }
  }

  async dropDatabase(name) {
    const sanitizedName = this.sanitizeName(name);
    const provider = this.detectProvider();
    
    const systemUrl = this.getSystemUrl();
    const systemClient = await this.createClient({ url: systemUrl });
    
    try {
      switch (provider) {
        case 'postgresql':
          // Terminate connections
          await systemClient.raw(`
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = ?
              AND pid <> pg_backend_pid()
          `, [sanitizedName]);
          
          await systemClient.raw(`DROP DATABASE IF EXISTS ?? `, [sanitizedName]);
          break;
        case 'mysql':
          await systemClient.raw(`DROP DATABASE IF EXISTS ?? `, [sanitizedName]);
          break;
        default:
          throw new Error(`Database deletion not supported for provider: ${provider}`);
      }
    } finally {
      await systemClient.destroy();
    }
  }

  async createSchema(name) {
    const sanitizedName = this.sanitizeName(name);
    const provider = this.detectProvider();
    
    if (provider !== 'postgresql') {
      throw new Error('Schema creation only supported for PostgreSQL');
    }
    
    await this.executeQuery(`CREATE SCHEMA IF NOT EXISTS ?? `, [sanitizedName]);
  }

  async dropSchema(name) {
    const sanitizedName = this.sanitizeName(name);
    const provider = this.detectProvider();
    
    if (provider !== 'postgresql') {
      throw new Error('Schema deletion only supported for PostgreSQL');
    }
    
    await this.executeQuery(`DROP SCHEMA IF EXISTS ?? CASCADE`, [sanitizedName]);
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
        return pgResult.rows.map(row => row.datname);
      
      case 'mysql':
        const mysqlResult = await this.executeQuery(`
          SELECT SCHEMA_NAME FROM information_schema.SCHEMATA
          WHERE SCHEMA_NAME NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
        `);
        return mysqlResult.rows.map(row => row.SCHEMA_NAME);
      
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
    
    return result.rows.map(row => row.schema_name);
  }

  applyTenantMiddleware(client, tenantId) {
    // For Knex, we need to wrap query methods
    const originalQueryBuilder = client.queryBuilder.bind(client);
    
    client.queryBuilder = function() {
      const qb = originalQueryBuilder();
      
      // Override methods to add tenant filtering
      const originalWhere = qb.where.bind(qb);
      const originalInsert = qb.insert.bind(qb);
      
      qb.where = function(conditions, ...args) {
        if (typeof conditions === 'object' && !conditions.tenantId) {
          conditions.tenantId = tenantId;
        }
        return originalWhere(conditions, ...args);
      };
      
      qb.insert = function(data) {
        if (Array.isArray(data)) {
          data = data.map(item => ({ ...item, tenantId }));
        } else {
          data = { ...data, tenantId };
        }
        return originalInsert(data);
      };
      
      return qb;
    };
    
    // Wrap table method
    const originalTable = client.table?.bind(client) || client;
    
    const wrappedClient = function(tableName) {
      const query = originalTable(tableName);
      
      // Add tenant filtering to all operations
      const originalWhere = query.where.bind(query);
      const originalInsert = query.insert.bind(query);
      
      query.where = function(conditions, ...args) {
        if (typeof conditions === 'object' && !conditions.tenantId) {
          conditions.tenantId = tenantId;
        }
        return originalWhere(conditions, ...args);
      };
      
      query.insert = function(data) {
        if (Array.isArray(data)) {
          data = data.map(item => ({ ...item, tenantId }));
        } else {
          data = { ...data, tenantId };
        }
        return originalInsert(data);
      };
      
      return query;
    };
    
    // Copy all properties and methods
    Object.setPrototypeOf(wrappedClient, Object.getPrototypeOf(client));
    Object.assign(wrappedClient, client);
    
    return wrappedClient;
  }

  detectKnexClient() {
    const provider = this.detectProvider();
    
    switch (provider) {
      case 'postgresql':
        return 'pg';
      case 'mysql':
        return 'mysql2';
      case 'sqlite':
        return 'sqlite3';
      default:
        throw new Error(`Unknown database provider: ${provider}`);
    }
  }

  getSystemUrl() {
    const provider = this.detectProvider();
    const url = this.options.url;
    
    switch (provider) {
      case 'postgresql':
        // Connect to postgres database
        return url.replace(/\/[^/?]+(\?|$)/, '/postgres$1');
      case 'mysql':
        // Connect to mysql database
        return url.replace(/\/[^/?]+(\?|$)/, '/mysql$1');
      default:
        return url;
    }
  }

  sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }
}