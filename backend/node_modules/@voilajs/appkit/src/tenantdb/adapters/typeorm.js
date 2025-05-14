/**
 * @voilajs/appkit - TypeORM adapter for multi-tenant database
 * @module @voilajs/appkit/tenantdb/adapters/typeorm
 */

import { BaseAdapter } from './base.js';

/**
 * TypeORM adapter implementation
 */
export class TypeORMAdapter extends BaseAdapter {
  constructor(options) {
    super(options);
    this.dataSources = new Map();
  }

  async connect(config) {
    const { DataSource } = await import('typeorm');
    
    const dataSourceOptions = {
      type: this.detectTypeORMDriver(),
      url: config.url || this.options.url,
      synchronize: this.options.synchronize || false,
      logging: this.options.logging || false,
      entities: this.options.entities || [],
      migrations: this.options.migrations || [],
      subscribers: this.options.subscribers || [],
      ...this.options.typeormOptions
    };
    
    this.client = new DataSource(dataSourceOptions);
    await this.client.initialize();
    
    return this.client;
  }

  async disconnect() {
    if (this.client && this.client.isInitialized) {
      await this.client.destroy();
      this.client = null;
    }
    
    // Destroy all tenant data sources
    for (const [tenantId, dataSource] of this.dataSources.entries()) {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }
    this.dataSources.clear();
  }

  async createClient(config) {
    const { DataSource } = await import('typeorm');
    
    const dataSourceOptions = {
      type: this.detectTypeORMDriver(),
      url: config.url,
      synchronize: this.options.synchronize || false,
      logging: this.options.logging || false,
      entities: this.options.entities || [],
      migrations: this.options.migrations || [],
      subscribers: this.options.subscribers || [],
      ...this.options.typeormOptions
    };
    
    const dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();
    
    return dataSource;
  }

  async executeQuery(query, params = []) {
    if (!this.client || !this.client.isInitialized) {
      throw new Error('Not connected to database');
    }
    
    return this.client.query(query, params);
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
          WHERE pg_stat_activity.datname = $1
            AND pid <> pg_backend_pid()
        `, [sanitizedName]);
        
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

  applyTenantMiddleware(dataSource, tenantId) {
    const { DataSource } = dataSource.constructor;
    
    // Create entity subscribers for tenant isolation
    const TenantSubscriber = {
      async beforeInsert(event) {
        if (!event.entity.tenantId) {
          event.entity.tenantId = tenantId;
        }
      },
      
      async beforeUpdate(event) {
        if (event.entity && !event.entity.tenantId) {
          event.entity.tenantId = tenantId;
        }
      }
    };
    
    // Add subscriber
    dataSource.subscribers.push(TenantSubscriber);
    
    // Wrap repository methods
    const originalGetRepository = dataSource.getRepository.bind(dataSource);
    
    dataSource.getRepository = function(target) {
      const repository = originalGetRepository(target);
      
      // Wrap find methods to add tenant filter
      const originalFind = repository.find.bind(repository);
      const originalFindOne = repository.findOne.bind(repository);
      const originalFindOneBy = repository.findOneBy.bind(repository);
      const originalCount = repository.count.bind(repository);
      const originalFindAndCount = repository.findAndCount.bind(repository);
      
      repository.find = function(options = {}) {
        if (!options.where) options.where = {};
        
        if (Array.isArray(options.where)) {
          options.where = options.where.map(condition => ({
            ...condition,
            tenantId
          }));
        } else {
          options.where.tenantId = tenantId;
        }
        
        return originalFind(options);
      };
      
      repository.findOne = function(options = {}) {
        if (!options.where) options.where = {};
        
        if (Array.isArray(options.where)) {
          options.where = options.where.map(condition => ({
            ...condition,
            tenantId
          }));
        } else {
          options.where.tenantId = tenantId;
        }
        
        return originalFindOne(options);
      };
      
      repository.findOneBy = function(where) {
        return originalFindOneBy({ ...where, tenantId });
      };
      
      repository.count = function(options = {}) {
        if (!options.where) options.where = {};
        options.where.tenantId = tenantId;
        return originalCount(options);
      };
      
      repository.findAndCount = function(options = {}) {
        if (!options.where) options.where = {};
        options.where.tenantId = tenantId;
        return originalFindAndCount(options);
      };
      
      // Wrap save to ensure tenantId
      const originalSave = repository.save.bind(repository);
      repository.save = function(entities, options) {
        if (Array.isArray(entities)) {
          entities = entities.map(entity => ({ ...entity, tenantId }));
        } else {
          entities = { ...entities, tenantId };
        }
        return originalSave(entities, options);
      };
      
      // Wrap insert
      const originalInsert = repository.insert.bind(repository);
      repository.insert = function(entity) {
        if (Array.isArray(entity)) {
          entity = entity.map(e => ({ ...e, tenantId }));
        } else {
          entity = { ...entity, tenantId };
        }
        return originalInsert(entity);
      };
      
      // Wrap update
      const originalUpdate = repository.update.bind(repository);
      repository.update = function(criteria, partialEntity) {
        // Add tenantId to criteria
        if (typeof criteria === 'object') {
          criteria = { ...criteria, tenantId };
        }
        return originalUpdate(criteria, partialEntity);
      };
      
      // Wrap delete
      const originalDelete = repository.delete.bind(repository);
      repository.delete = function(criteria) {
        // Add tenantId to criteria
        if (typeof criteria === 'object') {
          criteria = { ...criteria, tenantId };
        }
        return originalDelete(criteria);
      };
      
      return repository;
    };
    
    // Wrap createQueryBuilder
    const originalCreateQueryBuilder = dataSource.createQueryBuilder.bind(dataSource);
    
    dataSource.createQueryBuilder = function(entityClass, alias) {
      const qb = originalCreateQueryBuilder(entityClass, alias);
      
      // Automatically add tenant filter
      const originalWhere = qb.where.bind(qb);
      const originalAndWhere = qb.andWhere.bind(qb);
      
      let tenantFilterAdded = false;
      
      const addTenantFilter = () => {
        if (!tenantFilterAdded) {
          qb.andWhere(`${alias}.tenantId = :tenantId`, { tenantId });
          tenantFilterAdded = true;
        }
      };
      
      qb.where = function(condition, parameters) {
        const result = originalWhere(condition, parameters);
        addTenantFilter();
        return result;
      };
      
      qb.andWhere = function(condition, parameters) {
        const result = originalAndWhere(condition, parameters);
        addTenantFilter();
        return result;
      };
      
      // Ensure tenant filter is added even if no where clause is used
      const originalGetMany = qb.getMany.bind(qb);
      const originalGetOne = qb.getOne.bind(qb);
      const originalGetCount = qb.getCount.bind(qb);
      
      qb.getMany = function() {
        addTenantFilter();
        return originalGetMany();
      };
      
      qb.getOne = function() {
        addTenantFilter();
        return originalGetOne();
      };
      
      qb.getCount = function() {
        addTenantFilter();
        return originalGetCount();
      };
      
      return qb;
    };
    
    return dataSource;
  }

  detectTypeORMDriver() {
    const provider = this.detectProvider();
    
    switch (provider) {
      case 'postgresql':
        return 'postgres';
      case 'mysql':
        return 'mysql';
      case 'mongodb':
        return 'mongodb';
      case 'sqlite':
        return 'sqlite';
      default:
        throw new Error(`Unknown database provider: ${provider}`);
    }
  }

  sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }
}