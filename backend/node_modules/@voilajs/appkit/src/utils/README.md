# Utils Module

The utils module provides a comprehensive collection of utility functions for
common programming tasks in Node.js applications. It includes tools for object
manipulation, string operations, date handling, and asynchronous operations,
designed to reduce boilerplate code and enhance developer productivity.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Object Utilities](#object-utilities)
  - [String Utilities](#string-utilities)
  - [Date Utilities](#date-utilities)
  - [Async Utilities](#async-utilities)
- [Basic Usage](#basic-usage)
  - [Object Operations](#object-operations)
  - [String Manipulation](#string-manipulation)
  - [Date Handling](#date-handling)
  - [Async Control Flow](#async-control-flow)
- [Advanced Features](#advanced-features)
  - [Retry Mechanisms](#retry-mechanisms)
  - [Concurrency Control](#concurrency-control)
  - [Function Modifiers](#function-modifiers)
  - [Queue Management](#queue-management)
- [Integration Patterns](#integration-patterns)
  - [API Request Handling](#api-request-handling)
  - [Data Processing](#data-processing)
  - [Event Management](#event-management)
- [Best Practices](#best-practices)
- [Real-World Examples](#real-world-examples)
- [API Reference](#api-reference)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)

## Introduction

The utils module simplifies common programming tasks with a set of well-tested,
performant utility functions. Key benefits include:

- **Type Safety**: Built-in parameter validation and error handling
- **Performance**: Optimized implementations for common operations
- **Flexibility**: Composable functions that work well together
- **Developer Experience**: Clear APIs with comprehensive documentation
- **Zero Dependencies**: Lightweight utilities with no external dependencies

## Installation

```bash
npm install @voilajs/appkit
```

## Quick Start

```javascript
import {
  pick,
  omit,
  camelCase,
  formatDate,
  sleep,
  retry,
} from '@voilajs/appkit/utils';

// Object manipulation
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret',
};
const publicUser = omit(user, ['password']);
const userInfo = pick(user, ['id', 'name']);

// String operations
const formatted = camelCase('user-profile-settings'); // userProfileSettings

// Date formatting
const date = new Date();
const formatted = formatDate(date, 'YYYY-MM-DD HH:mm:ss');

// Async operations
await sleep(1000); // Wait 1 second

const data = await retry(
  async () => {
    return await fetchData(); // Retries on failure
  },
  { attempts: 3, delay: 1000 }
);
```

## Core Concepts

### Object Utilities

Safely manipulate objects without mutation:

```javascript
import { pick, omit, deepMerge, clone } from '@voilajs/appkit/utils';

// Select specific properties
const selected = pick(obj, ['name', 'age']);

// Remove specific properties
const filtered = omit(obj, ['password', 'ssn']);

// Deep merge objects
const config = deepMerge(defaults, userConfig);

// Deep clone objects
const copy = clone(original);
```

### String Utilities

Transform and manipulate strings:

```javascript
import {
  capitalize,
  camelCase,
  snakeCase,
  generateId,
} from '@voilajs/appkit/utils';

// Case conversions
capitalize('hello'); // 'Hello'
camelCase('hello-world'); // 'helloWorld'
snakeCase('helloWorld'); // 'hello_world'

// Generate unique IDs
const id = generateId(); // 'aBc123...'
const shortId = generateId(8); // 'aBc12345'
```

### Date Utilities

Handle date operations and formatting:

```javascript
import {
  formatDate,
  parseDate,
  addDays,
  dateDiff,
} from '@voilajs/appkit/utils';

// Format dates
const formatted = formatDate(new Date(), 'YYYY-MM-DD');

// Parse date strings
const date = parseDate('2024-12-25', 'YYYY-MM-DD');

// Date arithmetic
const tomorrow = addDays(new Date(), 1);
const nextMonth = addMonths(new Date(), 1);

// Calculate differences
const days = dateDiff(date1, date2, 'days');
```

### Async Utilities

Control asynchronous operations:

```javascript
import { sleep, retry, timeout, parallel } from '@voilajs/appkit/utils';

// Delay execution
await sleep(1000);

// Retry failed operations
const result = await retry(
  async () => {
    return await unreliableOperation();
  },
  { attempts: 3, delay: 1000 }
);

// Add timeouts to promises
const data = await timeout(fetchData(), 5000);

// Control concurrency
const results = await parallel(tasks, 5); // Max 5 concurrent
```

## Basic Usage

### Object Operations

```javascript
import { pick, omit, deepMerge, clone } from '@voilajs/appkit/utils';

// Pick specific properties
const user = { id: 1, name: 'John', email: 'john@example.com', role: 'admin' };
const publicInfo = pick(user, ['id', 'name']);
// { id: 1, name: 'John' }

// Omit sensitive properties
const safeUser = omit(user, ['role']);
// { id: 1, name: 'John', email: 'john@example.com' }

// Deep merge configurations
const defaultConfig = {
  server: { port: 3000, host: 'localhost' },
  database: { pool: { min: 2, max: 10 } },
};

const userConfig = {
  server: { port: 8080 },
  database: { pool: { max: 20 } },
};

const finalConfig = deepMerge(defaultConfig, userConfig);
// {
//   server: { port: 8080, host: 'localhost' },
//   database: { pool: { min: 2, max: 20 } }
// }

// Deep clone objects
const original = { nested: { value: 42 } };
const copy = clone(original);
copy.nested.value = 100;
console.log(original.nested.value); // Still 42
```

### String Manipulation

```javascript
import {
  capitalize,
  camelCase,
  snakeCase,
  generateId,
} from '@voilajs/appkit/utils';

// Case transformations
const title = capitalize('hello world'); // 'Hello world'
const variableName = camelCase('user-profile-settings'); // 'userProfileSettings'
const columnName = snakeCase('createdAt'); // 'created_at'

// Generate unique identifiers
const id = generateId(); // 'a8f3b2c9d4e5f6a7b8c9'
const shortId = generateId(6); // 'a8f3b2'

// Practical example: API response transformation
function transformApiResponse(data) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[camelCase(key)] = value;
    return acc;
  }, {});
}

const apiResponse = {
  user_id: 123,
  first_name: 'John',
  last_login: '2024-01-01',
};

const transformed = transformApiResponse(apiResponse);
// { userId: 123, firstName: 'John', lastLogin: '2024-01-01' }
```

### Date Handling

```javascript
import {
  formatDate,
  parseDate,
  addDays,
  addMonths,
  dateDiff,
  startOf,
  endOf,
  isBetween,
} from '@voilajs/appkit/utils';

// Format dates for display
const now = new Date();
console.log(formatDate(now, 'YYYY-MM-DD')); // '2024-01-15'
console.log(formatDate(now, 'MMM DD, YYYY')); // 'Jan 15, 2024'
console.log(formatDate(now, 'HH:mm:ss')); // '14:30:45'

// Parse date strings
const date = parseDate('2024-12-25', 'YYYY-MM-DD');
const time = parseDate('14:30:00', 'HH:mm:ss');

// Date arithmetic
const tomorrow = addDays(new Date(), 1);
const nextWeek = addDays(new Date(), 7);
const nextMonth = addMonths(new Date(), 1);
const nextYear = addYears(new Date(), 1);

// Calculate date differences
const start = new Date('2024-01-01');
const end = new Date('2024-01-15');
console.log(dateDiff(end, start, 'days')); // 14
console.log(dateDiff(end, start, 'hours')); // 336

// Date ranges
const startOfMonth = startOf(new Date(), 'month');
const endOfMonth = endOf(new Date(), 'month');
const isWithinMonth = isBetween(date, startOfMonth, endOfMonth);
```

### Async Control Flow

```javascript
import {
  sleep,
  retry,
  timeout,
  parallel,
  series,
  debounce,
  throttle,
} from '@voilajs/appkit/utils';

// Simple delay
async function processWithDelay() {
  console.log('Processing...');
  await sleep(2000);
  console.log('Done!');
}

// Retry with exponential backoff
async function fetchWithRetry(url) {
  return retry(
    async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    {
      attempts: 5,
      delay: 1000,
      factor: 2,
      onRetry: (error, attempt) => {
        console.log(`Attempt ${attempt} failed:`, error.message);
      },
    }
  );
}

// Add timeout to operations
async function fetchWithTimeout(url) {
  try {
    return await timeout(fetch(url), 5000, 'Request timed out');
  } catch (error) {
    console.error('Failed to fetch:', error.message);
    throw error;
  }
}

// Control concurrency
async function processItems(items) {
  const tasks = items.map((item) => () => processItem(item));

  // Process max 5 items concurrently
  const results = await parallel(tasks, 5);

  return results;
}

// Function modifiers
const searchInput = document.querySelector('#search');
const debouncedSearch = debounce(async (query) => {
  const results = await searchAPI(query);
  displayResults(results);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

## Advanced Features

### Retry Mechanisms

```javascript
import { retry } from '@voilajs/appkit/utils';

// Custom retry logic
const fetchData = retry(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  {
    attempts: 5,
    delay: 1000,
    factor: 2,
    maxDelay: 10000,
    retryIf: (error) => {
      // Only retry on network errors or 5xx status codes
      return (
        error.message.includes('NetworkError') ||
        error.message.includes('HTTP 5')
      );
    },
    onRetry: (error, attempt, delay) => {
      console.log(`Retry ${attempt} after ${delay}ms:`, error.message);
    },
  }
);

// Database operations with retry
async function resilientDatabaseOperation() {
  return retry(
    async () => {
      const connection = await db.connect();
      try {
        return await connection.query('SELECT * FROM users');
      } finally {
        await connection.close();
      }
    },
    {
      attempts: 3,
      delay: 500,
      retryIf: (error) => {
        // Retry on connection errors
        return error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT';
      },
    }
  );
}
```

### Concurrency Control

```javascript
import { parallel, series, mapAsync, createQueue } from '@voilajs/appkit/utils';

// Process array with concurrency limit
async function processLargeDataset(items) {
  // Process max 10 items at once
  const results = await mapAsync(
    items,
    async (item) => {
      return await processItem(item);
    },
    10
  );

  return results;
}

// Mixed parallel and serial execution
async function complexWorkflow(data) {
  // Step 1: Parallel preprocessing
  const preprocessed = await parallel(
    data.map((item) => () => preprocess(item)),
    5
  );

  // Step 2: Serial database operations
  const dbResults = await series(
    preprocessed.map((item) => () => saveToDatabase(item))
  );

  // Step 3: Parallel API calls
  const apiResults = await parallel(
    dbResults.map((result) => () => callExternalAPI(result)),
    3
  );

  return apiResults;
}

// Queue with controlled concurrency
const uploadQueue = createQueue(3); // Max 3 concurrent uploads

async function uploadFiles(files) {
  const uploads = files.map((file) => uploadQueue.push(() => uploadFile(file)));

  // Wait for all uploads to complete
  return Promise.all(uploads);
}
```

### Function Modifiers

```javascript
import { debounce, throttle } from '@voilajs/appkit/utils';

// Debounce user input
const searchBox = document.querySelector('#search');
const debouncedSearch = debounce(
  async (query) => {
    if (query.length < 3) return;

    const results = await searchAPI(query);
    displaySearchResults(results);
  },
  300,
  {
    leading: false,
    trailing: true,
  }
);

searchBox.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// Throttle scroll events
const throttledScroll = throttle(
  () => {
    const scrollPosition = window.scrollY;
    updateScrollIndicator(scrollPosition);

    if (scrollPosition > 1000) {
      showBackToTopButton();
    }
  },
  100,
  {
    leading: true,
    trailing: false,
  }
);

window.addEventListener('scroll', throttledScroll);

// Cancel pending executions
function cleanup() {
  debouncedSearch.cancel();
  throttledScroll.cancel();
}
```

### Queue Management

```javascript
import { createQueue } from '@voilajs/appkit/utils';

// Create a job processing queue
const jobQueue = createQueue(5); // Process max 5 jobs concurrently

// Job processor
async function processJob(job) {
  console.log(`Processing job ${job.id}`);

  try {
    const result = await jobQueue.push(async () => {
      // Simulate job processing
      await sleep(Math.random() * 2000);

      if (Math.random() < 0.1) {
        throw new Error(`Job ${job.id} failed`);
      }

      return { jobId: job.id, status: 'completed' };
    });

    console.log(`Job ${job.id} completed`);
    return result;
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error.message);
    throw error;
  }
}

// Monitor queue status
setInterval(() => {
  console.log(`Queue size: ${jobQueue.size()}`);
}, 1000);

// Process multiple jobs
async function processBatch(jobs) {
  const results = await Promise.allSettled(jobs.map((job) => processJob(job)));

  const successful = results.filter((r) => r.status === 'fulfilled');
  const failed = results.filter((r) => r.status === 'rejected');

  console.log(`Completed: ${successful.length}, Failed: ${failed.length}`);

  return results;
}
```

## Integration Patterns

### API Request Handling

```javascript
import { retry, timeout, debounce } from '@voilajs/appkit/utils';

// Resilient API client
class APIClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.timeout = options.timeout || 5000;
    this.retries = options.retries || 3;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    return retry(
      async () => {
        const response = await timeout(
          fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
          }),
          this.timeout
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      {
        attempts: this.retries,
        delay: 1000,
        factor: 2,
        retryIf: (error) => {
          // Retry on network errors or 5xx status codes
          return (
            error.name === 'TimeoutError' ||
            error.message.includes('NetworkError') ||
            error.message.includes('HTTP 5')
          );
        },
      }
    );
  }

  // Create debounced search method
  createSearch(searchFn, delay = 300) {
    return debounce(searchFn, delay);
  }
}

// Usage
const api = new APIClient('https://api.example.com', {
  timeout: 10000,
  retries: 5,
});

// Create a debounced search function
const searchUsers = api.createSearch(async (query) => {
  if (!query || query.length < 3) return [];

  try {
    return await api.request(`/users/search?q=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
});
```

### Data Processing

```javascript
import {
  parallel,
  mapAsync,
  filterAsync,
  chunk,
  pick,
  omit,
} from '@voilajs/appkit/utils';

// Process large datasets efficiently
class DataProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 100;
    this.concurrency = options.concurrency || 5;
  }

  async processRecords(records, processor) {
    // Split into batches
    const batches = this.createBatches(records, this.batchSize);

    // Process batches with concurrency control
    const results = await mapAsync(
      batches,
      async (batch) => {
        return await this.processBatch(batch, processor);
      },
      this.concurrency
    );

    // Flatten results
    return results.flat();
  }

  createBatches(array, size) {
    const batches = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  async processBatch(batch, processor) {
    return parallel(
      batch.map((record) => () => processor(record)),
      10 // Process 10 records concurrently within each batch
    );
  }

  // Filter records asynchronously
  async filterRecords(records, predicate) {
    return filterAsync(records, predicate, this.concurrency);
  }

  // Transform records
  transformRecords(records, fields) {
    return records.map((record) => {
      if (fields.include) {
        return pick(record, fields.include);
      } else if (fields.exclude) {
        return omit(record, fields.exclude);
      }
      return record;
    });
  }
}

// Usage
const processor = new DataProcessor({
  batchSize: 50,
  concurrency: 3,
});

// Process user data
async function processUserData(users) {
  // Transform data
  const publicUsers = processor.transformRecords(users, {
    exclude: ['password', 'ssn', 'creditCard'],
  });

  // Filter valid users
  const validUsers = await processor.filterRecords(
    publicUsers,
    async (user) => {
      return user.emailVerified && (await checkUserStatus(user.id));
    }
  );

  // Process users
  const results = await processor.processRecords(validUsers, async (user) => {
    return {
      ...user,
      profileUrl: await generateProfileUrl(user),
      permissions: await fetchUserPermissions(user.id),
    };
  });

  return results;
}
```

### Event Management

```javascript
import { debounce, throttle, createQueue } from '@voilajs/appkit/utils';

// Event handler with controlled execution
class EventManager {
  constructor() {
    this.handlers = new Map();
    this.queue = createQueue(10);
  }

  // Register event handler with options
  on(event, handler, options = {}) {
    let finalHandler = handler;

    if (options.debounce) {
      finalHandler = debounce(handler, options.debounce, {
        leading: options.leading,
        trailing: options.trailing,
      });
    } else if (options.throttle) {
      finalHandler = throttle(handler, options.throttle, {
        leading: options.leading,
        trailing: options.trailing,
      });
    }

    if (options.queued) {
      const queuedHandler = (...args) => {
        return this.queue.push(() => finalHandler(...args));
      };
      finalHandler = queuedHandler;
    }

    this.handlers.set(`${event}:${handler.name}`, finalHandler);
    return finalHandler;
  }

  // Trigger event
  async emit(event, data) {
    const handlers = Array.from(this.handlers.entries())
      .filter(([key]) => key.startsWith(`${event}:`))
      .map(([, handler]) => handler);

    if (handlers.length === 0) return;

    // Execute handlers
    const results = await Promise.allSettled(
      handlers.map((handler) => handler(data))
    );

    // Log any errors
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Handler ${index} failed:`, result.reason);
      }
    });
  }

  // Cancel pending handlers
  cancel(event) {
    const handlers = Array.from(this.handlers.entries()).filter(([key]) =>
      key.startsWith(`${event}:`)
    );

    handlers.forEach(([key, handler]) => {
      if (handler.cancel) handler.cancel();
      this.handlers.delete(key);
    });
  }
}

// Usage
const events = new EventManager();

// Debounced search handler
events.on(
  'search',
  async (query) => {
    const results = await searchAPI(query);
    displayResults(results);
  },
  { debounce: 300 }
);

// Throttled scroll handler
events.on(
  'scroll',
  (position) => {
    updateScrollIndicator(position);
  },
  { throttle: 100 }
);

// Queued analytics events
events.on(
  'analytics',
  async (event) => {
    await sendToAnalytics(event);
  },
  { queued: true }
);

// Emit events
window.addEventListener('scroll', () => {
  events.emit('scroll', window.scrollY);
});

searchInput.addEventListener('input', (e) => {
  events.emit('search', e.target.value);
});
```

## Best Practices

### 1. Parameter Validation

```javascript
// ❌ No validation
function processItem(item, options) {
  return item[options.field];
}

// ✅ Validate parameters
function processItem(item, options = {}) {
  if (!item || typeof item !== 'object') {
    throw new Error('Item must be an object');
  }

  if (options.field && typeof options.field !== 'string') {
    throw new Error('Field must be a string');
  }

  return item[options.field];
}
```

### 2. Error Handling

```javascript
// ❌ Swallow errors
async function fetchData() {
  try {
    return await api.getData();
  } catch (error) {
    return null;
  }
}

// ✅ Handle errors appropriately
async function fetchData() {
  try {
    return await retry(() => api.getData(), {
      attempts: 3,
      retryIf: (error) => error.code === 'ETIMEDOUT',
    });
  } catch (error) {
    logger.error('Failed to fetch data:', error);
    throw new Error(`Data fetch failed: ${error.message}`);
  }
}
```

### 3. Avoid Mutations

```javascript
// ❌ Mutate original objects
function updateUser(user, updates) {
  Object.assign(user, updates);
  return user;
}

// ✅ Return new objects
function updateUser(user, updates) {
  return { ...user, ...updates };
}

// ✅ Deep clone for nested updates
function updateUserProfile(user, profileUpdates) {
  const updated = clone(user);
  updated.profile = { ...updated.profile, ...profileUpdates };
  return updated;
}
```

### 4. Use Appropriate Functions

```javascript
// ❌ Wrong function for the job
let results = [];
for (const item of items) {
  results.push(await processItem(item));
}

// ✅ Use parallel processing when possible
const results = await mapAsync(items, processItem, 5);

// ❌ Manual debouncing
let timeout;
function handleInput(value) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    search(value);
  }, 300);
}

// ✅ Use debounce utility
const handleInput = debounce((value) => {
  search(value);
}, 300);
```

### 5. Memory Management

```javascript
// ❌ Memory leaks with event listeners
const handlers = [];
elements.forEach((el) => {
  const handler = () => processElement(el);
  handlers.push(handler);
  el.addEventListener('click', handler);
});

// ✅ Clean up properly
const handlers = new WeakMap();
elements.forEach((el) => {
  const handler = throttle(() => processElement(el), 100);
  handlers.set(el, handler);
  el.addEventListener('click', handler);
});

// Cleanup function
function cleanup() {
  elements.forEach((el) => {
    const handler = handlers.get(el);
    if (handler) {
      handler.cancel();
      el.removeEventListener('click', handler);
    }
  });
}
```
