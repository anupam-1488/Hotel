# Validation Module

The validation module provides comprehensive data validation and sanitization
for Node.js applications. It offers schema-based validation, data sanitization,
and a collection of common validation patterns, ensuring data integrity and
security throughout your application.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Schema Validation](#schema-validation)
  - [Data Sanitization](#data-sanitization)
  - [Error Handling](#error-handling)
- [Basic Usage](#basic-usage)
  - [Validation](#validation)
  - [Sanitization](#sanitization)
  - [Common Schemas](#common-schemas)
- [Advanced Features](#advanced-features)
  - [Custom Validators](#custom-validators)
  - [Async Validation](#async-validation)
  - [Conditional Validation](#conditional-validation)
  - [Schema Composition](#schema-composition)
- [API Reference](#api-reference)
  - [Validation Functions](#validation-functions)
  - [Sanitization Functions](#sanitization-functions)
  - [Schema Functions](#schema-functions)
- [Common Patterns](#common-patterns)
  - [User Registration](#user-registration)
  - [API Input Validation](#api-input-validation)
  - [Form Validation](#form-validation)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling-1)
- [Integration Examples](#integration-examples)
- [Troubleshooting](#troubleshooting)

## Introduction

The validation module helps you:

- **Validate data** against schemas with type checking and custom rules
- **Sanitize input** to prevent security vulnerabilities
- **Handle errors** with detailed field-specific error messages
- **Reuse patterns** with pre-defined schemas for common use cases
- **Ensure data integrity** throughout your application
- **Improve security** by sanitizing user input

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import { validate, sanitize, commonSchemas } from '@voilajs/appkit/validation';

// Define a schema
const userSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    age: { type: 'number', min: 18 },
  },
};

// Validate data
const result = validate(userData, userSchema);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
} else {
  // Use validated data
  const user = result.value;
}

// Sanitize input
const sanitizedEmail = sanitize(userInput.email, {
  trim: true,
  lowercase: true,
  email: true,
});
```

## Core Concepts

### Schema Validation

Schemas define the structure and constraints of your data:

```javascript
const schema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    email: { type: 'string', email: true },
    age: { type: 'number', min: 0, max: 120 },
  },
};
```

### Data Sanitization

Sanitizers clean and transform data to prevent security issues:

```javascript
const sanitized = sanitize(userInput, {
  name: { trim: true, escape: true },
  email: { lowercase: true, trim: true },
  tags: { compact: true, unique: true },
});
```

### Error Handling

Validation errors provide detailed information about what went wrong:

```javascript
try {
  const result = validate(data, schema);
  if (!result.valid) {
    result.errors.forEach((error) => {
      console.log(`${error.path}: ${error.message}`);
    });
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.getMessages());
  }
}
```

## Basic Usage

### Validation

```javascript
import { validate, createValidator } from '@voilajs/appkit/validation';

// Direct validation
const result = validate(data, schema);
console.log(result.valid); // true or false
console.log(result.errors); // Array of errors
console.log(result.value); // Processed value

// Create reusable validator
const validator = createValidator(schema);
const result1 = validator(data1);
const result2 = validator(data2);

// Validation options
const result = validate(data, schema, {
  abortEarly: false, // Collect all errors
  allowUnknown: false, // Reject unknown properties
  stripUnknown: true, // Remove unknown properties
});
```

### Sanitization

```javascript
import {
  sanitize,
  sanitizeHtml,
  createSanitizer,
} from '@voilajs/appkit/validation';

// Basic sanitization
const clean = sanitize(data, {
  name: { trim: true, escape: true },
  email: { lowercase: true, trim: true },
  bio: { truncate: 500 },
});

// HTML sanitization
const safeHtml = sanitizeHtml(userContent, {
  allowedTags: ['p', 'br', 'strong', 'em'],
  allowedAttributes: {
    a: ['href', 'title'],
  },
});

// Create reusable sanitizer
const userSanitizer = createSanitizer({
  name: { trim: true, escape: true },
  email: { lowercase: true, trim: true },
});

const sanitizedUser = userSanitizer(userInput);
```

### Common Schemas

```javascript
import { commonSchemas } from '@voilajs/appkit/validation';

// Use predefined schemas
const schema = {
  type: 'object',
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    username: commonSchemas.username,
    phoneNumber: commonSchemas.phone,
    website: commonSchemas.url,
    birthDate: commonSchemas.date,
  },
};

// Available common schemas:
// - email, password, username, phone, url
// - id, uuid, slug, tags
// - date, integer, positiveInteger, percentage
// - address, coordinates, timeRange
// - pagination, searchQuery, fileUpload
```

## Advanced Features

### Custom Validators

```javascript
// Schema with custom validator
const schema = {
  type: 'string',
  validate(value, context) {
    if (value.includes('spam')) {
      return 'Content contains spam';
    }

    // Access context data
    if (context.data.type === 'premium' && value.length < 100) {
      return 'Premium content must be at least 100 characters';
    }

    return true; // Valid
  },
};

// Multiple validators
const passwordSchema = {
  type: 'string',
  minLength: 8,
  validate: [
    (value) => /[A-Z]/.test(value) || 'Must contain uppercase letter',
    (value) => /[0-9]/.test(value) || 'Must contain number',
    (value) => /[^A-Za-z0-9]/.test(value) || 'Must contain special character',
  ],
};
```

### Async Validation

```javascript
import {
  validateAsync,
  createAsyncValidator,
} from '@voilajs/appkit/validation';

// Async validator for checking uniqueness
const schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      email: true,
      validateAsync: async (value) => {
        const exists = await checkEmailExists(value);
        return exists ? 'Email already exists' : true;
      },
    },
  },
};

// Use async validation
const result = await validateAsync(data, schema);

// Create reusable async validator
const validator = createAsyncValidator(schema);
const result = await validator(data);
```

### Conditional Validation

```javascript
// Conditional required fields
const schema = {
  type: 'object',
  properties: {
    accountType: { type: 'string', enum: ['personal', 'business'] },
    businessName: {
      type: 'string',
      when: {
        accountType: 'business',
        then: { required: true },
        otherwise: { required: false },
      },
    },
  },
};

// Conditional validation with function
const paymentSchema = {
  type: 'object',
  properties: {
    paymentMethod: { type: 'string', enum: ['card', 'bank'] },
    cardNumber: {
      type: 'string',
      when: (data) => data.paymentMethod === 'card',
      then: { required: true, creditCard: true },
      otherwise: {},
    },
  },
};
```

### Schema Composition

```javascript
import { mergeSchemas, extendSchema } from '@voilajs/appkit/validation';

// Merge multiple schemas
const baseUserSchema = {
  type: 'object',
  properties: {
    id: commonSchemas.id,
    email: commonSchemas.email,
  },
};

const profileSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
  },
};

const fullUserSchema = mergeSchemas(baseUserSchema, profileSchema);

// Extend existing schema
const adminUserSchema = extendSchema(fullUserSchema, {
  properties: {
    role: { type: 'string', enum: ['admin', 'superadmin'] },
    permissions: { type: 'array', items: { type: 'string' } },
  },
  required: ['role'],
});
```

## API Reference

### Validation Functions

#### validate(data, schema, options?)

Validates data against a schema.

**Parameters:**

- `data` (\*): Data to validate
- `schema` (Object): Validation schema
- `options` (Object, optional):
  - `abortEarly` (boolean): Stop on first error
  - `allowUnknown` (boolean): Allow unknown properties
  - `stripUnknown` (boolean): Remove unknown properties

**Returns:** `{ valid: boolean, errors: Array, value: any }`

#### createValidator(schema, options?)

Creates a reusable validator function.

**Parameters:**

- `schema` (Object): Validation schema
- `options` (Object, optional): Default options

**Returns:** Function

#### validateAsync(data, schema, options?)

Validates data asynchronously.

**Parameters:**

- Same as `validate`

**Returns:** Promise<{ valid: boolean, errors: Array, value: any }>

### Sanitization Functions

#### sanitize(data, rules)

Sanitizes data based on rules.

**Parameters:**

- `data` (\*): Data to sanitize
- `rules` (Object|Function): Sanitization rules

**Returns:** Sanitized data

#### sanitizeHtml(input, options?)

Sanitizes HTML content.

**Parameters:**

- `input` (string): HTML to sanitize
- `options` (Object, optional):
  - `allowedTags` (Array): Allowed HTML tags
  - `allowedAttributes` (Object): Allowed attributes per tag

**Returns:** string

#### createSanitizer(rules)

Creates a reusable sanitizer function.

**Parameters:**

- `rules` (Object): Sanitization rules

**Returns:** Function

### Schema Functions

#### commonSchemas

Object containing predefined schemas for common data types.

#### createSchema(definition)

Creates a new schema.

**Parameters:**

- `definition` (Object): Schema definition

**Returns:** Object

#### mergeSchemas(...schemas)

Merges multiple schemas.

**Parameters:**

- `...schemas` (Object[]): Schemas to merge

**Returns:** Object

## Common Patterns

### User Registration

```javascript
import { validate, sanitize, commonSchemas } from '@voilajs/appkit/validation';

const registrationSchema = {
  type: 'object',
  required: ['email', 'password', 'username'],
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    username: commonSchemas.username,
    terms: { type: 'boolean', required: true, truthy: true },
  },
};

app.post('/register', async (req, res) => {
  // Sanitize input
  const sanitized = sanitize(req.body, {
    email: { lowercase: true, trim: true },
    username: { lowercase: true, trim: true, alphanumeric: true },
    password: { trim: false }, // Don't trim passwords
  });

  // Validate
  const result = validate(sanitized, registrationSchema);

  if (!result.valid) {
    return res.status(400).json({ errors: result.errors });
  }

  // Check unique email
  if (await userExists(result.value.email)) {
    return res.status(400).json({
      errors: [{ path: 'email', message: 'Email already exists' }],
    });
  }

  // Create user
  const user = await createUser(result.value);
  res.json({ user });
});
```

### API Input Validation

```javascript
// Middleware for validation
function validateRequest(schema) {
  return (req, res, next) => {
    const result = validate(req.body, schema);

    if (!result.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.errors,
      });
    }

    req.validated = result.value;
    next();
  };
}

// Use in routes
app.post('/api/products', validateRequest(productSchema), async (req, res) => {
  const product = await createProduct(req.validated);
  res.json(product);
});
```

### Form Validation

```javascript
// Client-side validation
function validateForm(formData) {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', required: true, minLength: 1 },
      email: { type: 'string', required: true, email: true },
      message: { type: 'string', required: true, minLength: 10 },
    },
  };

  const result = validate(formData, schema);

  if (!result.valid) {
    // Show errors
    result.errors.forEach((error) => {
      const field = document.querySelector(`[name="${error.path}"]`);
      const errorElement = field.parentElement.querySelector('.error');
      errorElement.textContent = error.message;
    });
    return false;
  }

  return true;
}
```

## Best Practices

### 1. Sanitize Before Validation

```javascript
// Always sanitize first
const sanitized = sanitize(userInput, {
  email: { lowercase: true, trim: true },
  name: { trim: true, escape: true },
});

// Then validate
const result = validate(sanitized, schema);
```

### 2. Use Specific Error Messages

```javascript
const schema = {
  password: {
    type: 'string',
    minLength: 8,
    validate(value) {
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain at least one number';
      }
      return true;
    },
  },
};
```

### 3. Validate at the Right Layer

```javascript
// Model validation
class User {
  static validationSchema = {
    email: commonSchemas.email,
    password: commonSchemas.password,
  };

  static async create(data) {
    const result = validate(data, this.validationSchema);
    if (!result.valid) {
      throw new ValidationError('Invalid user data', result.errors);
    }

    // Create user...
  }
}

// API validation
app.post('/api/users', validateRequest(userSchema), userController.create);

// Form validation
const formValidator = createValidator(formSchema);
form.onSubmit = (data) => {
  const result = formValidator(data);
  // Handle validation...
};
```

### 4. Reuse Common Patterns

```javascript
// Define common schemas
const schemas = {
  id: commonSchemas.id,
  timestamp: commonSchemas.date,
  money: { type: 'number', min: 0, precision: 2 },
};

// Compose complex schemas
const orderSchema = {
  type: 'object',
  properties: {
    id: schemas.id,
    amount: schemas.money,
    createdAt: schemas.timestamp,
  },
};
```

### 5. Handle Async Validation Properly

```javascript
// Check uniqueness asynchronously
const schema = {
  email: {
    type: 'string',
    email: true,
    validateAsync: async (value) => {
      const exists = await db.users.findOne({ email: value });
      return exists ? 'Email already taken' : true;
    },
  },
};

// Use in route handler
app.post('/register', async (req, res) => {
  try {
    const result = await validateAsync(req.body, schema);
    if (!result.valid) {
      return res.status(400).json({ errors: result.errors });
    }
    // Proceed with registration...
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});
```

### 6. Sanitize User Content

```javascript
// Sanitize HTML content
const safeContent = sanitizeHtml(userInput, {
  allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
  allowedAttributes: {
    a: ['href', 'title'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
});

// Sanitize for database storage
const dbSafe = sanitize(userInput, {
  name: { trim: true, escape: true },
  bio: { trim: true, truncate: 500 },
  tags: { array: true, unique: true, limit: 10 },
});
```

## Error Handling

```javascript
import { ValidationError } from '@voilajs/appkit/validation';

// Handle validation errors
try {
  const result = validate(data, schema);
  if (!result.valid) {
    throw new ValidationError('Validation failed', result.errors);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    // Get all error messages
    console.log(error.getMessages());

    // Get errors for specific field
    const emailErrors = error.getFieldErrors('email');

    // Check if field has errors
    if (error.hasFieldErrors('password')) {
      // Handle password errors
    }

    // Convert to JSON
    res.status(400).json(error.toJSON());
  }
}

// Express error handler
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors,
    });
  } else {
    next(err);
  }
});
```

## Integration Examples

### Express Middleware

```javascript
import express from 'express';
import { validate, ValidationError } from '@voilajs/appkit/validation';

const app = express();

// Validation middleware
function validate(schema) {
  return (req, res, next) => {
    const result = validate(req.body, schema);

    if (!result.valid) {
      return next(new ValidationError('Validation failed', result.errors));
    }

    req.validated = result.value;
    next();
  };
}

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    res.status(400).json({
      error: err.message,
      details: err.errors,
    });
  } else {
    next(err);
  }
});

// Use in routes
app.post('/api/users', validate(userSchema), (req, res) => {
  // Use req.validated
  const user = createUser(req.validated);
  res.json(user);
});
```

### Database Integration

```javascript
import { validate, sanitize } from '@voilajs/appkit/validation';

class Model {
  static schema = {};

  static async create(data) {
    // Sanitize
    const sanitized = sanitize(data, this.sanitizeRules);

    // Validate
    const result = validate(sanitized, this.schema);

    if (!result.valid) {
      throw new ValidationError(`Invalid ${this.name} data`, result.errors);
    }

    // Save to database
    return await db.collection(this.collection).insertOne(result.value);
  }

  static async update(id, data) {
    // Partial validation for updates
    const updateSchema = {
      ...this.schema,
      required: [], // Make all fields optional for updates
    };

    const result = validate(data, updateSchema);

    if (!result.valid) {
      throw new ValidationError(`Invalid ${this.name} data`, result.errors);
    }

    return await db
      .collection(this.collection)
      .updateOne({ _id: id }, { $set: result.value });
  }
}

// User model
class User extends Model {
  static collection = 'users';

  static schema = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: commonSchemas.email,
      password: commonSchemas.password,
      profile: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
      },
    },
  };

  static sanitizeRules = {
    email: { lowercase: true, trim: true },
    password: { trim: false },
    profile: {
      firstName: { trim: true, escape: true },
      lastName: { trim: true, escape: true },
    },
  };
}
```

### React Form Validation

```javascript
import { useState } from 'react';
import { validate, createValidator } from '@voilajs/appkit/validation';

// Create validator
const validator = createValidator({
  type: 'object',
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
  },
});

function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = validator(formData);

    if (!result.valid) {
      // Convert errors to object for easy access
      const errorMap = {};
      result.errors.forEach((error) => {
        errorMap[error.path] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    // Submit form
    login(result.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <button type="submit">Login</button>
    </form>
  );
}
```

## Troubleshooting

### Common Issues

#### 1. Validation Always Fails

```javascript
// Check schema structure
console.log('Schema:', JSON.stringify(schema, null, 2));
console.log('Data:', JSON.stringify(data, null, 2));

// Enable detailed logging
const result = validate(data, schema);
console.log('Validation result:', result);

// Check for type mismatches
// Common issue: numbers as strings
const schema = {
  age: { type: 'number' }, // Expects number
};

// Fix: Transform the value
const fixedSchema = {
  age: {
    type: 'number',
    transform: (value) => Number(value),
  },
};
```

#### 2. Required Fields Not Working

```javascript
// Incorrect
const schema = {
  properties: {
    email: { required: true }, // Wrong!
  },
};

// Correct
const schema = {
  required: ['email'], // Required at object level
  properties: {
    email: { type: 'string' },
  },
};
```

#### 3. Custom Validators Not Running

```javascript
// Check if value exists
const schema = {
  field: {
    type: 'string',
    validate(value) {
      console.log('Validator called with:', value);
      // Validator only runs if value exists
      return value.length > 5;
    },
  },
};

// For optional fields, use conditional validation
const schema = {
  field: {
    type: 'string',
    validate(value) {
      // Only validate if value is provided
      if (value !== undefined) {
        return value.length > 5;
      }
      return true;
    },
  },
};
```

#### 4. Async Validation Not Working

```javascript
// Make sure to use validateAsync
const result = await validateAsync(data, schema); // Not validate()

// Ensure async validator returns a promise
const schema = {
  email: {
    validateAsync: async (value) => {
      const exists = await checkEmail(value);
      return exists ? 'Email exists' : true;
    },
  },
};
```

#### 5. Sanitization Not Applied

```javascript
// Sanitize before validation
const sanitized = sanitize(data, rules);
const result = validate(sanitized, schema);

// Or combine in schema with transform
const schema = {
  email: {
    type: 'string',
    transform: (value) => value.toLowerCase().trim(),
  },
};
```

## Support

For issues and feature requests, visit our
[GitHub repository](https://github.com/voilajs/appkit).
