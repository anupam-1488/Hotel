/**
 * @voilajs/appkit - Event bus module
 * @module @voilajs/appkit/events
 */

// Main exports file
export {
  // Core functionality
  subscribe,
  unsubscribe,
  publish,
  publishBatch,
  getEventHistory,
  clearEventHistory,

  // Async support
  subscribeAsync,
  unsubscribeAsync,
  waitForEvent,

  // Store management
  setEventStore,
} from './eventBus.js';

// Export store implementations for extensibility
export { EventStore } from './stores/base.js';
export { MemoryStore } from './stores/memory.js';
