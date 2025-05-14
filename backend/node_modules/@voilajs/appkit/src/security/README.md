# @voilajs/appkit - Security Module 🔒

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Essential security utilities for Node.js applications - CSRF protection, rate
> limiting, and input sanitization

The Security module of `@voilajs/appkit` provides robust protection against
common web vulnerabilities including cross-site request forgery (CSRF), brute
force attacks, and cross-site scripting (XSS). Each utility is designed to be
simple to use while following security best practices.

## 🚀 Features

- **🛡️ CSRF Protection** - Generate and validate security tokens to prevent
  cross-site request forgery
- **⏱️ Rate Limiting** - Control request frequency to protect against brute
  force and DoS attacks
- **🧹 Input Sanitization** - Clean user input to prevent XSS and injection
  attacks
- **🔌 Framework Agnostic** - Works with Express, Fastify, Koa, and other
  Node.js frameworks
- **🎯 Minimal Dependencies** - Lightweight implementation with zero external
  dependencies
- **⚡ Simple API** - Easy to implement with sensible defaults for quick
  protection

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

```javascript
import {
  // CSRF Protection
  generateCsrfToken,
  validateCsrfToken,
  createCsrfMiddleware,

  // Rate Limiting
  createRateLimiter,

  // Input Sanitization
  sanitizeHtml,
  escapeString,
  sanitizeFilename,
} from '@voilajs/appkit/security';

// Create CSRF middleware for Express
const csrf = createCsrfMiddleware();
app.use(csrf);

// Add rate limiting to API endpoints
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
app.use('/api', apiLimiter);

// Sanitize user input
const safeHtml = sanitizeHtml(userInput, {
  allowedTags: ['p', 'b', 'i', 'a'],
});
```

## 📖 Core Functions

### CSRF Protection

These utilities help prevent cross-site request forgery attacks by ensuring that
form submissions and state-changing requests originate from your site.

| Function                 | Purpose                                        | When to use                                      |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------ |
| `generateCsrfToken()`    | Creates a token stored in the session          | When rendering forms or before sensitive actions |
| `validateCsrfToken()`    | Verifies a submitted token                     | When manually validating form submissions        |
| `createCsrfMiddleware()` | Creates Express middleware for CSRF protection | For automatic protection of routes               |

```javascript
// Generate a token for a form
const token = generateCsrfToken(req.session);

// Validate a token from a request
const isValid = validateCsrfToken(req.body._csrf, req.session);

// Apply middleware to all routes
app.use(createCsrfMiddleware());
```

### Rate Limiting

Rate limiting helps prevent abuse of your API endpoints by controlling how many
requests a client can make in a given time period.

| Function              | Purpose                                          | When to use                                          |
| --------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| `createRateLimiter()` | Creates middleware that limits request frequency | For API endpoints, login pages, and form submissions |

```javascript
// Create a rate limiter: 100 requests per 15 minutes
const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

// Apply to API routes
app.use('/api', limiter);

// Stricter limits for login attempts
const loginLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
});
app.use('/login', loginLimiter);
```

### Input Sanitization

These utilities clean user input to prevent XSS attacks and other injection
vulnerabilities.

| Function             | Purpose                                    | When to use                           |
| -------------------- | ------------------------------------------ | ------------------------------------- |
| `escapeString()`     | Escapes HTML special characters            | When displaying user input in HTML    |
| `sanitizeHtml()`     | Removes dangerous HTML elements            | When allowing limited HTML formatting |
| `sanitizeFilename()` | Cleans filenames to prevent path traversal | When handling user-uploaded files     |

```javascript
// Escape user input for safe display
const safeText = escapeString(userComment);

// Allow limited HTML tags
const safeHtml = sanitizeHtml(userBio, {
  allowedTags: ['p', 'b', 'i', 'a'],
});

// Clean a filename
const safeName = sanitizeFilename(uploadedFile.originalname);
```

## 🔧 Configuration Options

### CSRF Middleware Options

```javascript
const csrf = createCsrfMiddleware({
  // Name of field containing the token in form data (default: '_csrf')
  tokenField: 'csrf_token',

  // Name of HTTP header for CSRF token (default: 'x-csrf-token')
  headerField: 'x-csrf',
});
```

### Rate Limiter Options

```javascript
const limiter = createRateLimiter({
  // Required: Time window in milliseconds
  windowMs: 15 * 60 * 1000, // 15 minutes

  // Required: Maximum requests per window
  max: 100,

  // Optional: Custom error message
  message: 'Too many requests, please try again later',

  // Optional: Function to generate unique client identifier
  keyGenerator: (req) => req.ip || req.headers['x-api-key'],

  // Optional: Custom store for rate limit data
  store: new Map(), // Default is in-memory Map
});
```

### Sanitization Options

```javascript
// HTML Sanitization Options
const safeHtml = sanitizeHtml(userInput, {
  // Remove all HTML tags completely
  stripAllTags: false, // Default: false

  // Only allow specific HTML tags
  allowedTags: ['p', 'b', 'i', 'a', 'ul', 'li'],
});
```

## 💡 Common Use Cases

| Category            | Use Case        | Description                     | Components Used                             |
| ------------------- | --------------- | ------------------------------- | ------------------------------------------- |
| **Form Protection** | Contact Form    | Prevent forged form submissions | `generateCsrfToken`, `createCsrfMiddleware` |
| **Form Protection** | Admin Actions   | Protect sensitive operations    | `generateCsrfToken`, `validateCsrfToken`    |
| **API Security**    | Public API      | Prevent abuse and DoS           | `createRateLimiter`                         |
| **API Security**    | Authentication  | Block brute force attempts      | `createRateLimiter` with strict limits      |
| **Content Safety**  | User Comments   | Allow safe formatting           | `sanitizeHtml` with `allowedTags`           |
| **Content Safety**  | Profile Display | Prevent XSS in user profiles    | `escapeString`                              |
| **File Handling**   | User Uploads    | Prevent path traversal          | `sanitizeFilename`                          |
| **File Handling**   | Download Names  | Ensure safe filenames           | `sanitizeFilename`                          |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common security scenarios using the `@voilajs/appkit/security` module. We've
created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md)
document that's designed specifically for LLMs to understand the module's
capabilities and generate high-quality security code.

### Sample Prompts to Try

#### Basic Security Setup

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md and then create a basic Express application that implements CSRF protection and rate limiting for login attempts.
```

#### Content Sanitization System

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md and then implement a content sanitization system that allows safe HTML in comments but prevents XSS attacks.
```

#### Complete Security Integration

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md and then create a complete security setup for an Express application with CSRF protection, tiered rate limiting, and input sanitization.
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Basic CSRF Protection](https://github.com/voilajs/appkit/blob/main/src/security/examples/01-csrf-basic.js) -
  How to implement CSRF tokens in forms
- [Rate Limiting API](https://github.com/voilajs/appkit/blob/main/src/security/examples/02-rate-limiting.js) -
  Protecting API endpoints from abuse
- [Input Sanitization](https://github.com/voilajs/appkit/blob/main/src/security/examples/03-sanitization.js) -
  Safely handling user input
- [Complete Security Example](https://github.com/voilajs/appkit/blob/main/src/security/examples/04-complete-app.js) -
  All security features working together

## 🛡️ Security Best Practices

Following these practices will help ensure your application remains secure:

1. **Use HTTPS in Production**: All security measures are bypassed if traffic
   can be intercepted.
2. **Environment Variables**: Store secrets and configuration in environment
   variables, not in code.
3. **Defense in Depth**: Apply multiple security layers; don't rely on a single
   protection mechanism.
4. **Validate Server-Side**: Never trust client-side validation alone; always
   validate on the server.
5. **Keep Updated**: Regularly update dependencies to get security patches.
6. **Error Messages**: Use generic error messages that don't leak implementation
   details.
7. **Security Headers**: Implement security headers like CSP alongside these
   utilities.

## 📊 Performance Considerations

- **Rate Limiter Memory**: The default in-memory store works for single-server
  deployments; use Redis for multiple servers.
- **CSRF Token Size**: The default 16-byte tokens balance security and
  performance.
- **Sanitization Complexity**: The `stripAllTags` option is faster than
  `allowedTags` when you don't need any HTML.
- **Middleware Order**: Place rate limiting before other middleware to reject
  excessive requests early.

## 🔍 Error Handling

The security module provides helpful errors that should be caught and handled:

```javascript
try {
  const token = generateCsrfToken(req.session);
} catch (error) {
  console.error('CSRF token generation failed:', error.message);
  // Handle gracefully
}

// Middleware error handling
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // Handle CSRF errors
    return res.status(403).send('Form expired. Please try again.');
  }
  next(err);
});
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajs/appkit/blob/main/src/security/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/security/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajs/appkit/blob/main/src/security/docs/PROMPT_REFERENCE.md) -
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
