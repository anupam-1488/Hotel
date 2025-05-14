# @voilajs/appkit - Error Module 🚨

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Comprehensive, consistent error handling for Node.js applications

The Error module of `@voilajs/appkit` provides standardized error types,
consistent error formatting, middleware for Express applications, and utilities
for handling async errors. It helps you build robust applications with clean,
predictable error handling.

## Module Overview

| Feature             | What it does                                 | Main functions                              |
| ------------------- | -------------------------------------------- | ------------------------------------------- |
| **Error Types**     | Define standardized error categories         | `ErrorTypes`, `AppError`                    |
| **Error Creation**  | Create typed errors with proper status codes | `createError()`, `validationError()`, etc.  |
| **Middleware**      | Handle errors in HTTP framework applications | `createErrorHandler()`, `notFoundHandler()` |
| **Async Handling**  | Manage errors in async functions             | `asyncHandler()`                            |
| **Global Handlers** | Catch uncaught errors application-wide       | `handleUnhandledRejections()`               |

## 🚀 Features

- **🚨 Standardized Error Types** - Consistent error categorization with
  appropriate HTTP status codes
- **🔧 Factory Functions** - Simple API for creating properly formatted errors
- **🛡️ Framework-Agnostic Middleware** - Clean integration with Express, Koa,
  Fastify, and other Node.js frameworks
- **⚡ Async Error Handling** - Simple way to handle async errors without
  try/catch blocks
- **📊 Structured Responses** - Consistent error response format for APIs
- **🔎 Validation Errors** - Field-specific validation messages for forms and
  APIs
- **🌐 Global Error Handling** - Catch unhandled rejections and exceptions

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

```javascript
import express from 'express';
import {
  createError,
  validationError,
  notFoundError,
  authenticationError,
  authorizationError,
  conflictError,
  badRequestError,
  rateLimitError,
  serviceUnavailableError,
  internalError,
  createErrorHandler,
  asyncHandler,
} from '@voilajs/appkit/error';

const app = express();
app.use(express.json());

// Create user with validation
app.post(
  '/users',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw validationError({
        email: !email ? 'Email is required' : null,
        password: !password ? 'Password is required' : null,
      });
    }

    const user = await createUser({ email, password });
    res.status(201).json(user);
  })
);

// Get user by ID
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);

    if (!user) {
      throw notFoundError('User', req.params.id);
    }

    res.json(user);
  })
);

// Add error handling middleware
app.use(createErrorHandler());
```

## 📖 Core Functions

### Error Types

These utilities help categorize and standardize errors in your application.

| Function     | Purpose                                 | When to use                            |
| ------------ | --------------------------------------- | -------------------------------------- |
| `ErrorTypes` | Enumerate standard error types          | Categorizing errors, HTTP status codes |
| `AppError`   | Base error class for application errors | Creating custom application errors     |

```javascript
import { ErrorTypes, AppError } from '@voilajs/appkit/error';

// Using ErrorTypes
const error = new AppError(
  ErrorTypes.NOT_FOUND,
  'User not found',
  { userId: '123' },
  404
);

console.log(error.type); // 'NOT_FOUND'
console.log(error.statusCode); // 404
```

### Error Factory Functions

Create specific error types with the right status codes and formats.

| Function                    | Purpose                                   | When to use                             |
| --------------------------- | ----------------------------------------- | --------------------------------------- |
| `createError()`             | Create generic typed error                | Custom error scenarios                  |
| `validationError()`         | Create validation error with field errors | Form validation, API request validation |
| `notFoundError()`           | Create not found error for resources      | When requested resource doesn't exist   |
| `authenticationError()`     | Create authentication error               | Login failures, invalid tokens          |
| `authorizationError()`      | Create permission error                   | Insufficient permissions                |
| `conflictError()`           | Create conflict error                     | Duplicate resources, version conflicts  |
| `badRequestError()`         | Create bad request error                  | Invalid parameters or requests          |
| `rateLimitError()`          | Create rate limit exceeded error          | Too many requests                       |
| `serviceUnavailableError()` | Create service unavailable error          | Service temporarily down                |
| `internalError()`           | Create internal server error              | Unexpected server errors                |

```javascript
import {
  validationError,
  notFoundError,
  authenticationError,
  conflictError,
  badRequestError,
  rateLimitError,
} from '@voilajs/appkit/error';

// Validation error
throw validationError({
  email: 'Invalid email format',
  password: 'Password too short',
});

// Resource not found
throw notFoundError('User', '123');

// Authentication failed
throw authenticationError('Invalid token');

// Conflict error
throw conflictError('Email already exists', { email: 'user@example.com' });

// Bad request error
throw badRequestError('Invalid query parameters');

// Rate limit error
throw rateLimitError('Too many requests', { retryAfter: 60 });
```

### Middleware Functions

Handle errors in any Node.js HTTP framework.

| Function               | Purpose                                 | When to use                        |
| ---------------------- | --------------------------------------- | ---------------------------------- |
| `createErrorHandler()` | Create HTTP framework error middleware  | Global error handling in HTTP apps |
| `notFoundHandler()`    | Create 404 handler for undefined routes | Catching undefined routes          |
| `asyncHandler()`       | Wrap async functions to catch errors    | Any async HTTP route handler       |

```javascript
import express from 'express';
import {
  createErrorHandler,
  notFoundHandler,
  asyncHandler,
} from '@voilajs/appkit/error';

const app = express();

// Async route handler
app.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await getUsers();
    res.json(users);
  })
);

// Add 404 handler (after all routes)
app.use(notFoundHandler());

// Add error handler (must be last)
app.use(createErrorHandler());
```

// With Koa:

```javascript
import Koa from 'koa';
import Router from '@koa/router';
import { createError, notFoundError } from '@voilajs/appkit/error';

const app = new Koa();
const router = new Router();

// Adapt the error handler for Koa
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const error = err.statusCode ? err : createError('INTERNAL', err.message);
    ctx.status = error.statusCode;
    ctx.body = { error: { message: error.message, type: error.type } };
  }
});

router.get('/users/:id', async (ctx) => {
  const user = await getUserById(ctx.params.id);
  if (!user) throw notFoundError('User', ctx.params.id);
  ctx.body = user;
});

app.use(router.routes());
```

### Global Error Handlers

Manage uncaught errors at the application level.

| Function                      | Purpose                             | When to use                          |
| ----------------------------- | ----------------------------------- | ------------------------------------ |
| `handleUnhandledRejections()` | Handle unhandled promise rejections | Preventing app crashes from promises |
| `handleUncaughtExceptions()`  | Handle uncaught exceptions          | Graceful handling of critical errors |

```javascript
import {
  handleUnhandledRejections,
  handleUncaughtExceptions,
} from '@voilajs/appkit/error';

// Set up global handlers
handleUncaughtExceptions();
handleUnhandledRejections();
```

## 🔧 Configuration Options

### Error Handler Options

```javascript
import { createErrorHandler } from '@voilajs/appkit/error';

const errorHandler = createErrorHandler({
  // Custom logger function
  logger: (error) => {
    console.error({
      type: error.type,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  },

  // Include stack trace in development
  includeStack: process.env.NODE_ENV !== 'production',
});
```

### AppError Options

```javascript
import { AppError, ErrorTypes } from '@voilajs/appkit/error';

const error = new AppError(
  ErrorTypes.CONFLICT, // Error type
  'Email already registered', // Error message
  { email: 'user@example.com' }, // Error details (optional)
  409 // Status code (optional)
);
```

## 💡 Common Use Cases

| Category             | Use Case                  | Description                                         | Components Used                       |
| -------------------- | ------------------------- | --------------------------------------------------- | ------------------------------------- |
| **API Development**  | Input Validation          | Validate API request data                           | `validationError()`, `asyncHandler()` |
| **API Development**  | Resource Retrieval        | Handle missing resources                            | `notFoundError()`, `asyncHandler()`   |
| **API Development**  | Global Error Handling     | Consistent error responses                          | `createErrorHandler()`                |
| **Authentication**   | Auth Failure Handling     | Handle invalid credentials                          | `authenticationError()`               |
| **Authentication**   | Permission Control        | Handle insufficient permissions                     | `authorizationError()`                |
| **Data Validation**  | Form Validation           | Validate user input with field-specific errors      | `validationError()`                   |
| **Error Management** | Async Error Handling      | Catch errors in async functions                     | `asyncHandler()`                      |
| **Error Management** | Uncaught Error Prevention | Prevent app crashes from unhandled errors           | `handleUnhandledRejections()`         |
| **Error Management** | Graceful Failure          | Log errors and exit gracefully on critical failures | `handleUncaughtExceptions()`          |
| **User Experience**  | Structured Error Messages | Provide clear, actionable error messages            | `formatErrorResponse()`, `AppError`   |
| **Logging**          | Error Tracking            | Categorize and track errors by type                 | `ErrorTypes`, custom logger           |
| **Security**         | Context-Aware Errors      | Different errors for different environments         | Environment-specific error handling   |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common error handling scenarios using the `@voilajs/appkit/error` module.
We've created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality error handling code.

### Sample Prompts to Try

#### Basic Error Handling

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md and then create a complete error handling system for an Express app using @voilajs/appkit/error with the following features:
- Centralized error handling
- Async route protection
- Field validation for user registration
- Different error types for different scenarios
```

#### Custom Error System

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md and then implement a custom error handling system for a REST API using @voilajs/appkit/error that includes:
- Custom error types for your application domain
- Environment-specific error formatting
- Integration with a logging service
- Proper HTTP status codes
```

#### Error Handling for Auth System

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md and create comprehensive error handling for an authentication system using @voilajs/appkit/error with:
- Login failure handling
- Token validation errors
- Rate limiting errors
- Permission errors
- User-friendly error messages
```

## 📋 Examples

The module includes several examples to help you get started:

- [Basic Error Creation](https://github.com/voilajs/appkit/blob/main/src/error/examples/01-error-creation.js) -
  How to create and use different error types
- [Express Integration](https://github.com/voilajs/appkit/blob/main/src/error/examples/02-express-integration.js) -
  How to use the error middleware with Express
- [Async Error Handling](https://github.com/voilajs/appkit/blob/main/src/error/examples/03-async-errors.js) -
  How to handle errors in async functions
- [Complete API Example](https://github.com/voilajs/appkit/blob/main/src/error/examples/api-example) -
  A complete REST API with comprehensive error handling

## 🛡️ Security Best Practices

1. **Hide Internal Details**: Never expose implementation details in production
   error messages
2. **Sanitize Error Messages**: Ensure error messages don't contain sensitive
   information
3. **Environment-Specific Behavior**: Use different error handling for
   development vs. production
4. **No Stack Traces in Production**: Disable `includeStack` option in
   production environments
5. **Input Validation**: Always validate input before processing to prevent
   injection attacks
6. **Consistent Error Types**: Use standard error types for consistent security
   responses
7. **Authentication Error Consistency**: Use the same message for all
   authentication failures to prevent user enumeration

## 📊 Performance Considerations

- **Efficient Error Creation**: Create errors only when necessary to avoid
  performance impact
- **Async Logging**: Use asynchronous logging to prevent blocking the event loop
- **Validation First**: Validate input early to fail fast and save processing
  resources
- **Selective Stack Traces**: Only capture stack traces when needed
- **Error Reuse**: Consider caching common error responses for frequently
  occurring errors

## 🔍 Error Handling

The module provides a consistent error handling pattern:

```javascript
import {
  createErrorHandler,
  asyncHandler,
  notFoundError,
  validationError,
} from '@voilajs/appkit/error';

// With asyncHandler (recommended)
app.get(
  '/users/:id',
  asyncHandler(async (req, res) => {
    try {
      const user = await getUserById(req.params.id);
      if (!user) throw notFoundError('User', req.params.id);
      res.json(user);
    } catch (error) {
      // Specific error handling
      if (error.name === 'CastError') {
        throw badRequestError('Invalid user ID format');
      }
      // Re-throw other errors for global handler
      throw error;
    }
  })
);

// Global error handler
app.use(
  createErrorHandler({
    logger: customLogger,
    includeStack: process.env.NODE_ENV !== 'production',
  })
);
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajs/appkit/blob/main/src/error/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/error/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajs/appkit/blob/main/src/error/docs/PROMPT_REFERENCE.md) -
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
