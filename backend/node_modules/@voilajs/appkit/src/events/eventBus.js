/**
 * @voilajs/appkit - Event bus implementation
 * @module @voilajs/appkit/events/eventBus
 */

import { EventStore } from './stores/base.js';
import { MemoryStore } from './stores/memory.js';

// Singleton event bus instance
let eventStore = null;
const listeners = new Map();
const asyncListeners = new Map();

/**
 * Initializes the event bus with a custom store
 * @param {EventStore} store - Custom event store implementation
 * @throws {Error} If store doesn't implement EventStore interface
 */
export function setEventStore(store) {
  if (!(store instanceof EventStore)) {
    throw new Error('Store must implement EventStore interface');
  }
  eventStore = store;
}

/**
 * Gets the current event store, initializing with default if needed
 * @returns {EventStore} The current event store
 */
function getEventStore() {
  if (!eventStore) {
    eventStore = new MemoryStore();
  }
  return eventStore;
}

/**
 * Subscribes to an event
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function
 * @returns {Function} Unsubscribe function
 */
export function subscribe(event, callback) {
  if (!event || typeof event !== 'string') {
    throw new Error('Event name must be a non-empty string');
  }

  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }

  listeners.get(event).add(callback);

  // Return unsubscribe function
  return () => unsubscribe(event, callback);
}

/**
 * Subscribes to an event with an async handler
 * @param {string} event - Event name
 * @param {Function} callback - Async event handler function
 * @returns {Function} Unsubscribe function
 */
export function subscribeAsync(event, callback) {
  if (!event || typeof event !== 'string') {
    throw new Error('Event name must be a non-empty string');
  }

  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }

  if (!asyncListeners.has(event)) {
    asyncListeners.set(event, new Set());
  }

  asyncListeners.get(event).add(callback);

  // Return unsubscribe function
  return () => unsubscribeAsync(event, callback);
}

/**
 * Unsubscribes from an event
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function to remove
 */
export function unsubscribe(event, callback) {
  if (!listeners.has(event)) {
    return;
  }

  const eventListeners = listeners.get(event);
  eventListeners.delete(callback);

  // Clean up empty listener sets
  if (eventListeners.size === 0) {
    listeners.delete(event);
  }
}

/**
 * Unsubscribes from an async event
 * @param {string} event - Event name
 * @param {Function} callback - Async event handler function to remove
 */
export function unsubscribeAsync(event, callback) {
  if (!asyncListeners.has(event)) {
    return;
  }

  const eventListeners = asyncListeners.get(event);
  eventListeners.delete(callback);

  // Clean up empty listener sets
  if (eventListeners.size === 0) {
    asyncListeners.delete(event);
  }
}

/**
 * Generates a universally unique identifier
 * @returns {string} UUID v4 format
 */
function generateUUID() {
  // Implementation of RFC4122 compliant UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Publishes an event
 * @param {string} event - Event name
 * @param {any} data - Event data
 * @returns {string} Event ID
 */
export function publish(event, data) {
  if (!event || typeof event !== 'string') {
    throw new Error('Event name must be a non-empty string');
  }

  const eventId = generateUUID();

  // Store event in history
  const store = getEventStore();
  const eventRecord = {
    event,
    data,
    timestamp: new Date(),
    id: eventId,
  };

  store.addEvent(eventRecord);

  // Notify all synchronous listeners
  if (listeners.has(event)) {
    const eventListeners = listeners.get(event);
    eventListeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  // Notify wildcard listeners
  if (listeners.has('*')) {
    const wildcardListeners = listeners.get('*');
    wildcardListeners.forEach((callback) => {
      try {
        callback({ event, data });
      } catch (error) {
        console.error(`Error in wildcard event handler:`, error);
      }
    });
  }

  // Notify async listeners (don't await them)
  if (asyncListeners.has(event)) {
    const eventAsyncListeners = asyncListeners.get(event);
    eventAsyncListeners.forEach((callback) => {
      Promise.resolve()
        .then(() => callback(data))
        .catch((error) => {
          console.error(`Error in async event handler for "${event}":`, error);
        });
    });
  }

  // Notify async wildcard listeners
  if (asyncListeners.has('*')) {
    const wildcardAsyncListeners = asyncListeners.get('*');
    wildcardAsyncListeners.forEach((callback) => {
      Promise.resolve()
        .then(() => callback({ event, data }))
        .catch((error) => {
          console.error(`Error in async wildcard event handler:`, error);
        });
    });
  }

  return eventId;
}

/**
 * Publishes multiple events at once
 * @param {Array<{event: string, data: any}>} events - Array of events
 * @returns {Array<string>} Array of event IDs
 */
export function publishBatch(events) {
  if (!Array.isArray(events)) {
    throw new Error('Events must be an array');
  }

  return events.map(({ event, data }) => publish(event, data));
}

/**
 * Gets event history
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.event] - Filter by event name
 * @param {Date} [filters.since] - Filter events since date
 * @param {number} [filters.limit] - Limit number of events returned
 * @returns {Array<Object>} Array of event records
 */
export function getEventHistory(filters = {}) {
  const store = getEventStore();
  let events = store.getEvents();

  // Apply filters
  if (filters.event) {
    events = events.filter((e) => e.event === filters.event);
  }

  if (filters.since && filters.since instanceof Date) {
    events = events.filter((e) => e.timestamp >= filters.since);
  }

  // Apply limit if specified
  if (typeof filters.limit === 'number' && filters.limit > 0) {
    events = events.slice(-filters.limit);
  }

  return events;
}

/**
 * Clears event history
 */
export function clearEventHistory() {
  const store = getEventStore();
  store.clearEvents();
}

/**
 * Waits for a specific event to occur
 * @param {string} eventName - Event to wait for
 * @param {Object} [options] - Options
 * @param {number} [options.timeout] - Timeout in milliseconds
 * @param {Function} [options.filter] - Filter function for event data
 * @returns {Promise<any>} Event data when it occurs
 */
export function waitForEvent(eventName, options = {}) {
  return new Promise((resolve, reject) => {
    let timeoutId;
    const unsubscribeFn = subscribe(eventName, (data) => {
      // If filter is specified, check if data matches
      if (options.filter && !options.filter(data)) {
        return; // Skip this event if it doesn't match filter
      }

      // Clear timeout and unsubscribe
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribeFn();
      resolve(data);
    });

    // Set timeout if specified
    if (options.timeout) {
      timeoutId = setTimeout(() => {
        unsubscribeFn();
        reject(new Error(`Timeout waiting for event "${eventName}"`));
      }, options.timeout);
    }
  });
}
