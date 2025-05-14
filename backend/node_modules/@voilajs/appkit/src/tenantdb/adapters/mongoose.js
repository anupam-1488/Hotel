/**
 * @voilajs/appkit - Mongoose adapter for multi-tenant database
 * @module @voilajs/appkit/tenantdb/adapters/mongoose
 */

import { BaseAdapter } from './base.js';

/**
 * Mongoose adapter implementation
 */
export class MongooseAdapter extends BaseAdapter {
  constructor(options) {
    super(options);
    this.connections = new Map();
  }

  async connect(config) {
    const mongoose = await import('mongoose');
    this.mongoose = mongoose.default || mongoose;
    
    const connection = await this.mongoose.createConnection(config.url || this.options.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...this.options.mongooseOptions
    });
    
    this.client = connection;
    return connection;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    
    // Close all tenant connections
    for (const [tenantId, connection] of this.connections.entries()) {
      await connection.close();
    }
    this.connections.clear();
  }

  async createClient(config) {
    const connection = await this.mongoose.createConnection(config.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...this.options.mongooseOptions
    });
    
    return connection;
  }

  async executeQuery(query, params = []) {
    if (!this.client) {
      throw new Error('Not connected to database');
    }
    
    // For MongoDB, we use the native MongoDB driver
    const db = this.client.db;
    return db.command(query);
  }

  async createDatabase(name) {
    // MongoDB creates databases automatically when data is inserted
    // We'll create a connection to verify it's possible
    const dbUrl = this.buildDatabaseUrl(name);
    const connection = await this.createClient({ url: dbUrl });
    
    // Create an init collection to ensure database exists
    await connection.db.createCollection('_init');
    await connection.close();
  }

  async dropDatabase(name) {
    const dbUrl = this.buildDatabaseUrl(name);
    const connection = await this.createClient({ url: dbUrl });
    
    try {
      await connection.db.dropDatabase();
    } finally {
      await connection.close();
    }
  }

  async createSchema(name) {
    // MongoDB doesn't have schemas in the same way
    // For schema-per-tenant, we use collections with prefixes
    throw new Error('Schema creation not supported for MongoDB. Use database-per-tenant or row-level strategy.');
  }

  async dropSchema(name) {
    throw new Error('Schema deletion not supported for MongoDB. Use database-per-tenant or row-level strategy.');
  }

  async listDatabases() {
    if (!this.client) {
      throw new Error('Not connected to database');
    }
    
    const admin = this.client.db.admin();
    const result = await admin.listDatabases();
    
    return result.databases
      .map(db => db.name)
      .filter(name => !['admin', 'config', 'local'].includes(name));
  }

  async listSchemas() {
    throw new Error('Schema listing not supported for MongoDB');
  }

  applyTenantMiddleware(connection, tenantId) {
    // For Mongoose, we need to add middleware to schemas
    // This needs to be done when models are created
    const originalModel = connection.model.bind(connection);
    
    connection.model = function(name, schema, collection) {
      if (schema) {
        // Add pre hooks for queries
        schema.pre(['find', 'findOne', 'findOneAndUpdate', 'count', 'distinct'], function() {
          if (!this.getQuery().tenantId) {
            this.where({ tenantId });
          }
        });
        
        // Add pre hook for save
        schema.pre('save', function() {
          if (!this.tenantId) {
            this.tenantId = tenantId;
          }
        });
        
        // Add pre hook for insertMany
        schema.pre('insertMany', function(next, docs) {
          if (Array.isArray(docs)) {
            docs.forEach(doc => {
              if (!doc.tenantId) {
                doc.tenantId = tenantId;
              }
            });
          }
          next();
        });
      }
      
      return originalModel(name, schema, collection);
    };
    
    return connection;
  }

  buildDatabaseUrl(dbName) {
    const url = this.options.url;
    const sanitizedName = this.sanitizeName(dbName);
    
    // Parse MongoDB URL and replace database name
    const urlParts = url.match(/^(mongodb(?:\+srv)?:\/\/[^/]+\/)([^/?]+)(.*)?$/);
    if (!urlParts) {
      throw new Error('Invalid MongoDB URL format');
    }
    
    return `${urlParts[1]}${sanitizedName}${urlParts[3] || ''}`;
  }

  sanitizeName(name) {
    // MongoDB database names have restrictions
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }
}