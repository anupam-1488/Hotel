# @voilajs/appkit - Cache Module 🚀

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A unified caching interface with support for multiple backends to boost
> application performance

The Cache module of `@voilajs/appkit` provides a flexible, powerful caching
solution for Node.js applications with support for in-memory, Redis, and
Memcached backends. It offers a consistent API to store, retrieve, and manage
cached data with automatic serialization and TTL management.

## Module Overview

The Cache module provides everything you need for effective application caching:

| Feature              | What it does                              | Main functions                                   |
| -------------------- | ----------------------------------------- | ------------------------------------------------ |
| **Cache Creation**   | Initialize caches with different backends | `createCache()`                                  |
| **Basic Operations** | Store and retrieve cached values          | `get()`, `set()`, `has()`, `delete()`, `clear()` |
| **Batch Operations** | Efficiently manage multiple cache entries | `getMany()`, `setMany()`, `deleteMany()`         |
| **Smart Patterns**   | Implement common caching patterns         | `getOrSet()`, `namespace()`, `deletePattern()`   |
| **TTL Management**   | Control cache expiration                  | `expire()`, `ttl()`                              |

## 🚀 Features

- **💾 Multiple Backend Support** - In-memory, Redis, and Memcached
  implementations
- **⏱️ TTL Management** - Automatic expiration of cached items
- **🗂️ Namespaces** - Organize cache keys with logical grouping
- **🔄 Batch Operations** - Efficient bulk access and manipulation
- **🧠 Smart Patterns** - Built-in cache-aside pattern with `getOrSet`
- **🔍 Pattern Matching** - Find and delete keys using glob patterns
- **🧩 Consistent API** - Same interface across all backends
- **🔌 Framework Agnostic** - Works with any Node.js application

## 📦 Installation

```bash
npm install @voilajs/appkit

# Optional: Install backend-specific dependencies
npm install redis       # For Redis support
npm install memcached   # For Memcached support
```

## 🏃‍♂️ Quick Start

Import only the functions you need and start using them right away. The Cache
module provides a consistent API across all cache implementations.

```javascript
import { createCache } from '@voilajs/appkit/cache';

// Create a cache instance
const cache = await createCache({
  strategy: 'memory', // or 'redis', 'memcached'
  // strategy-specific options
});

// Store a value (with optional TTL)
await cache.set('user:123', { name: 'Alice', role: 'admin' }, 3600); // 1 hour TTL

// Retrieve a value
const user = await cache.get('user:123');
console.log(user.name); // 'Alice'

// Use cache-aside pattern
const product = await cache.getOrSet(
  'product:3',
  async () => {
    // This only runs on cache miss
    return { name: 'Tablet', price: 499 };
  },
  1800 // 30 minutes TTL
);
```

## 📖 Core Functions

### Cache Creation

These utilities let you create and configure cache instances with different
backends. Choose the backend that best fits your application's requirements for
persistence, performance, and scale.

| Function            | Purpose                                   | When to use                                       |
| ------------------- | ----------------------------------------- | ------------------------------------------------- |
| `createCache()`     | Creates a new cache instance with options | Application startup, configuring caching strategy |
| `cache.namespace()` | Creates a namespaced cache instance       | Organizing caches for different data types        |

```javascript
// Create cache with memory backend (perfect for development or testing)
const memoryCache = await createCache({
  strategy: 'memory',
  maxItems: 1000,
});

// Create cache with Redis backend (ideal for production)
const redisCache = await createCache({
  strategy: 'redis',
  url: 'redis://localhost:6379',
});

// Create a namespaced cache
const userCache = cache.namespace('user');
await userCache.set('123', userData); // Stored as 'user:123'
```

### Basic Operations

These methods provide the fundamental operations for any caching system, letting
you store, retrieve, check, and invalidate cached data.

| Function         | Purpose                                 | When to use                                   |
| ---------------- | --------------------------------------- | --------------------------------------------- |
| `cache.get()`    | Retrieves a value from cache            | Fetching cached user data, API responses      |
| `cache.set()`    | Stores a value in cache with expiration | Caching database query results, API responses |
| `cache.has()`    | Checks if a key exists in cache         | Verifying cache state before operations       |
| `cache.delete()` | Removes a key from cache                | Invalidating data after updates               |
| `cache.clear()`  | Removes all keys from cache             | Clearing cache during deployments             |

```javascript
// Check if key exists
const exists = await cache.has('user:123');

// Get a value with default fallback
const user = await cache.get('user:123', { guest: true });

// Set a value with 1 hour TTL
await cache.set('user:123', userData, 3600);

// Delete a key
await cache.delete('user:123');

// Clear entire cache or namespace
await cache.clear();
```

### Batch Operations

These methods provide efficient operations on multiple cache entries at once,
reducing network round-trips and improving performance.

| Function             | Purpose                           | When to use                              |
| -------------------- | --------------------------------- | ---------------------------------------- |
| `cache.getMany()`    | Retrieves multiple values at once | Loading related data in a single request |
| `cache.setMany()`    | Stores multiple values at once    | Caching collections of items             |
| `cache.deleteMany()` | Removes multiple keys at once     | Batch invalidation after updates         |

```javascript
// Retrieve multiple values
const results = await cache.getMany(['user:123', 'user:456']);

// Store multiple values
await cache.setMany(
  {
    'product:1': { name: 'Laptop', price: 999 },
    'product:2': { name: 'Phone', price: 699 },
  },
  3600
); // All with 1 hour TTL

// Delete multiple keys
await cache.deleteMany(['user:123', 'user:456']);
```

### Advanced Features

These methods implement sophisticated caching patterns and management features
to give you more control and efficiency.

| Function                | Purpose                                     | When to use                                  |
| ----------------------- | ------------------------------------------- | -------------------------------------------- |
| `cache.getOrSet()`      | Gets a value or calculates it if not cached | Implementing cache-aside pattern             |
| `cache.deletePattern()` | Deletes all keys matching a pattern         | Invalidating groups of related cache entries |
| `cache.keys()`          | Finds keys matching a pattern               | Discovering cache keys for debugging         |
| `cache.ttl()`           | Gets remaining time-to-live for a key       | Checking when cache entries will expire      |
| `cache.expire()`        | Updates expiration time for a key           | Extending TTL for active sessions            |

```javascript
// Cache-aside pattern
const userData = await cache.getOrSet(
  'user:123',
  async () => {
    return await database.findUser(123); // Only called on cache miss
  },
  3600 // 1 hour TTL
);

// Find keys matching a pattern
const userKeys = await cache.keys('user:*');

// Delete keys matching a pattern
await cache.deletePattern('user:123:*');

// Check remaining TTL
const remainingSeconds = await cache.ttl('session:abc');

// Extend expiration
await cache.expire('session:abc', 3600); // Reset to 1 hour
```

## 🔧 Configuration Options

The examples above show basic usage, but you have much more control over how the
caching system works. Here are the customization options available:

### Cache Creation Options

| Option       | Description                        | Default     | Example                              |
| ------------ | ---------------------------------- | ----------- | ------------------------------------ |
| `strategy`   | Cache backend to use               | `'memory'`  | `'memory'`, `'redis'`, `'memcached'` |
| `keyPrefix`  | Prefix for all cache keys          | `''`        | `'myapp:'`, `'v2:'`                  |
| `defaultTTL` | Default TTL in seconds             | `0` (never) | `3600` (1 hour), `86400` (1 day)     |
| `serializer` | Custom serialization functions     | `undefined` | Function to handle complex objects   |
| `logger`     | Logger to use for cache operations | `undefined` | Console or custom logger             |

#### Memory Strategy Options

| Option        | Description                 | Default     | Example                    |
| ------------- | --------------------------- | ----------- | -------------------------- |
| `maxItems`    | Maximum items to store      | `1000`      | `10000`, `100000`          |
| `maxSize`     | Maximum cache size in bytes | `undefined` | `104857600` (100MB)        |
| `cloneValues` | Whether to clone values     | `true`      | `false` to disable cloning |

#### Redis Strategy Options

| Option    | Description           | Default     | Example                        |
| --------- | --------------------- | ----------- | ------------------------------ |
| `url`     | Redis connection URL  | `undefined` | `'redis://localhost:6379'`     |
| `client`  | Existing Redis client | `undefined` | Redis client instance          |
| `options` | Redis client options  | `{}`        | Connection and cluster options |

#### Memcached Strategy Options

| Option    | Description                | Default               | Example                             |
| --------- | -------------------------- | --------------------- | ----------------------------------- |
| `servers` | Memcached server addresses | `['localhost:11211']` | `['cache1:11211', 'cache2:11211']`  |
| `options` | Memcached client options   | `{}`                  | Connection and distribution options |

```javascript
// Memory cache with options
const memoryCache = await createCache({
  strategy: 'memory',
  maxItems: 10000,
  defaultTTL: 3600,
  keyPrefix: 'myapp:',
});

// Redis cache with options
const redisCache = await createCache({
  strategy: 'redis',
  url: 'redis://username:password@redis.example.com:6379',
  defaultTTL: 3600,
  keyPrefix: 'myapp:',
  options: {
    connectTimeout: 10000,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  },
});
```

## 💡 Common Use Cases

Here's where you can apply the cache module's functionality in your
applications:

| Category              | Use Case               | Description                                | Components Used                           |
| --------------------- | ---------------------- | ------------------------------------------ | ----------------------------------------- |
| **Database Layer**    | Query Results          | Cache expensive database query results     | `getOrSet()`, TTL management              |
|                       | Object Hydration       | Cache fully hydrated objects from database | `set()`, `get()`, namespaces              |
|                       | Counters & Aggregates  | Store pre-calculated values for reporting  | `set()`, batch operations                 |
| **API Integrations**  | External API Responses | Cache responses from third-party APIs      | `getOrSet()` with appropriate TTL         |
|                       | Rate Limit Tracking    | Track API usage limits and quotas          | `set()` with TTL, `expire()`              |
|                       | API Gateway Caching    | Cache responses at the API gateway level   | Middleware with `get()`, `set()`          |
| **Web Applications**  | HTTP Response Caching  | Cache rendered pages or API responses      | `set()` with varying TTLs                 |
|                       | Session Storage        | Store user session data                    | Namespaces, `expire()` to extend TTL      |
|                       | View Fragment Caching  | Cache partial components of web pages      | Namespaced caches for different fragments |
| **Application Logic** | Computed Values        | Cache results of expensive calculations    | `getOrSet()` with appropriate TTL         |
|                       | Configuration          | Store application configuration            | `set()` with longer TTL                   |
|                       | Feature Flags          | Store and share feature flag settings      | `get()` with defaults, short TTL          |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common caching scenarios using the `@voilajs/appkit/cache` module. We've
created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality caching code.

### How to Use LLM Code Generation

Simply copy one of the prompts below and share it with ChatGPT, Claude, or
another capable LLM. The LLM will read the reference document and generate
optimized, best-practice caching code tailored to your specific requirements.

### Sample Prompts to Try

#### Basic Database Caching

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md and then create a caching layer for database queries using @voilajs/appkit/cache with the following features:
- Redis cache configuration for production
- Memory cache fallback for development
- Cache-aside pattern for common queries
- Automatic cache invalidation on data updates
- Type-safe functions for TypeScript projects
```

#### API Response Caching

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md and then implement an Express middleware for caching API responses using @voilajs/appkit/cache that includes:
- Configurable TTL based on route
- Cache bypass for authenticated requests
- Vary cache by query parameters
- Cache status in response headers
- Batch invalidation for related resources
```

#### Advanced Caching Patterns

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md and then implement advanced caching patterns using @voilajs/appkit/cache with:
- Write-through and write-behind caching
- Two-level caching (memory + Redis)
- Circuit breaker for cache backend failures
- Stampede protection for high-traffic keys
- Cache warming for predictable access patterns
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Cache Basics](https://github.com/voilajs/appkit/blob/main/src/cache/examples/01-cache-basics.js) -
  Basic cache operations and configuration
- [Redis Cache](https://github.com/voilajs/appkit/blob/main/src/cache/examples/02-redis-cache.js) -
  Working with Redis as a cache backend
- [Cache Patterns](https://github.com/voilajs/appkit/blob/main/src/cache/examples/03-cache-patterns.js) -
  Common caching patterns and techniques
- [API Caching](https://github.com/voilajs/appkit/blob/main/src/cache/examples/04-api-caching.js) -
  Caching API responses for improved performance
- [Rate Limiting](https://github.com/voilajs/appkit/blob/main/src/cache/examples/05-rate-limiting.js) -
  Using caching for API rate limiting

## 🛡️ Caching Best Practices

Following these practices will help ensure your caching system remains effective
and efficient:

1. **Choose the right TTL** - Set expiration times based on data volatility and
   freshness requirements
2. **Design good cache keys** - Use consistent, hierarchical naming patterns
   (e.g., `user:123:profile`)
3. **Implement proper invalidation** - Update or delete cached data when the
   source changes
4. **Handle cache misses gracefully** - Always have a fallback when data isn't
   in cache
5. **Monitor cache performance** - Track hit rates, miss rates, and memory usage
6. **Use namespaces** - Organize related cache keys to simplify management and
   invalidation
7. **Consider cache size limits** - Set appropriate limits to prevent memory
   issues

## 📊 Performance Considerations

- **Use batch operations** (`getMany`, `setMany`) to reduce network round-trips
- **Choose appropriate serialization** for complex objects or binary data
- **Implement two-level caching** for frequently accessed data (memory +
  distributed)
- **Be careful with large values** in distributed caches (Redis/Memcached)
- **Consider compression** for large textual or JSON data

## 🔍 Error Handling

The cache module is designed to be resilient, but you should still handle
potential errors:

```javascript
try {
  const result = await cache.get('important-data');
  // Use the cached data
} catch (error) {
  console.error('Cache operation failed:', error.message);

  // Fallback to original data source
  const result = await fetchDataFromOriginalSource();

  // Optionally try to restore cache
  try {
    await cache.set('important-data', result);
  } catch (cacheError) {
    // Log but don't fail if cache restoration fails
    console.warn('Failed to restore cache:', cacheError.message);
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer Reference](https://github.com/voilajs/appkit/blob/main/src/cache/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/cache/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajs/appkit/blob/main/src/cache/docs/PROMPT_REFERENCE.md) -
  Guide for AI/LLM code generation

## 🤝 Contributing

We welcome contributions! Please see our
[Contributing Guide](https://github.com/voilajs/appkit/blob/main/CONTRIBUTING.md)
for details.

## 📄 License

MIT © [VoilaJS](https://github.com/voilajs)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
