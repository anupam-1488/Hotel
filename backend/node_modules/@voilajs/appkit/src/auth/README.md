# @voilajs/appkit - Auth Module 🔐

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Secure, simple, and flexible authentication utilities for Node.js applications

The Auth module of `@voilajs/appkit` provides robust authentication utilities
including JWT token management, password hashing with bcrypt, and customizable
middleware for protecting routes and enforcing role-based access control (RBAC).

## Module Overview

The Auth module provides everything you need for modern authentication:

| Feature               | What it does                         | Main functions                        |
| --------------------- | ------------------------------------ | ------------------------------------- |
| **JWT Management**    | Create and verify secure tokens      | `generateToken()`, `verifyToken()`    |
| **Password Security** | Hash and verify passwords safely     | `hashPassword()`, `comparePassword()` |
| **Route Protection**  | Secure API endpoints with middleware | `createAuthMiddleware()`              |
| **Role-Based Access** | Control access based on user roles   | `createAuthorizationMiddleware()`     |

## 🚀 Features

- **🔑 JWT Token Management** - Generate and verify JWT tokens with customizable
  expiration
- **🔒 Password Security** - Hash and compare passwords using bcrypt
- **🛡️ Route Protection** - Middleware for authenticating requests
- **👥 Role-Based Access** - Control access based on user roles
- **🎯 Framework Agnostic** - Works with Express, Fastify, Koa, and more
- **⚡ Simple API** - Get started with just a few lines of code

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

Import only the functions you need and start using them right away. Each
function is designed to work independently, so you can pick and choose what you
need for your application.

```javascript
import {
  generateToken,
  verifyToken,
  hashPassword,
  createAuthMiddleware,
} from '@voilajs/appkit/auth';

// Generate a JWT token
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key' }
);

// Protect your routes
const auth = createAuthMiddleware({ secret: 'your-secret-key' });
app.get('/dashboard', auth, (req, res) => {
  res.json({ userId: req.user.userId });
});
```

## 📖 Core Functions

### JWT Token Management

These utilities enable you to create secure, signed tokens for authenticating
requests and transmitting sensitive information. JWTs are perfect for stateless
authentication in APIs and microservices.

| Function          | Purpose                            | When to use                                   |
| ----------------- | ---------------------------------- | --------------------------------------------- |
| `generateToken()` | Creates a JWT token from a payload | After successful login, API token generation  |
| `verifyToken()`   | Verifies and decodes a JWT token   | Before allowing access to protected resources |

```javascript
// Generate a token
const token = generateToken(
  { userId: '123', email: 'user@example.com' },
  { secret: 'your-secret-key', expiresIn: '24h' }
);

// Verify a token
try {
  const payload = verifyToken(token, { secret: 'your-secret-key' });
  console.log(payload.userId); // '123'
} catch (error) {
  console.log('Invalid token');
}
```

### Password Security

These functions enable you to securely store user passwords in your database by
creating cryptographically strong hashes. Never store plaintext passwords - use
these utilities to significantly improve your application's security.

| Function            | Purpose                            | When to use                              |
| ------------------- | ---------------------------------- | ---------------------------------------- |
| `hashPassword()`    | Hashes a password using bcrypt     | During user registration, password reset |
| `comparePassword()` | Verifies a password against a hash | During user login, password verification |

```javascript
// Hash a password
const hash = await hashPassword('myPassword123');

// Verify a password
const isValid = await comparePassword('myPassword123', hash);
console.log(isValid); // true or false
```

### Middleware

Secure your routes with authentication middleware that verifies JWT tokens. For
more granular control, use role-based middleware to restrict access based on
user roles (admin, editor, etc.), ensuring users can only access what they're
authorized to.

| Function                          | Purpose                              | When to use                               |
| --------------------------------- | ------------------------------------ | ----------------------------------------- |
| `createAuthMiddleware()`          | Creates JWT verification middleware  | Protecting API routes, securing endpoints |
| `createAuthorizationMiddleware()` | Creates role-based access middleware | Admin panels, premium features            |

```javascript
// Authentication middleware
const auth = createAuthMiddleware({ secret: 'your-secret-key' });

// Authorization middleware
const adminOnly = createAuthorizationMiddleware(['admin']);

// Apply to routes
app.get('/profile', auth, (req, res) => {
  // Requires valid JWT token
});

app.get('/admin', auth, adminOnly, (req, res) => {
  // Requires valid JWT token with admin role
});
```

## 🔧 Configuration Options

The examples above show basic usage, but you have much more control over how
these utilities work. Here are the customization options available:

### Token Generation Options

| Option      | Description                   | Default    | Example                         |
| ----------- | ----------------------------- | ---------- | ------------------------------- |
| `secret`    | Secret key for signing tokens | _Required_ | `'your-secret-key'`             |
| `expiresIn` | Token expiration time         | `'7d'`     | `'1h'`, `'7d'`, `'30d'`         |
| `algorithm` | JWT signing algorithm         | `'HS256'`  | `'HS256'`, `'HS384'`, `'HS512'` |

```javascript
generateToken(payload, {
  secret: 'your-secret-key',
  expiresIn: '7d',
  algorithm: 'HS256',
});
```

### Auth Middleware Options

| Option     | Description                      | Default                        | Example                      |
| ---------- | -------------------------------- | ------------------------------ | ---------------------------- |
| `secret`   | Secret key for verifying tokens  | _Required_                     | `'your-secret-key'`          |
| `getToken` | Custom function to extract token | Checks headers, cookies, query | Function that returns token  |
| `onError`  | Custom error handling            | Returns 401 responses          | Function that handles errors |

```javascript
createAuthMiddleware({
  secret: 'your-secret-key',
  getToken: (req) => req.headers['x-api-key'],
  onError: (error, req, res) => {
    res.status(401).json({ error: error.message });
  },
});
```

## 💡 Common Use Cases

Here's where you can apply the auth module's functionality in your applications:

| Category            | Use Case            | Description                                           | Components Used                                             |
| ------------------- | ------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| **User Management** | User Registration   | Securely store user credentials during signup         | `hashPassword()`                                            |
|                     | User Login          | Authenticate users and generate tokens                | `comparePassword()`, `generateToken()`                      |
|                     | Password Reset      | Securely handle password reset flows                  | `hashPassword()`, `generateToken()`                         |
| **API Security**    | API Authentication  | Secure API endpoints with token verification          | `createAuthMiddleware()`                                    |
|                     | Microservices       | Secure service-to-service communication               | `generateToken()`, `verifyToken()`                          |
|                     | Mobile API Backends | Authenticate mobile app clients                       | `generateToken()`, `createAuthMiddleware()`                 |
| **Access Control**  | Admin Dashboards    | Restrict sensitive admin features to authorized users | `createAuthMiddleware()`, `createAuthorizationMiddleware()` |
|                     | Premium Features    | Limit access to paid features based on subscription   | `createAuthorizationMiddleware()`                           |
|                     | Multi-tenant Apps   | Ensure users can only access their own data           | `createAuthMiddleware()`, custom role checks                |
| **Special Cases**   | Single Sign-On      | Implement SSO with JWT as the token format            | `generateToken()`, `verifyToken()`                          |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common authentication scenarios using the `@voilajs/appkit/auth` module.
We've created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality authentication code.

### How to Use LLM Code Generation

Simply copy one of the prompts below and share it with ChatGPT, Claude, or
another capable LLM. The LLM will read the reference document and generate
secure, best-practice authentication code tailored to your specific
requirements.

### Sample Prompts to Try

#### Basic Auth Setup

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then create a complete authentication system for an Express app using @voilajs/appkit/auth with the following features:
- User registration with password hashing
- Login with JWT token generation
- Middleware for protected routes
- Role-based access control for admin routes
```

#### Custom Authentication Flow

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then implement a secure authentication flow for a React Native mobile app using @voilajs/appkit/auth that includes:
- Token storage in secure storage
- Token refresh mechanism
- Biometric authentication integration
- Protection against common mobile auth vulnerabilities
```

#### Complex Authorization

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md and then implement a complex authorization system using @voilajs/appkit/auth with:
- Hierarchical role structure (admin > manager > user)
- Resource-based permissions (users can only access their own data)
- Team-based access control
- Audit logging for all authentication and authorization events
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Password Basics](https://github.com/voilajs/appkit/blob/main/src/auth/examples/01-password-basics.js) -
  How to hash and verify passwords
- [JWT Basics](https://github.com/voilajs/appkit/blob/main/src/auth/examples/02-jwt-basics.js) -
  Working with JWT tokens
- [Simple Middleware](https://github.com/voilajs/appkit/blob/main/src/auth/examples/03-simple-middleware.js) -
  Protecting routes with middleware
- [Complete Demo App](https://github.com/voilajs/appkit/blob/main/src/auth/examples/auth-demo-app) -
  A fully functional authentication system

## 🛡️ Security Best Practices

Following these practices will help ensure your authentication system remains
secure:

1. **Environment Variables**: Store JWT secrets in environment variables, not in
   code
2. **HTTPS**: Always use HTTPS in production to protect tokens in transit
3. **Token Expiration**: Use short-lived tokens (hours/days, not months)
4. **Password Requirements**: Implement strong password policies
5. **Salt Rounds**: Use at least 10 bcrypt rounds (12 for high security)
6. **Error Messages**: Don't reveal sensitive information in error responses

## 📊 Performance Considerations

- **Bcrypt Rounds**: Balance security and performance with appropriate rounds
  (10-12)
- **Token Size**: Keep JWT payloads small to minimize token size
- **Caching**: Consider caching verified tokens to reduce verification overhead
- **Async/Await**: Use properly with password functions for better performance

## 🔍 Error Handling

The module provides specific error messages that you should handle
appropriately:

```javascript
try {
  const payload = verifyToken(token, { secret });
} catch (error) {
  if (error.message === 'Token has expired') {
    // Handle expired token
  } else if (error.message === 'Invalid token') {
    // Handle invalid token
  } else {
    // Handle other errors
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajs/appkit/blob/main/src/auth/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/auth/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajs/appkit/blob/main/src/auth/docs/PROMPT_REFERENCE.md) -
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
