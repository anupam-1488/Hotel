/**
 * @voilajs/appkit - Common validation schemas
 * @module @voilajs/appkit/validation/schemas
 */

/**
 * Common validation schemas
 */
export const commonSchemas = {
  email: {
    type: 'string',
    required: true,
    email: true,
    trim: true,
    lowercase: true,
    maxLength: 255,
  },

  password: {
    type: 'string',
    required: true,
    minLength: 8,
    maxLength: 128,
    validate(value) {
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain at least one number';
      }
      if (!/[^A-Za-z0-9]/.test(value)) {
        return 'Password must contain at least one special character';
      }
      return true;
    },
  },

  username: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 32,
    pattern: /^[a-zA-Z0-9_-]+$/,
    trim: true,
    lowercase: true,
  },

  id: {
    type: 'string',
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },

  uuid: {
    type: 'string',
    required: true,
    uuid: true,
  },

  url: {
    type: 'string',
    required: true,
    url: true,
    trim: true,
  },

  phone: {
    type: 'string',
    required: true,
    pattern: /^\+?[1-9]\d{1,14}$/,
    transform: (value) => value.replace(/\D/g, ''),
  },

  creditCard: {
    type: 'string',
    required: true,
    creditCard: true,
    transform: (value) => value.replace(/\D/g, ''),
  },

  date: {
    type: ['string', 'date'],
    required: true,
    transform: (value) => {
      if (typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return date;
      }
      return value;
    },
  },

  boolean: {
    type: 'boolean',
    transform: (value) => {
      if (typeof value === 'string') {
        return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
      }
      return Boolean(value);
    },
  },

  integer: {
    type: 'number',
    integer: true,
    transform: (value) => parseInt(value, 10),
  },

  positiveInteger: {
    type: 'number',
    integer: true,
    min: 1,
    transform: (value) => parseInt(value, 10),
  },

  percentage: {
    type: 'number',
    min: 0,
    max: 100,
    transform: (value) => parseFloat(value),
  },

  currency: {
    type: 'number',
    min: 0,
    precision: 2,
    transform: (value) => parseFloat(value),
  },

  tags: {
    type: 'array',
    items: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      trim: true,
      lowercase: true,
    },
    minItems: 0,
    maxItems: 20,
    unique: true,
  },

  slug: {
    type: 'string',
    required: true,
    pattern: /^[a-z0-9-]+$/,
    minLength: 1,
    maxLength: 100,
    lowercase: true,
    trim: true,
  },

  metadata: {
    type: 'object',
    additionalProperties: {
      type: ['string', 'number', 'boolean'],
    },
    maxProperties: 50,
  },

  address: {
    type: 'object',
    properties: {
      street: { type: 'string', required: true, maxLength: 255 },
      street2: { type: 'string', maxLength: 255 },
      city: { type: 'string', required: true, maxLength: 100 },
      state: { type: 'string', maxLength: 100 },
      country: { type: 'string', required: true, maxLength: 100 },
      postalCode: { type: 'string', required: true, maxLength: 20 },
    },
  },

  pagination: {
    type: 'object',
    properties: {
      page: { type: 'number', integer: true, min: 1, default: 1 },
      limit: { type: 'number', integer: true, min: 1, max: 100, default: 20 },
      sort: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
      sortBy: { type: 'string' },
    },
  },

  searchQuery: {
    type: 'object',
    properties: {
      q: { type: 'string', minLength: 1, maxLength: 100, trim: true },
      filters: { type: 'object', additionalProperties: true },
      page: { type: 'number', integer: true, min: 1, default: 1 },
      limit: { type: 'number', integer: true, min: 1, max: 100, default: 20 },
    },
  },

  fileUpload: {
    type: 'object',
    properties: {
      filename: { type: 'string', required: true, maxLength: 255 },
      mimetype: { type: 'string', required: true },
      size: { type: 'number', required: true, max: 10 * 1024 * 1024 }, // 10MB
      data: { type: ['buffer', 'string'], required: true },
    },
  },

  coordinates: {
    type: 'object',
    properties: {
      latitude: { type: 'number', required: true, min: -90, max: 90 },
      longitude: { type: 'number', required: true, min: -180, max: 180 },
    },
  },

  timeRange: {
    type: 'object',
    properties: {
      start: { type: ['string', 'date'], required: true },
      end: { type: ['string', 'date'], required: true },
    },
    validate(value) {
      const start = new Date(value.start);
      const end = new Date(value.end);

      if (start >= end) {
        return 'Start time must be before end time';
      }
      return true;
    },
  },

  socialMediaHandles: {
    type: 'object',
    properties: {
      twitter: { type: 'string', pattern: /^@?[a-zA-Z0-9_]{1,15}$/ },
      instagram: { type: 'string', pattern: /^[a-zA-Z0-9_.]{1,30}$/ },
      facebook: { type: 'string', pattern: /^[a-zA-Z0-9.]{5,50}$/ },
      linkedin: { type: 'string', url: true },
      github: { type: 'string', pattern: /^[a-zA-Z0-9-]{1,39}$/ },
    },
  },
};

/**
 * Creates a new schema
 * @param {Object} definition - Schema definition
 * @returns {Object} Schema object
 */
export function createSchema(definition) {
  return { ...definition };
}

/**
 * Merges multiple schemas
 * @param {...Object} schemas - Schemas to merge
 * @returns {Object} Merged schema
 */
export function mergeSchemas(...schemas) {
  const merged = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const schema of schemas) {
    if (schema.properties) {
      merged.properties = { ...merged.properties, ...schema.properties };
    }

    if (schema.required) {
      merged.required = [...new Set([...merged.required, ...schema.required])];
    }

    // Merge other properties
    for (const [key, value] of Object.entries(schema)) {
      if (key !== 'properties' && key !== 'required') {
        merged[key] = value;
      }
    }
  }

  return merged;
}

/**
 * Extends a schema with additional properties
 * @param {Object} baseSchema - Base schema
 * @param {Object} extensions - Extension properties
 * @returns {Object} Extended schema
 */
export function extendSchema(baseSchema, extensions) {
  const extended = { ...baseSchema };

  if (extensions.properties) {
    extended.properties = {
      ...(extended.properties || {}),
      ...extensions.properties,
    };
  }

  if (extensions.required) {
    extended.required = [...(extended.required || []), ...extensions.required];
  }

  // Extend other properties
  for (const [key, value] of Object.entries(extensions)) {
    if (key !== 'properties' && key !== 'required') {
      extended[key] = value;
    }
  }

  return extended;
}

/**
 * Common schema templates
 */

export const userRegistrationSchema = createSchema({
  type: 'object',
  required: ['email', 'password', 'username'],
  properties: {
    email: commonSchemas.email,
    password: commonSchemas.password,
    username: commonSchemas.username,
    firstName: { type: 'string', minLength: 1, maxLength: 50 },
    lastName: { type: 'string', minLength: 1, maxLength: 50 },
    terms: { type: 'boolean', required: true, truthy: true },
  },
});

export const userLoginSchema = createSchema({
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: commonSchemas.email,
    password: { type: 'string', required: true },
    remember: { type: 'boolean', default: false },
  },
});

export const userProfileSchema = createSchema({
  type: 'object',
  properties: {
    firstName: { type: 'string', minLength: 1, maxLength: 50 },
    lastName: { type: 'string', minLength: 1, maxLength: 50 },
    bio: { type: 'string', maxLength: 500 },
    avatar: commonSchemas.url,
    phone: commonSchemas.phone,
    address: commonSchemas.address,
    socialMedia: commonSchemas.socialMediaHandles,
  },
});

export const passwordResetSchema = createSchema({
  type: 'object',
  required: ['token', 'password'],
  properties: {
    token: { type: 'string', required: true },
    password: commonSchemas.password,
  },
});

export const productSchema = createSchema({
  type: 'object',
  required: ['name', 'price'],
  properties: {
    name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
    description: { type: 'string', maxLength: 5000 },
    price: commonSchemas.currency,
    sku: { type: 'string', pattern: /^[A-Z0-9-]+$/ },
    category: { type: 'string', required: true },
    tags: commonSchemas.tags,
    images: {
      type: 'array',
      items: commonSchemas.url,
      maxItems: 10,
    },
    inStock: { type: 'boolean', default: true },
    metadata: commonSchemas.metadata,
  },
});

export const orderSchema = createSchema({
  type: 'object',
  required: ['items', 'shippingAddress', 'paymentMethod'],
  properties: {
    items: {
      type: 'array',
      required: true,
      minItems: 1,
      items: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: commonSchemas.id,
          quantity: commonSchemas.positiveInteger,
          price: commonSchemas.currency,
        },
      },
    },
    shippingAddress: commonSchemas.address,
    billingAddress: commonSchemas.address,
    paymentMethod: {
      type: 'object',
      required: ['type'],
      properties: {
        type: {
          type: 'string',
          enum: ['credit_card', 'paypal', 'bank_transfer'],
        },
        details: { type: 'object' },
      },
    },
    couponCode: { type: 'string', pattern: /^[A-Z0-9-]+$/ },
    notes: { type: 'string', maxLength: 500 },
  },
});

export const commentSchema = createSchema({
  type: 'object',
  required: ['content'],
  properties: {
    content: { type: 'string', required: true, minLength: 1, maxLength: 5000 },
    parentId: commonSchemas.id,
    rating: { type: 'number', min: 1, max: 5, integer: true },
  },
});

export const apiKeySchema = createSchema({
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    permissions: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
    expiresAt: commonSchemas.date,
    rateLimit: {
      type: 'object',
      properties: {
        requests: commonSchemas.positiveInteger,
        window: { type: 'string', enum: ['second', 'minute', 'hour', 'day'] },
      },
    },
  },
});
