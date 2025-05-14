# @voilajs/appkit - Config Module 🔧

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Robust, flexible configuration management for Node.js applications

The Config module of `@voilajs/appkit` provides powerful configuration
management utilities including loading from multiple sources, validation,
environment variable integration, and real-time configuration updates.

## Module Overview

The Config module provides everything you need for robust application
configuration:

| Feature               | What it does                            | Main functions                                            |
| --------------------- | --------------------------------------- | --------------------------------------------------------- |
| **Config Loading**    | Load configuration from various sources | `loadConfig()`, `reloadConfig()`                          |
| **Config Access**     | Retrieve configuration values           | `getConfig()`, `hasConfig()`, `getEnv()`                  |
| **Schema Validation** | Validate configuration structure        | `validateConfig()`, `defineSchema()`, `getConfigSchema()` |
| **Config Management** | Update and manage configuration         | `setConfig()`, `clearConfig()`                            |

## 🚀 Features

- **📁 Multiple Sources** - Load configuration from JSON, JavaScript, or .env
  files
- **✅ Schema Validation** - Validate your configuration against schemas
- **🔄 Environment Integration** - Automatically integrate with environment
  variables
- **🔍 Variable Interpolation** - Reference values within your configuration
- **👀 Auto-Reload** - Watch for file changes and reload configuration
- **🛡️ Type Safety** - Strong typing support with JSDoc annotations
- **🎯 Framework Agnostic** - Works with any Node.js application

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

Import only the functions you need and start using them right away. The Config
module provides simple functions for loading and accessing configuration from
various sources.

```javascript
import { loadConfig, getConfig } from '@voilajs/appkit/config';

// Load configuration
const config = await loadConfig('./config.json', {
  defaults: { server: { port: 3000 } },
  required: ['database.url'],
});

// Access configuration values
const port = getConfig('server.port'); // 3000
const dbUrl = getConfig('database.url');
console.log(`Server running on port ${port}`);
```

## 📖 Core Functions

### Configuration Loading

These utilities enable you to load configuration from various sources and
formats. You can combine configuration from files, objects, and environment
variables into a single, unified configuration store.

| Function         | Purpose                                      | When to use                                        |
| ---------------- | -------------------------------------------- | -------------------------------------------------- |
| `loadConfig()`   | Loads configuration from source with options | Application startup, initial configuration loading |
| `setConfig()`    | Sets configuration directly in memory        | Manual configuration updates, testing              |
| `reloadConfig()` | Reloads configuration from previous file     | Configuration refresh, handling file changes       |
| `clearConfig()`  | Clears all configuration                     | Testing, resetting application state               |

```javascript
// Load from JSON file
const config = await loadConfig('./config.json');

// Load with options
const config = await loadConfig('./config.json', {
  defaults: { server: { port: 3000 } },
  required: ['database.url'],
  schema: 'app',
  env: true,
});

// Set configuration programmatically
setConfig({ server: { port: 4000 } });

// Reload configuration from file
await reloadConfig();

// Clear all configuration
clearConfig();
```

### Configuration Access

These functions let you retrieve configuration values and check for their
existence. They provide a simple, dot-notation syntax for accessing nested
properties.

| Function      | Purpose                                 | When to use                                      |
| ------------- | --------------------------------------- | ------------------------------------------------ |
| `getConfig()` | Retrieves configuration value by path   | Reading configuration values throughout your app |
| `hasConfig()` | Checks if configuration path exists     | Feature flags, conditional functionality         |
| `getEnv()`    | Gets environment variable with fallback | Accessing environment-specific settings          |

```javascript
// Get a specific value
const port = getConfig('server.port');

// Get with default fallback
const timeout = getConfig('api.timeout', 5000);

// Get a nested section
const database = getConfig('database');

// Check if configuration exists
if (hasConfig('features.darkMode')) {
  enableDarkMode();
}

// Get environment variable
const nodeEnv = getEnv('NODE_ENV', 'development');
```

### Schema Validation

These utilities provide configuration validation against JSON Schema-like
definitions. They ensure your configuration meets the expected structure and
types before your application uses it.

| Function            | Purpose                                | When to use                            |
| ------------------- | -------------------------------------- | -------------------------------------- |
| `validateConfig()`  | Validates configuration against schema | Ensuring configuration correctness     |
| `defineSchema()`    | Defines a named schema for later use   | Creating reusable validation schemas   |
| `getConfigSchema()` | Retrieves a previously defined schema  | Reusing schemas across the application |

```javascript
// Define a schema
defineSchema('server', {
  type: 'object',
  required: ['port'],
  properties: {
    port: {
      type: 'number',
      minimum: 1024,
      maximum: 65535,
    },
    host: {
      type: 'string',
      default: 'localhost',
    },
  },
});

// Validate configuration
try {
  validateConfig(config, 'server');
  console.log('Configuration is valid');
} catch (error) {
  console.error('Validation failed:', error.details.errors);
}

// Get a defined schema
const serverSchema = getConfigSchema('server');
```

## 🔧 Configuration Options

The examples above show basic usage, but you have much more control over how the
configuration system works. Here are the customization options available:

### Loading Options

| Option        | Description                             | Default     | Example                            |
| ------------- | --------------------------------------- | ----------- | ---------------------------------- |
| `defaults`    | Default values to merge with config     | `{}`        | `{ server: { port: 3000 } }`       |
| `required`    | Required configuration paths            | `[]`        | `['database.url', 'api.key']`      |
| `validate`    | Whether to validate configuration       | `true`      | `false` to skip validation         |
| `schema`      | Schema to validate against              | `undefined` | `'app'` or schema object           |
| `env`         | Enable environment variable integration | `true`      | `false` to disable env integration |
| `watch`       | Watch for file changes                  | `false`     | `true` to enable auto-reloading    |
| `interpolate` | Enable variable interpolation           | `true`      | `false` to disable interpolation   |

```javascript
// Configuration with all options
const config = await loadConfig('./config.json', {
  // Provide default values
  defaults: {
    server: {
      port: 3000,
      host: 'localhost',
    },
    logging: {
      level: 'info',
    },
  },

  // Specify required fields
  required: ['database.url', 'api.key'],

  // Enable validation against schema
  validate: true,
  schema: 'app',

  // Enable environment variable integration
  env: true,

  // Enable file watching (for development)
  watch: process.env.NODE_ENV === 'development',

  // Enable variable interpolation
  interpolate: true,
});
```

## 💡 Common Use Cases

Here's where you can apply the config module's functionality in your
applications:

| Category                  | Use Case                       | Description                                   | Components Used                            |
| ------------------------- | ------------------------------ | --------------------------------------------- | ------------------------------------------ |
| **Application Setup**     | Environment Configuration      | Load different config per environment         | `loadConfig()`, environment integration    |
|                           | Feature Flags                  | Toggle features without code changes          | `getConfig()`, `hasConfig()`               |
|                           | App Initialization             | Bootstrap application with correct settings   | `loadConfig()` with validation             |
| **Runtime Management**    | Dynamic Configuration          | Update configuration during runtime           | `setConfig()`, `reloadConfig()`            |
|                           | Configuration Overrides        | Allow command-line or runtime overrides       | `setConfig()` with existing config         |
|                           | Auto-reload During Development | Refresh configuration during development      | `loadConfig()` with `watch: true`          |
| **Security & Validation** | Secret Management              | Securely access sensitive information         | `getEnv()` for environment variables       |
|                           | Schema Validation              | Ensure configuration meets requirements       | `defineSchema()`, `validateConfig()`       |
|                           | Type Safety                    | Prevent type errors in configuration          | Schema validation with type constraints    |
| **Integration**           | External Service Configuration | Configure connections to external services    | Nested configuration with validation       |
|                           | Database Settings              | Manage database connection parameters         | Configuration with environment integration |
|                           | Distributed Application Config | Share configuration across service boundaries | Standardized configuration format          |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common configuration scenarios using the `@voilajs/appkit/config` module.
We've created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality configuration code.

### How to Use LLM Code Generation

Simply copy one of the prompts below and share it with ChatGPT, Claude, or
another capable LLM. The LLM will read the reference document and generate
optimized, best-practice configuration code tailored to your specific
requirements.

### Sample Prompts to Try

#### Basic Configuration Setup

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md and then implement a configuration system for my Express app that includes:
- Loading from different files per environment (dev, staging, prod)
- Schema validation for required fields
- Environment variable integration
- Auto-reload during development
```

#### Advanced Configuration System

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md and then implement an advanced configuration system using @voilajs/appkit/config with:
- Configuration schema with nested validation
- Custom validation rules for specific fields
- Configuration inspector middleware for Express
- Centralized configuration management class
```

#### Multi-environment Configuration

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md and then implement a configuration system for a microservice architecture using @voilajs/appkit/config with:
- Base configuration shared across all services
- Service-specific configuration overrides
- Environment-specific settings (development, staging, production)
- Secrets management via environment variables
- Configuration validation for all services
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Basic Usage](https://github.com/voilajs/appkit/blob/main/src/config/examples/01-basic-usage.js) -
  Loading and accessing configuration
- [Environment Variables](https://github.com/voilajs/appkit/blob/main/src/config/examples/02-environment-variables.js) -
  Working with environment variables
- [Schema Validation](https://github.com/voilajs/appkit/blob/main/src/config/examples/03-schema-validation.js) -
  Validating configuration with schemas
- [Dynamic Config](https://github.com/voilajs/appkit/blob/main/src/config/examples/04-dynamic-config.js) -
  Updating configuration at runtime
- [Express App](https://github.com/voilajs/appkit/blob/main/src/config/examples/express-app.js) -
  Using configuration in an Express application

## 🛡️ Configuration Best Practices

Following these practices will help ensure your configuration system remains
secure and maintainable:

1. **Store secrets in environment variables**, not in configuration files
2. **Use validation schemas** to catch configuration errors early
3. **Implement environment-specific configs** for different stages
   (dev/staging/prod)
4. **Never commit sensitive configuration** to version control
5. **Use namespaced configuration** to organize settings logically
6. **Document your configuration schema** for team members and future reference
7. **Implement reasonable defaults** for optional configuration

## 📊 Performance Considerations

- **Cache frequently accessed values** rather than calling `getConfig()`
  repeatedly
- **Only enable file watching** in development environments
- **Use appropriate schema complexity** based on your validation needs
- **Consider configuration load time** in application startup
- **Be mindful of deep nesting** in your configuration structure

## 🔍 Error Handling

The config module provides specific error types and codes that you should handle
appropriately:

```javascript
try {
  await loadConfig('./config.json', {
    required: ['database.url', 'api.key'],
  });
} catch (error) {
  switch (error.code) {
    case 'FILE_NOT_FOUND':
      console.error('Configuration file not found. Please check the path.');
      break;
    case 'MISSING_REQUIRED_FIELDS':
      console.error('Missing required configuration:', error.details.missing);
      break;
    case 'VALIDATION_ERROR':
      console.error('Configuration validation failed:');
      error.details.errors.forEach((err) => {
        console.error(`- ${err.path}: ${err.message}`);
      });
      break;
    case 'JSON_PARSE_ERROR':
      console.error('Invalid JSON in configuration file');
      break;
    default:
      console.error('Configuration error:', error.message);
  }

  // Exit or use fallback configuration
  process.exit(1);
}
```

## 📚 Documentation Links

- 📘
  [Developer Reference](https://github.com/voilajs/appkit/blob/main/src/config/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/config/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation Reference](https://github.com/voilajs/appkit/blob/main/src/config/docs/PROMPT_REFERENCE.md) -
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
