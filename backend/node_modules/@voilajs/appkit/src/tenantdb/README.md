# Tenant Database Module

The `tenantdb` module provides a complete multi-tenant database solution for Node.js applications. It supports multiple database systems and isolation strategies, making it easy to build secure, scalable SaaS applications.

## Table of Contents

- [What is Multi-Tenancy?](#what-is-multi-tenancy)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Choosing a Strategy](#choosing-a-strategy)
  - [Strategy Comparison](#strategy-comparison)
  - [Decision Guide](#decision-guide)
- [Database Adapters](#database-adapters)
- [Usage Examples](#usage-examples)
  - [Basic Setup](#basic-setup)
  - [Using Middleware](#using-middleware)
  - [Manual Tenant Handling](#manual-tenant-handling)
  - [Tenant Management](#tenant-management)
- [Advanced Usage](#advanced-usage)
  - [Connection Pooling](#connection-pooling)
  - [Async Context](#async-context)
  - [Custom Tenant Resolution](#custom-tenant-resolution)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

## What is Multi-Tenancy?

Multi-tenancy is an architecture where a single instance of an application serves multiple customers (tenants). Each tenant's data is isolated and invisible to other tenants.

### Why Multi-Tenancy?

**Traditional Approach (Single-Tenant)**:
- One database per customer
- One application instance per customer
- High infrastructure costs
- Complex deployment

**Multi-Tenant Approach**:
- Shared infrastructure
- Lower costs
- Easier maintenance
- Simplified deployment

### Real-World Examples

- **Slack**: Each workspace is a tenant
- **Shopify**: Each store is a tenant
- **GitHub**: Each organization is a tenant
- **Google Workspace**: Each company is a tenant

## Installation

```bash
npm install @voilajs/appkit

# Install your preferred database driver
npm install @prisma/client prisma  # For Prisma
npm install mongoose              # For MongoDB
npm install knex pg              # For Knex with PostgreSQL
npm install typeorm reflect-metadata  # For TypeORM
```

## Quick Start

```javascript
import { createDb, createMiddleware } from '@voilajs/appkit/tenantdb';
import express from 'express';

const app = express();

// Create multi-tenant database
const db = createDb({
  strategy: 'row',           // Tenant isolation strategy
  adapter: 'prisma',         // Database adapter
  url: process.env.DATABASE_URL
});

// Add middleware to handle tenant context
app.use(createMiddleware(db));

// All database operations are now tenant-aware
app.get('/users', async (req, res) => {
  // Automatically filtered by tenant
  const users = await req.db.user.findMany();
  res.json(users);
});

app.listen(3000);
```

## Choosing a Strategy

The module supports three tenant isolation strategies. Choosing the right one is crucial for your application's success.

### Strategy Comparison

| Feature | Row-Level | Schema-Per-Tenant | Database-Per-Tenant |
|---------|-----------|------------------|-------------------|
| **Setup Complexity** | Simple | Medium | Complex |
| **Isolation Level** | Low | Medium | High |
| **Number of Tenants** | Unlimited | 1000s | 100s |
| **Performance** | Good* | Better | Best |
| **Resource Usage** | Lowest | Medium | Highest |
| **Maintenance** | Easiest | Moderate | Complex |
| **Backup/Restore** | All together | Per schema | Per database |
| **Cross-tenant Queries** | Easy | Possible | Difficult |
| **Database Support** | All | PostgreSQL | All |

\* With proper indexing

### Decision Guide

#### Choose Row-Level When:
- Building a B2C application with many small tenants
- Need to query across tenants (analytics, reporting)
- Want simplest implementation
- Have limited DevOps resources
- Starting an MVP or proof-of-concept

```javascript
// Row-level strategy
const db = createDb({
  strategy: 'row',
  adapter: 'prisma',
  url: process.env.DATABASE_URL
});

// Prisma schema example
model User {
  id        String   @id
  tenantId  String   // Required for row-level
  email     String
  name      String
  
  @@index([tenantId])  // Important for performance
}
```

#### Choose Schema-Per-Tenant When:
- Building B2B SaaS with moderate tenant count
- Need better isolation than row-level
- Using PostgreSQL
- Want balance of isolation and resource usage
- Have some DevOps expertise

```javascript
// Schema strategy (PostgreSQL only)
const db = createDb({
  strategy: 'schema',
  adapter: 'prisma',
  url: process.env.DATABASE_URL
});

// Each tenant gets their own schema
// tenant_123.users
// tenant_456.users
```

#### Choose Database-Per-Tenant When:
- Need complete data isolation (compliance, security)
- Have fewer, larger enterprise customers
- Can afford higher infrastructure costs
- Need independent backup/restore
- Require different database configurations per tenant

```javascript
// Database strategy
const db = createDb({
  strategy: 'database',
  adapter: 'prisma',
  url: 'postgresql://localhost:5432/{tenant}'
});

// Each tenant gets their own database
// postgresql://localhost:5432/tenant_123
// postgresql://localhost:5432/tenant_456
```

### Real-World Strategy Examples

**Row-Level Examples**:
- **Notion**: Millions of users, shared infrastructure
- **Linear**: Workspaces with shared features
- **Todoist**: Personal and team task management

**Schema-Per-Tenant Examples**:
- **Jira**: Team isolation with shared infrastructure
- **Basecamp**: Project management with team separation
- **FreshBooks**: Accounting with business isolation

**Database-Per-Tenant Examples**:
- **Salesforce**: Enterprise CRM with complete isolation
- **SAP**: Enterprise resource planning
- **Banking Software**: Regulatory compliance requirements

## Database Adapters

The module supports multiple database libraries:

### Prisma Adapter
```javascript
const db = createDb({
  strategy: 'row',
  adapter: 'prisma',
  url: process.env.DATABASE_URL
});

// Works with existing Prisma schema
const users = await tenantDb.user.findMany();
```

### Mongoose Adapter (MongoDB)
```javascript
const db = createDb({
  strategy: 'database',  // Best for MongoDB
  adapter: 'mongoose',
  url: 'mongodb://localhost:27017/{tenant}'
});

// Works with Mongoose models
const User = mongoose.model('User', userSchema);
const users = await User.find();
```

### TypeORM Adapter
```javascript
const db = createDb({
  strategy: 'row',
  adapter: 'typeorm',
  url: process.env.DATABASE_URL,
  entities: [User, Post],
  synchronize: false
});

// Works with TypeORM repositories
const userRepo = tenantDb.getRepository(User);
const users = await userRepo.find();
```

### Knex Adapter
```javascript
const db = createDb({
  strategy: 'row',
  adapter: 'knex',
  url: process.env.DATABASE_URL,
  client: 'pg'
});

// Works with Knex query builder
const users = await tenantDb('users').select('*');
```

## Usage Examples

### Basic Setup

```javascript
import { createDb } from '@voilajs/appkit/tenantdb';

// 1. Create multi-tenant database instance
const db = createDb({
  strategy: 'row',
  adapter: 'prisma',
  url: process.env.DATABASE_URL,
  pooling: {
    max: 20,
    min: 5
  },
  cache: {
    enabled: true,
    ttl: 300000  // 5 minutes
  }
});

// 2. Get tenant-specific connection
const tenantDb = await db.forTenant('acme_corp');

// 3. Use like normal database
const users = await tenantDb.user.findMany();
```

### Using Middleware

The middleware automatically extracts tenant ID and provides tenant-scoped database access:

```javascript
import { createDb, createMiddleware } from '@voilajs/appkit/tenantdb';
import express from 'express';

const app = express();
const db = createDb({
  strategy: 'row',
  adapter: 'prisma',
  url: process.env.DATABASE_URL
});

// Add tenant middleware
app.use(createMiddleware(db, {
  // Custom tenant extraction (optional)
  getTenantId: (req) => {
    return req.headers['x-tenant-id'] || 
           req.subdomain ||
           req.user?.tenantId;
  },
  
  // Error handling (optional)
  onError: (error, req, res) => {
    res.status(400).json({ 
      error: 'Invalid tenant',
      message: error.message 
    });
  }
}));

// Routes automatically have tenant context
app.get('/api/products', async (req, res) => {
  const products = await req.db.product.findMany({
    where: { active: true }
  });
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = await req.db.product.create({
    data: req.body
    // tenantId is automatically added
  });
  res.json(product);
});
```

### Manual Tenant Handling

For cases where you need explicit control:

```javascript
// API with tenant in URL
app.get('/api/tenants/:tenantId/users', async (req, res) => {
  const { tenantId } = req.params;
  
  // Validate tenant access
  if (req.user.tenantId !== tenantId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Get tenant connection
  const tenantDb = await db.forTenant(tenantId);
  const users = await tenantDb.user.findMany();
  res.json(users);
});

// Background job processing
async function processTenantsJob() {
  const tenants = await db.listTenants();
  
  for (const tenantId of tenants) {
    const tenantDb = await db.forTenant(tenantId);
    
    // Process tenant data
    await processInvoices(tenantDb);
    await sendNotifications(tenantDb);
  }
}
```

### Tenant Management

Managing tenants throughout their lifecycle:

```javascript
// Create new tenant
app.post('/api/tenants', async (req, res) => {
  const { name, plan } = req.body;
  const tenantId = name.toLowerCase().replace(/\s/g, '_');
  
  try {
    // 1. Create tenant in database
    await db.createTenant(tenantId, {
      runMigrations: true
    });
    
    // 2. Set up initial data
    const tenantDb = await db.forTenant(tenantId);
    await tenantDb.settings.create({
      data: { name, plan, createdAt: new Date() }
    });
    
    res.json({ tenantId, message: 'Tenant created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List all tenants (admin only)
app.get('/api/tenants', async (req, res) => {
  const tenants = await db.listTenants();
  res.json({ tenants });
});

// Delete tenant
app.delete('/api/tenants/:tenantId', async (req, res) => {
  try {
    await db.deleteTenant(req.params.tenantId);
    res.json({ message: 'Tenant deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check tenant health
app.get('/api/tenants/:tenantId/health', async (req, res) => {
  try {
    const exists = await db.tenantExists(req.params.tenantId);
    if (!exists) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const tenantDb = await db.forTenant(req.params.tenantId);
    await tenantDb.$queryRaw`SELECT 1`;
    
    res.json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});
```

## Advanced Usage

### Connection Pooling

Optimize database connections for performance:

```javascript
const db = createDb({
  strategy: 'schema',
  adapter: 'prisma',
  url: process.env.DATABASE_URL,
  pooling: {
    max: 20,      // Maximum connections per tenant
    min: 5,       // Minimum connections per tenant
    idleTimeoutMillis: 30000  // Close idle connections after 30s
  },
  cache: {
    enabled: true,
    ttl: 600000   // Cache connections for 10 minutes
  }
});

// Monitor connection usage
const stats = db.getStats();
console.log(stats);
// {
//   cachedConnections: 5,
//   connectionCounts: { tenant1: 10, tenant2: 5 },
//   totalConnections: 15
// }
```

### Async Context

Use AsyncLocalStorage for tenant context without prop drilling:

```javascript
import { createDb, createTenantContext } from '@voilajs/appkit/tenantdb';

const db = createDb({ strategy: 'row', adapter: 'prisma' });
const context = createTenantContext(db);

// Wrap request handling
app.use((req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  context.run(tenantId, () => next());
});

// Access tenant context anywhere
async function businessLogic() {
  // No need to pass tenantDb around
  const db = context.getDb();
  const users = await db.user.findMany();
  
  const tenantId = context.getTenantId();
  console.log(`Processing tenant: ${tenantId}`);
}
```

### Custom Tenant Resolution

Implement complex tenant identification:

```javascript
const middleware = createMiddleware(db, {
  getTenantId: async (req) => {
    // 1. Check subdomain
    if (req.hostname !== 'localhost') {
      const subdomain = req.hostname.split('.')[0];
      if (subdomain !== 'www') return subdomain;
    }
    
    // 2. Check JWT token
    if (req.user?.tenantId) {
      return req.user.tenantId;
    }
    
    // 3. Check API key
    if (req.headers['x-api-key']) {
      const apiKey = await db.apiKey.findUnique({
        where: { key: req.headers['x-api-key'] }
      });
      return apiKey?.tenantId;
    }
    
    // 4. Check session
    if (req.session?.tenantId) {
      return req.session.tenantId;
    }
    
    throw new Error('Tenant identification failed');
  }
});
```

## API Reference

### createDb(config)

Creates a multi-tenant database instance.

**Parameters:**
- `config.strategy`: 'row' | 'schema' | 'database'
- `config.adapter`: 'prisma' | 'mongoose' | 'typeorm' | 'knex'
- `config.url`: Database connection URL
- `config.pooling`: Connection pool configuration
- `config.cache`: Connection cache configuration

**Returns:** Database instance with methods:
- `forTenant(tenantId)`: Get tenant-specific connection
- `createTenant(tenantId, options)`: Create new tenant
- `deleteTenant(tenantId)`: Delete tenant
- `tenantExists(tenantId)`: Check if tenant exists
- `listTenants()`: List all tenant IDs
- `getStats()`: Get connection statistics
- `disconnect()`: Close all connections

### createMiddleware(db, options)

Creates Express middleware for automatic tenant context.

**Parameters:**
- `db`: Database instance from createDb()
- `options.getTenantId`: Function to extract tenant ID from request
- `options.onError`: Error handler function
- `options.required`: Whether tenant ID is required (default: true)

## Best Practices

### 1. Always Index Tenant ID

```javascript
// Prisma schema
model User {
  id        String   @id
  tenantId  String
  email     String
  
  @@index([tenantId])        // Single column index
  @@index([tenantId, email])  // Composite index for common queries
}
```

### 2. Use Connection Pooling

```javascript
const db = createDb({
  pooling: {
    max: process.env.DB_POOL_MAX || 20,
    min: process.env.DB_POOL_MIN || 5
  }
});
```

### 3. Implement Health Checks

```javascript
app.get('/health', async (req, res) => {
  try {
    await db.healthCheck();
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: error.message });
  }
});
```

### 4. Validate Tenant Access

```javascript
app.use(async (req, res, next) => {
  if (req.tenantId && req.user) {
    if (req.user.tenantId !== req.tenantId) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  next();
});
```

### 5. Handle Tenant Not Found

```javascript
const middleware = createMiddleware(db, {
  onError: (error, req, res) => {
    if (error.message.includes('not found')) {
      res.status(404).json({ 
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});
```

## Common Patterns

### Multi-Tenant Authentication

```javascript
app.post('/auth/login', async (req, res) => {
  const { email, password, tenantId } = req.body;
  
  // Get tenant database
  const tenantDb = await db.forTenant(tenantId);
  
  // Find user in tenant
  const user = await tenantDb.user.findUnique({
    where: { email }
  });
  
  if (!user || !validatePassword(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate token with tenant context
  const token = generateToken({
    userId: user.id,
    tenantId: tenantId,
    email: user.email
  });
  
  res.json({ token });
});
```

### Tenant-Specific Configuration

```javascript
async function getTenantConfig(tenantId) {
  const tenantDb = await db.forTenant(tenantId);
  
  const config = await tenantDb.configuration.findFirst({
    where: { key: 'app_settings' }
  });
  
  return {
    theme: config?.theme || 'default',
    features: config?.features || [],
    limits: config?.limits || {}
  };
}
```

### Cross-Tenant Operations (Admin)

```javascript
app.get('/admin/stats', async (req, res) => {
  const tenants = await db.listTenants();
  const stats = {};
  
  for (const tenantId of tenants) {
    const tenantDb = await db.forTenant(tenantId);
    stats[tenantId] = {
      users: await tenantDb.user.count(),
      revenue: await tenantDb.order.aggregate({
        _sum: { total: true }
      })
    };
  }
  
  res.json(stats);
});
```

## Migration Guide

### From Single-Tenant to Multi-Tenant

1. **Add tenantId column** to all tables:
```sql
ALTER TABLE users ADD COLUMN tenant_id VARCHAR(50);
ALTER TABLE orders ADD COLUMN tenant_id VARCHAR(50);
-- Repeat for all tables
```

2. **Migrate existing data** to a default tenant:
```sql
UPDATE users SET tenant_id = 'default_tenant';
UPDATE orders SET tenant_id = 'default_tenant';
```

3. **Add indexes**:
```sql
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_orders_tenant ON orders(tenant_id);
```

4. **Update application code**:
```javascript
// Before
const users = await prisma.user.findMany();

// After
const db = createDb({ strategy: 'row' });
const tenantDb = await db.forTenant(tenantId);
const users = await tenantDb.user.findMany();
```

### Switching Strategies

```javascript
// From row-level to schema-per-tenant
async function migrateToSchemaStrategy() {
  const oldDb = createDb({ strategy: 'row' });
  const newDb = createDb({ strategy: 'schema' });
  
  const tenants = await oldDb.listTenants();
  
  for (const tenantId of tenants) {
    // Create schema
    await newDb.createTenant(tenantId);
    
    // Copy data
    const sourceDb = await oldDb.forTenant(tenantId);
    const targetDb = await newDb.forTenant(tenantId);
    
    // Copy each table
    const users = await sourceDb.user.findMany();
    await targetDb.user.createMany({ data: users });
  }
}
```

## Troubleshooting

### Common Issues

1. **"Tenant not found" errors**
```javascript
// Check if tenant exists before operations
if (!await db.tenantExists(tenantId)) {
  throw new Error(`Tenant ${tenantId} does not exist`);
}
```

2. **Connection pool exhausted**
```javascript
// Increase pool size
const db = createDb({
  pooling: { max: 50, min: 10 }
});

// Monitor connections
setInterval(() => {
  const stats = db.getStats();
  console.log('Active connections:', stats.totalConnections);
}, 60000);
```

3. **Performance issues**
```javascript
// Ensure indexes exist
await db.$executeRaw`
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_created 
  ON users(tenant_id, created_at);
`;

// Use connection caching
const db = createDb({
  cache: { enabled: true, ttl: 600000 }
});
```

4. **Memory leaks**
```javascript
// Always clean up
process.on('SIGTERM', async () => {
  await db.disconnect();
  process.exit(0);
});

// Clear cache periodically
setInterval(() => {
  db.clearCache();
}, 3600000); // Every hour
```

### Debug Mode

```javascript
const db = createDb({
  strategy: 'row',
  adapter: 'prisma',
  url: process.env.DATABASE_URL,
  logging: true,  // Enable query logging
  debug: true     // Enable debug information
});

// Log all operations
db.on('query', (query) => {
  console.log('Query:', query);
});
```

## Support

For issues and feature requests, visit our [GitHub repository](https://github.com/voilajs/appkit).