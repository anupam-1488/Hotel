# @voilajs/appkit

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A minimal, framework-agnostic Node.js application toolkit providing essential
building blocks for modern applications.

## Introduction

@voilajs/appkit is designed to be the foundation of your Node.js applications,
offering a collection of well-crafted utilities that handle common tasks without
imposing a specific framework or architecture. Each module is independent,
allowing you to use only what you need while maintaining a consistent API across
the entire toolkit.

### Key Principles

- **Minimal**: Only essential features, no bloat
- **Framework-agnostic**: Works with Express, Koa, Fastify, or vanilla Node.js
- **Modular**: Use only the modules you need
- **Type-safe**: Full TypeScript support (coming soon)
- **Well-tested**: Comprehensive test coverage
- **Production-ready**: Used in real-world applications

### Features at a Glance

- 🔐 **Authentication**: JWT tokens, password hashing, middleware
- 🗄️ **Database**: Multi-adapter support for Prisma, Mongoose
- 💾 **Cache**: Redis and in-memory caching strategies
- 📬 **Events**: Event bus with pub/sub pattern
- 🛡️ **Security**: CSRF protection, rate limiting, input sanitization
- 🚨 **Error Handling**: Consistent error formatting and handling
- 📝 **Logging**: Structured logging with multiple transports
- 📁 **Storage**: File storage with local and cloud providers
- ✉️ **Email**: Template-based email sending
- ⏰ **Queue**: Background job processing
- ⚙️ **Configuration**: Environment-based configuration
- ✅ **Validation**: Schema-based validation and sanitization
- 🛠️ **Utilities**: Common helper functions

## Installation

```bash
npm install @voilajs/appkit
```

## Modules

Each module has its own documentation with detailed examples and API references:

### Core Modules

- [Auth](/src/auth/README.md) - Authentication and authorization utilities
- [TenantDB](/src/tenantdb/README.md) - Complete multi-tenant database solution
- [Cache](/src/cache/README.md) - Caching strategies and implementations
- [Events](/src/events/README.md) - Event bus for pub/sub communication
- [Security](/src/security/README.md) - Security middleware and utilities
- [Error](/src/error/README.md) - Error handling and formatting
- [Logging](/src/logging/README.md) - Structured logging system

### Infrastructure Modules

- [Storage](/src/storage/README.md) - File storage abstraction
- [Email](/src/email/README.md) - Email sending with templates
- [Queue](/src/queue/README.md) - Job queue management
- [Config](/src/config/README.md) - Configuration management
- [Validation](/src/validation/README.md) - Data validation and sanitization
- [Utils](/src/utils/README.md) - Common utility functions

## Quick Start

```javascript
import { auth, database, cache, logging } from '@voilajs/appkit';

// Set up logging
const logger = logging.createLogger({ level: 'info' });

// Configure authentication
const token = auth.generateToken(
  { userId: '123' },
  { secret: process.env.JWT_SECRET }
);

// Connect to database
await database.initDatabase('prisma', {
  datasourceUrl: process.env.DATABASE_URL,
});

// Initialize cache
await cache.initCache('redis', {
  url: process.env.REDIS_URL,
});

logger.info('Application initialized');
```

## Getting Started

1. Install the package
2. Import only the modules you need
3. Configure each module with your settings
4. Use the utilities in your application

Each module is designed to work independently, so you can adopt them
incrementally in your existing projects.

## Documentation

For detailed documentation and examples, please refer to each module's README
file linked above. Each module documentation includes:

- API reference
- Usage examples
- Configuration options
- Best practices
- Common patterns

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md)
for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: kt@voilacode.com
- 🐛 Issues: [GitHub Issues](https://github.com/voilajs/appkit/issues)

---

<p align="center">
  Built with ❤️ in India by the <a href="https://github.com/orgs/voilajs/people">VoilaJS Team</a> — powering modern web development.
</p>
