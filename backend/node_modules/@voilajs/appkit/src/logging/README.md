# @voilajs/appkit - Logging Module 📝

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Structured logging with file storage and retention for Node.js applications

The Logging module of `@voilajs/appkit` provides a simple yet powerful logging
system with automatic file rotation, retention policies, and support for
contextual logging through child loggers.

## Module Overview

The Logging module provides everything you need for robust application logging:

| Feature                | What it does                            | Main functions                                                       |
| ---------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| **Logger Creation**    | Initialize loggers with various options | `createLogger()`                                                     |
| **Log Levels**         | Log messages at appropriate severity    | `logger.info()`, `logger.error()`, `logger.warn()`, `logger.debug()` |
| **Contextual Logging** | Add context to all related log messages | `logger.child()`                                                     |
| **File Management**    | Store logs with rotation and retention  | File storage configuration options                                   |

## 🚀 Features

- **📊 Multiple Log Levels** - Error, warn, info, and debug levels
- **📁 Automatic File Storage** - Logs saved to files with daily rotation
- **🔄 Retention Management** - Automatic cleanup of old log files
- **🔗 Child Loggers** - Add context to logs for requests or operations
- **🎨 Pretty Console Output** - Colored and formatted console logs
- **📦 Zero Configuration** - Works out of the box with sensible defaults

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

Import only the functions you need and start using them right away. The logging
module provides a simple, fluent API for all your logging needs.

```javascript
import { createLogger } from '@voilajs/appkit/logging';

// Create a logger with default settings
const logger = createLogger();

// Log messages at different levels
logger.info('Application started');
logger.error('Database connection failed', { error: err.message });
logger.warn('API rate limit approaching', { current: 950, limit: 1000 });
logger.debug('Cache miss', { key: 'user:123' });

// Create child logger with context
const requestLogger = logger.child({ requestId: 'abc123' });
requestLogger.info('Processing request');
```

## 📖 Core Functions

### Logger Creation and Management

These utilities enable you to create and configure loggers for your application.
Loggers handle the details of log formatting, storage, and management so you can
focus on recording important events.

| Function         | Purpose                                    | When to use                                |
| ---------------- | ------------------------------------------ | ------------------------------------------ |
| `createLogger()` | Creates a new logger instance with options | Application startup, module initialization |
| `logger.child()` | Creates a child logger with added context  | Request handling, operation tracking       |

```javascript
// Create a logger with custom options
const logger = createLogger({
  level: 'info',
  dirname: 'logs',
  filename: 'app.log',
});

// Create a child logger with request context
const requestLogger = logger.child({
  requestId: 'req-123',
  userId: 'user-456',
});
```

### Logging Methods

These methods let you log messages at different severity levels, helping you
categorize information and filter logs based on importance.

| Function         | Purpose                              | When to use                                 |
| ---------------- | ------------------------------------ | ------------------------------------------- |
| `logger.error()` | Logs errors and critical issues      | Exceptions, fatal errors, security breaches |
| `logger.warn()`  | Logs warnings and potential problems | Deprecation notices, approaching limits     |
| `logger.info()`  | Logs normal operational information  | Startup events, normal operations           |
| `logger.debug()` | Logs detailed debugging information  | Development details, troubleshooting        |

```javascript
// Log at different levels
logger.error('Failed to connect to database', {
  error: err.message,
  connectionString: 'db://hostname:port/dbname',
});

logger.warn('API rate limit at 80%', {
  current: 800,
  limit: 1000,
});

logger.info('User login successful', {
  userId: 'user-123',
  loginTime: new Date(),
});

logger.debug('Cache operation details', {
  operation: 'set',
  key: 'user:123',
  ttl: 3600,
});
```

## 🔧 Configuration Options

The examples above show basic usage, but you have much more control over how the
logging system works. Here are the customization options available:

### Logger Creation Options

| Option              | Description                    | Default           | Example                                  |
| ------------------- | ------------------------------ | ----------------- | ---------------------------------------- |
| `level`             | Minimum log level to record    | `'info'`          | `'debug'`, `'info'`, `'warn'`, `'error'` |
| `dirname`           | Directory for log files        | `'logs'`          | `'app/logs'`, `'/var/log/myapp'`         |
| `filename`          | Base name for log files        | `'app.log'`       | `'server.log'`, `'api.log'`              |
| `retentionDays`     | Days to keep log files         | `7`               | `30`, `90`, `365`                        |
| `maxSize`           | Max file size before rotation  | `10485760` (10MB) | `52428800` (50MB)                        |
| `enableFileLogging` | Whether to write logs to files | `true`            | `false` (console only)                   |
| `customFormat`      | Custom formatter function      | `undefined`       | Function for custom formatting           |

```javascript
// Logger with custom configuration
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  dirname: 'logs',
  filename: 'application.log',
  retentionDays: 30,
  maxSize: 52428800, // 50MB
  enableFileLogging: true,
});
```

## 💡 Common Use Cases

Here's where you can apply the logging module's functionality in your
applications:

| Category            | Use Case               | Description                                       | Components Used                                           |
| ------------------- | ---------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| **HTTP Servers**    | Request Logging        | Log details of incoming HTTP requests             | `createLogger()`, `logger.child()`, `logger.info()`       |
|                     | Error Tracking         | Record API errors with context                    | `logger.error()` with metadata                            |
|                     | Performance Monitoring | Track slow requests and bottlenecks               | `logger.warn()` with timing data                          |
| **Databases**       | Query Logging          | Monitor database operations                       | `logger.debug()` with query details                       |
|                     | Connection Issues      | Track database connectivity problems              | `logger.error()` with connection info                     |
| **Background Jobs** | Job Execution          | Track background task execution                   | `logger.child()` with job context                         |
|                     | Scheduled Tasks        | Monitor cron jobs and scheduled operations        | `logger.info()` for job completion                        |
| **Security**        | Auth Events            | Track login attempts and authentication events    | `logger.info()` for success, `logger.warn()` for failures |
|                     | Security Alerts        | Log potential security incidents                  | `logger.error()` with security context                    |
| **DevOps**          | Application Startup    | Log startup configuration and environment details | `logger.info()` with startup details                      |
|                     | Health Checks          | Record results of regular health checks           | `logger.info()` or `logger.error()` based on status       |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common logging scenarios using the `@voilajs/appkit/logging` module. We've
created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality logging code.

### How to Use LLM Code Generation

Simply copy one of the prompts below and share it with ChatGPT, Claude, or
another capable LLM. The LLM will read the reference document and generate
optimized, best-practice logging code tailored to your specific requirements.

### Sample Prompts to Try

#### Basic Logging Setup

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md and then create a complete logging system for an Express app using @voilajs/appkit/logging with the following features:
- Structured logger initialization with custom retention policies
- Request logging middleware with request IDs
- Error handling middleware with detailed error logging
- Performance monitoring for slow requests
```

#### Microservice Logging

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md and then implement a logging system for a microservice architecture using @voilajs/appkit/logging that includes:
- Consistent request ID propagation across services
- Correlation IDs for tracing requests
- Service-specific context in all logs
- Centralized log configuration
```

#### Advanced Logging Patterns

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md and then implement advanced logging patterns using @voilajs/appkit/logging with:
- Hierarchical loggers for different application components
- Redaction of sensitive information
- Performance profiling with timing measurements
- Custom formatting for different environments (dev/staging/prod)
- Log aggregation preparation for ELK stack
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Basic Logging](https://github.com/voilajs/appkit/blob/main/src/logging/examples/01-basic-logging.js) -
  How to use different log levels and metadata
- [Child Loggers](https://github.com/voilajs/appkit/blob/main/src/logging/examples/02-child-logger.js) -
  Creating context-aware child loggers
- [File Configuration](https://github.com/voilajs/appkit/blob/main/src/logging/examples/03-file-config.js) -
  Customizing file storage options
- [Express Integration](https://github.com/voilajs/appkit/blob/main/src/logging/examples/04-express-basic.js) -
  Using loggers with Express.js

## 🛡️ Logging Best Practices

Following these practices will help ensure your logging system remains effective
and secure:

1. **Use appropriate log levels** - Only log what's needed at each level to
   avoid overwhelming logs
2. **Never log sensitive data** - Avoid passwords, API keys, or personal
   information in logs
3. **Add context to logs** - Include request IDs and relevant metadata for
   easier troubleshooting
4. **Implement retention policies** - Delete old logs to comply with data
   regulations
5. **Structure your logs** - Use metadata objects rather than string
   concatenation
6. **Use consistent formats** - Maintain a standard logging pattern across your
   application

## 📊 Performance Considerations

- **Set appropriate log levels** in production (typically 'info' or 'warn')
- **Configure reasonable file sizes** and rotation settings to avoid disk issues
- **Use child loggers** rather than creating new loggers to improve performance
- **Avoid excessive logging** in high-throughput code paths
- **Consider log batching** for very high-volume logs

## 🔍 Error Handling

The logging module is designed to help you track errors effectively:

```javascript
try {
  // Operation that might fail
  await database.connect();
} catch (error) {
  logger.error('Database connection failed', {
    error: error.message,
    stack: error.stack,
    connectionDetails: {
      host: database.host,
      port: database.port,
      database: database.name,
    },
  });

  // Handle the error appropriately
}
```

## 📚 Documentation Links

- 📘
  [Developer Reference](https://github.com/voilajs/appkit/blob/main/src/logging/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/logging/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajs/appkit/blob/main/src/logging/docs/PROMPT_REFERENCE.md) -
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
