# @voilajs/appkit - Events Module 🔔

[![npm version](https://img.shields.io/npm/v/@voilajs/appkit.svg)](https://www.npmjs.com/package/@voilajs/appkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Simple, flexible event bus for Node.js applications with subscription
> management and event history

The Events module of `@voilajs/appkit` provides a lightweight event system
implementing the publisher-subscriber pattern, with support for event history
tracking, asynchronous handlers, and customizable storage backends.

## Module Overview

The Events module provides everything you need for event-driven architecture:

| Feature                | What it does                        | Main functions                             |
| ---------------------- | ----------------------------------- | ------------------------------------------ |
| **Event Subscription** | Listen for specific events          | `subscribe()`, `subscribeAsync()`          |
| **Event Publishing**   | Broadcast events to subscribers     | `publish()`, `publishBatch()`              |
| **Event History**      | Track and query past events         | `getEventHistory()`, `clearEventHistory()` |
| **Async Support**      | Handle events with async operations | `subscribeAsync()`, `waitForEvent()`       |
| **Custom Storage**     | Customize how events are stored     | `setEventStore()`, `EventStore`            |
| **Wildcard Events**    | Listen for all events               | `subscribe('*', handler)`                  |

## 🚀 Features

- **📢 Event Publishing & Subscription** - Decouple components with a simple
  pub/sub system
- **📚 Event History** - Track and query past events for debugging and auditing
- **🔄 Asynchronous Support** - Handle events with non-blocking async functions
- **💾 Extensible Storage** - Customize how events are stored with pluggable
  backends
- **🌐 Framework Agnostic** - Works with any JavaScript framework or vanilla
  Node.js
- **⚡ Minimal API** - Simple, intuitive interface for quick integration

## 📦 Installation

```bash
npm install @voilajs/appkit
```

## 🏃‍♂️ Quick Start

```javascript
import { subscribe, publish, getEventHistory } from '@voilajs/appkit/events';

// Subscribe to events
const unsubscribe = subscribe('user:login', (user) => {
  console.log(`User logged in: ${user.name}`);
});

// Publish an event
publish('user:login', { id: '123', name: 'John Doe' });

// Access event history
const events = getEventHistory();
console.log(`Total events: ${events.length}`);
```

## 📖 Core Functions

### Event Subscription

These utilities allow you to register handlers for specific events.

| Function           | Purpose                          | When to use                         |
| ------------------ | -------------------------------- | ----------------------------------- |
| `subscribe()`      | Registers a handler for an event | UI updates, component communication |
| `subscribeAsync()` | Registers an async handler       | Database operations, API calls      |
| `unsubscribe()`    | Removes a handler                | Component cleanup, feature toggling |
| `waitForEvent()`   | Waits for an event to occur      | Sequential workflows, testing       |

```javascript
// Basic subscription
const unsubscribe = subscribe('notification:new', (data) => {
  showNotification(data.message);
});

// Async subscription
subscribeAsync('data:import', async (data) => {
  await processData(data);
  await saveToDatabase(data);
});

// Wait for an event with a timeout
try {
  const result = await waitForEvent('process:complete', { timeout: 5000 });
  console.log('Process completed:', result);
} catch (error) {
  console.error('Process timed out');
}
```

### Event Publishing

These functions broadcast events to all registered handlers.

| Function         | Purpose                           | When to use                 |
| ---------------- | --------------------------------- | --------------------------- |
| `publish()`      | Emits an event with optional data | State changes, user actions |
| `publishBatch()` | Emits multiple events at once     | Bulk operations, imports    |

```javascript
// Publish a simple event
publish('app:initialized');

// Publish with data
publish('user:created', {
  id: '123',
  name: 'Jane Smith',
  email: 'jane@example.com',
});

// Publish multiple events
publishBatch([
  { event: 'item:added', data: { id: 'a1', name: 'Item 1' } },
  { event: 'item:added', data: { id: 'a2', name: 'Item 2' } },
  { event: 'batch:complete', data: { count: 2 } },
]);
```

### Event History

These utilities let you work with past events.

| Function              | Purpose                 | When to use                    |
| --------------------- | ----------------------- | ------------------------------ |
| `getEventHistory()`   | Retrieves stored events | Debugging, auditing, analytics |
| `clearEventHistory()` | Removes all events      | Cleanup, resetting state       |

```javascript
// Get all events
const allEvents = getEventHistory();

// Get filtered events
const userEvents = getEventHistory({
  event: 'user:login',
  since: new Date('2023-06-01'),
  limit: 10,
});

// Clear history when needed
clearEventHistory();
```

### Store Management

These functions allow you to customize event storage.

| Function          | Purpose                   | When to use                      |
| ----------------- | ------------------------- | -------------------------------- |
| `setEventStore()` | Configures custom storage | Persistence, distributed systems |
| `EventStore`      | Base store interface      | Creating custom stores           |
| `MemoryStore`     | Default in-memory store   | Testing, simple applications     |

```javascript
import { setEventStore, MemoryStore } from '@voilajs/appkit/events';

// Configure a custom memory store
const store = new MemoryStore({
  maxEvents: 5000,
  maxEventSize: 1048576,
});

setEventStore(store);
```

## 🔧 Configuration Options

### Memory Store Options

```javascript
const store = new MemoryStore({
  // Maximum events to keep in memory (default: 10000)
  maxEvents: 5000,

  // Maximum size in bytes per event (default: 1MB)
  maxEventSize: 512000,
});
```

### Event History Filters

```javascript
const filteredEvents = getEventHistory({
  // Filter by event name
  event: 'user:action',

  // Only events since this date
  since: new Date('2023-07-15'),

  // Limit to most recent N events
  limit: 20,
});
```

### Wait For Event Options

```javascript
const result = await waitForEvent('import:complete', {
  // Timeout in milliseconds
  timeout: 10000,

  // Custom filter function
  filter: (data) => data.userId === '123',
});
```

## 💡 Common Use Cases

### User Interface Updates

```javascript
// Subscribe to state changes
subscribe('cart:updated', (cart) => {
  updateCartIcon(cart.items.length);
  updateTotalPrice(cart.totalPrice);
});

// Trigger updates when cart changes
function addToCart(product) {
  cart.items.push(product);
  cart.totalPrice += product.price;

  publish('cart:updated', cart);
}
```

### Service Communication

```javascript
// User service publishes events
function createUser(userData) {
  const user = database.createUser(userData);
  publish('user:created', user);
  return user;
}

// Email service subscribes to user events
subscribeAsync('user:created', async (user) => {
  await sendWelcomeEmail(user.email, user.name);
  publish('email:welcome-sent', { userId: user.id });
});
```

### Activity Logging

```javascript
// Log all events
subscribe('*', ({ event, data }) => {
  logger.info(`Event: ${event}`, data);
});

// Generate activity report
function getActivityReport() {
  const events = getEventHistory({
    since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
  });

  return {
    totalEvents: events.length,
    eventTypes: countEventTypes(events),
    mostActive: findMostActive(events),
  };
}
```

### Workflow Orchestration

```javascript
async function processOrder(order) {
  // Start the workflow
  publish('order:received', order);

  try {
    // Wait for verification step
    await waitForEvent('order:verified', {
      timeout: 30000,
      filter: (data) => data.orderId === order.id,
    });

    // Wait for payment step
    await waitForEvent('order:payment-complete', {
      timeout: 60000,
      filter: (data) => data.orderId === order.id,
    });

    // Complete the order
    publish('order:completed', {
      orderId: order.id,
      status: 'complete',
      timestamp: new Date(),
    });

    return { success: true };
  } catch (error) {
    publish('order:failed', {
      orderId: order.id,
      reason: error.message,
    });

    return { success: false, error: error.message };
  }
}
```

## 🤖 Code Generation with LLMs

You can use large language models (LLMs) like ChatGPT or Claude to generate code
for common event-driven patterns using the `@voilajs/appkit/events` module.
We've created a specialized
[PROMPT_REFERENCE.md](https://github.com/voilajs/appkit/blob/main/src/events/docs/PROMPT_REFERENCE.md)
document designed specifically for LLMs to understand the module's capabilities
and generate consistent, high-quality code.

### Sample Prompts to Try

#### Basic Event System

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/events/docs/PROMPT_REFERENCE.md and then create a simple notification system using @voilajs/appkit/events with the following features:
- Different notification types (info, warning, error)
- Ability to subscribe to specific notification types
- Notification history tracking
- A cleanup function to remove all subscriptions
```

#### Custom Event Store

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/events/docs/PROMPT_REFERENCE.md and then implement a persistent event store using @voilajs/appkit/events that:
- Extends the EventStore base class
- Stores events in localStorage for browser environments
- Includes proper error handling
- Limits the total number of stored events
```

#### Async Workflow

```
Please read the API reference at https://github.com/voilajs/appkit/blob/main/src/events/docs/PROMPT_REFERENCE.md and then implement an async file processing workflow using @voilajs/appkit/events with:
- Events for each processing stage (upload, validate, process, complete)
- Async handlers for time-consuming operations
- Timeout handling if processing takes too long
- Progress tracking and reporting
```

## 📋 Example Code

For complete, working examples, check our examples folder:

- [Basic Events](https://github.com/voilajs/appkit/blob/main/src/events/examples/01-basic-events.js) -
  Simple event subscription and publishing
- [Event History](https://github.com/voilajs/appkit/blob/main/src/events/examples/02-event-history.js) -
  Working with event history
- [Async Events](https://github.com/voilajs/appkit/blob/main/src/events/examples/03-async-events.js) -
  Using async event handlers
- [Custom Store](https://github.com/voilajs/appkit/blob/main/src/events/examples/04-custom-store.js) -
  Implementing a custom event store

## 🛡️ Best Practices

1. **Event Naming**: Use consistent naming patterns like `entity:action` (e.g.,
   `user:created`, `order:shipped`)
2. **Cleanup Subscriptions**: Always unsubscribe handlers when they're no longer
   needed to prevent memory leaks
3. **Error Handling**: Include try/catch blocks in event handlers to prevent one
   handler failure from affecting others
4. **Event Size**: Keep event payloads small and focused for better performance
5. **Wildcard Usage**: Use wildcard subscribers (`*`) sparingly as they process
   every event
6. **Storage Limits**: Configure appropriate `maxEvents` limits based on memory
   constraints
7. **Sensitive Data**: Avoid including sensitive information in events that
   shouldn't be widely accessible

## 📊 Performance Considerations

- **Handler Complexity**: Keep event handlers lightweight and fast when possible
- **Async Handlers**: Use `subscribeAsync` for time-consuming operations to
  avoid blocking
- **Batch Operations**: Use `publishBatch` when emitting multiple related events
- **Event History**: Clear event history periodically in long-running
  applications
- **Custom Stores**: Implement efficient storage for high-volume event systems

## 🔍 Error Handling

The module provides descriptive errors that should be caught and handled
appropriately:

```javascript
try {
  publish(''); // Invalid event name
} catch (error) {
  console.error('Publishing failed:', error.message);
  // Output: "Publishing failed: Event name must be a non-empty string"
}

try {
  await waitForEvent('data:ready', { timeout: 1000 });
} catch (error) {
  if (error.message.includes('Timeout')) {
    console.error('Operation timed out');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 📚 Documentation Links

- 📘
  [Developer REFERENCE](https://github.com/voilajs/appkit/blob/main/src/events/docs/DEVELOPER_REFERENCE.md) -
  Detailed implementation guide with examples
- 📗
  [API Reference](https://github.com/voilajs/appkit/blob/main/src/events/docs/API_REFERENCE.md) -
  Complete API documentation
- 📙
  [LLM Code Generation REFERENCE](https://github.com/voilajs/appkit/blob/main/src/events/docs/PROMPT_REFERENCE.md) -
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
