# @voilajs/appkit - Email Module 📧

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/workflow/status/voilajs/appkit/CI)](https://github.com/voilajs/appkit/actions)

> Simple, unified, and powerful email sending capabilities for Node.js
> applications

The Email module of `@voilajs/appkit` provides a streamlined interface for
sending emails through various providers including SMTP, SendGrid, AWS SES, and
Mailgun, with additional testing providers like MailHog and Mailtrap for
development environments. It includes a simple yet powerful template engine,
attachment handling, and provider-specific options.

## Module Overview

The Email module handles everything needed for sending various types of emails:

| Feature              | What it does                                       | Main functions                      |
| -------------------- | -------------------------------------------------- | ----------------------------------- |
| **Email Sending**    | Send basic and HTML emails with attachments        | `sendEmail()`, `closeEmail()`       |
| **Email Templates**  | Template rendering with variables and conditionals | `sendTemplatedEmail()`              |
| **Provider Support** | Integration with major email service providers     | `initEmail()`, `getEmailProvider()` |

## 🚀 Features

- **🔌 Multiple Providers** - Support for SMTP, SendGrid, AWS SES, Mailgun, and
  testing providers
- **📝 Template Engine** - Simple built-in template engine with variables,
  conditionals, and loops
- **📎 Attachment Support** - Easy attachment handling for documents and files
- **🧪 Testing Utilities** - Specialized testing providers (MailHog, Mailtrap)
  for development
- **🔄 Environment Switching** - Seamlessly switch between providers for
  different environments
- **🧩 Framework Agnostic** - Works with any Node.js framework or application
- **⚡ Simple API** - Intuitive functions with sensible defaults

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

Import the functions you need and start sending emails with just a few lines of
code:

```javascript
import { initEmail, sendEmail } from '@voilajs/appkit/email';

// Initialize provider
await initEmail('smtp', {
  host: 'smtp.example.com',
  port: 587,
  auth: {
    user: 'username',
    pass: 'password',
  },
  defaultFrom: 'sender@example.com',
});

// Send an email
await sendEmail(
  'recipient@example.com',
  'Hello World',
  '<p>This is a test email</p>'
);
```

## 📖 Core Functions

### Email Setup

These functions handle initializing and managing your email provider connection.

| Function             | Purpose                            | When to use                                       |
| -------------------- | ---------------------------------- | ------------------------------------------------- |
| `initEmail()`        | Initializes an email provider      | At application startup or service initialization  |
| `closeEmail()`       | Closes provider connections        | During application shutdown or provider switching |
| `getEmailProvider()` | Gets the current provider instance | When you need access to the underlying provider   |

```javascript
// Initialize provider based on environment
if (process.env.NODE_ENV === 'production') {
  await initEmail('ses', {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    defaultFrom: process.env.EMAIL_FROM,
  });
} else {
  await initEmail('mailhog', {
    defaultFrom: 'dev@example.com',
  });
}

// Clean up on shutdown
process.on('SIGTERM', async () => {
  await closeEmail();
});
```

### Email Sending

These functions handle the actual sending of emails with various options.

| Function               | Purpose                         | When to use                                      |
| ---------------------- | ------------------------------- | ------------------------------------------------ |
| `sendEmail()`          | Sends an email with options     | For any email sending (basic, HTML, attachments) |
| `sendTemplatedEmail()` | Sends an email using a template | When using variable substitution in emails       |

```javascript
// Send a basic email
await sendEmail(
  'user@example.com',
  'Welcome to Our Service',
  '<h1>Welcome!</h1><p>Thank you for signing up.</p>'
);

// Send an email with template variables
await sendTemplatedEmail(
  'user@example.com',
  'Order Confirmation',
  '<h1>Order #{{orderId}}</h1><p>Thank you, {{name}}!</p>',
  { orderId: '12345', name: 'John Doe' }
);
```

## 🔧 Configuration Options

### Provider Initialization Options

```javascript
// SMTP Configuration
await initEmail('smtp', {
  host: 'smtp.example.com', // required
  port: 587, // default: 587
  secure: false, // use TLS, default: false (true for port 465)
  auth: {
    // required unless auth: false
    user: 'username',
    pass: 'password',
  },
  defaultFrom: 'sender@example.com',
  pool: true, // use connection pool, default: false
  maxConnections: 5, // default: 5
  tls: {
    // TLS options
    rejectUnauthorized: true,
  },
});

// SendGrid Configuration
await initEmail('sendgrid', {
  apiKey: 'your-sendgrid-api-key', // required
  defaultFrom: 'sender@example.com', // recommended
  timeout: 30000, // optional, in milliseconds
});

// AWS SES Configuration
await initEmail('ses', {
  region: 'us-east-1', // required
  credentials: {
    // optional if using AWS env variables
    accessKeyId: 'your-access-key',
    secretAccessKey: 'your-secret-key',
  },
  defaultFrom: 'sender@example.com', // recommended
  configurationSet: 'your-config-set', // optional
});
```

### Email Sending Options

```javascript
await sendEmail(
  'recipient@example.com', // string or array of strings
  'Email Subject',
  '<p>HTML content</p>',
  {
    // All options are optional
    from: 'custom@example.com', // override default sender
    text: 'Plain text version', // alternative text version
    cc: 'cc@example.com', // string or array of strings
    bcc: 'bcc@example.com', // string or array of strings
    replyTo: 'reply@example.com', // reply-to address
    attachments: [
      // email attachments
      {
        filename: 'report.pdf',
        content: fs.readFileSync('./report.pdf'),
      },
    ],
    headers: {
      // custom email headers
      'X-Custom-Header': 'value',
    },
  }
);
```

## 💡 Common Use Cases

Here's where you can apply the email module's functionality in your
applications:

| Category           | Use Case              | Description                                     | Components Used                |
| ------------------ | --------------------- | ----------------------------------------------- | ------------------------------ |
| **Authentication** | Password Reset        | Send password reset links to users              | `sendTemplatedEmail()`         |
| **Authentication** | Email Verification    | Verify user email addresses                     | `sendTemplatedEmail()`         |
| **E-commerce**     | Order Confirmation    | Send order confirmations with details           | `sendTemplatedEmail()`         |
| **E-commerce**     | Shipping Notification | Notify customers of shipping status             | `sendTemplatedEmail()`         |
| **Marketing**      | Welcome Emails        | Send welcome emails to new users                | `sendTemplatedEmail()`         |
| **Marketing**      | Promotional Emails    | Send promotional emails with formatting         | `sendEmail()` with HTML        |
| **Reporting**      | System Alerts         | Send system alerts to administrators            | `sendEmail()`                  |
| **Reporting**      | Activity Reports      | Send periodic activity reports with attachments | `sendEmail()` with attachments |
| **Development**    | Local Testing         | Test emails in development environment          | `initEmail('mailhog')`         |
| **Development**    | Staging Environment   | Test emails in staging environment              | `initEmail('mailtrap')`        |
| **Production**     | Transactional Emails  | Send transactional emails in production         | `initEmail('ses')` or others   |
| **Production**     | Marketing Campaigns   | Send marketing campaign emails                  | `initEmail('sendgrid')`        |

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common email scenarios using the `@voilajs/appkit/email` module. We've
created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/email/docs/PROMPT_REFERENCE.md)
document designed specifically for LLMs to understand the module's capabilities
and generate consistent, high-quality email code.

### Sample Prompts to Try

#### Basic Email Setup

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/email/docs/PROMPT_REFERENCE.md and then create a complete email setup using @voilajs/appkit/email for an Express application that switches between providers based on environment:
- Use MailHog for development
- Use Mailtrap for testing
- Use SendGrid for staging
- Use AWS SES for production
```

#### Email Service Implementation

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/email/docs/PROMPT_REFERENCE.md and then implement an EmailService class using @voilajs/appkit/email with the following template-based functions:
- sendWelcomeEmail(user)
- sendPasswordResetEmail(user, resetToken)
- sendOrderConfirmation(order)
Include proper template rendering and error handling
```

#### Email Testing Framework

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/email/docs/PROMPT_REFERENCE.md and then create a testing utility for capturing emails sent with @voilajs/appkit/email:
- Function to set up email testing environment
- Function to capture and verify email content
- Function to clean up and close connections
Include a complete example of how to use this in a Jest or Mocha test suite
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Basic Email Sending](https://github.com/voilajs/appkit/blob/main/src/email/examples/01-basic-email.js) -
  How to send simple emails
- [HTML Emails with Templates](https://github.com/voilajs/appkit/blob/main/src/email/examples/02-template-email.js) -
  Working with HTML emails and templates
- [Email Attachments](https://github.com/voilajs/appkit/blob/main/src/email/examples/03-attachments.js) -
  Sending emails with file attachments
- [Provider Switching](https://github.com/voilajs/appkit/blob/main/src/email/examples/04-provider-switching.js) -
  Switching between different email providers
- [Email Service](https://github.com/voilajs/appkit/blob/main/src/email/examples/05-email-service.js) -
  Complete email service implementation
- [Express Integration](https://github.com/voilajs/appkit/blob/main/src/email/examples/email-demo-app) -
  Complete Express.js email integration

## 🛡️ Security Best Practices

1. **Environment Variables**: Store all email provider credentials in
   environment variables, never in code
2. **TLS/SSL**: Always use secure connections (TLS/SSL) for email sending
3. **Content Security**: Sanitize user-provided content before including it in
   templates
4. **Rate Limiting**: Implement rate limiting for password reset and
   verification emails
5. **Token Security**: Use signed tokens for verification links with appropriate
   expiration
6. **DKIM/SPF/DMARC**: Configure email authentication records for your sending
   domains
7. **Access Control**: Restrict access to email functionality in your
   application

## 📊 Performance Considerations

- **Connection Pooling**: Use connection pooling for SMTP to improve performance
  with high volume
- **Template Caching**: Cache compiled templates to avoid repeated parsing
- **Batch Sending**: Consider batching multiple emails when possible
- **Asynchronous Processing**: Send emails asynchronously or via a queue system
- **Provider Selection**: Choose appropriate providers based on volume
  (SES/SendGrid for high volume)

## 🔍 Error Handling

The module provides specific error messages that you should handle
appropriately:

```javascript
try {
  await initEmail('smtp', config);
  await sendEmail('recipient@example.com', 'Subject', 'Content');
} catch (error) {
  if (error.message.includes('authentication failed')) {
    console.error('SMTP authentication error, check credentials');
  } else if (error.message.includes('connection refused')) {
    console.error('SMTP connection error, check host and port');
  } else {
    console.error('Email error:', error.message);
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajs/appkit/blob/main/src/email/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/email/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajs/appkit/blob/main/src/email/docs/PROMPT_REFERENCE.md) -
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
