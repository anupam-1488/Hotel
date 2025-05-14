/**
 * @voilajs/appkit - In-memory event store
 * @module @voilajs/appkit/events/stores/memory
 */

import { EventStore } from './base.js';

/**
 * In-memory event store implementation
 * @extends EventStore
 */
export class MemoryStore extends EventStore {
  /**
   * Creates a new in-memory store
   * @param {Object} options - Store options
   * @param {number} [options.maxEvents=10000] - Maximum events to store
   * @param {number} [options.maxEventSize=1048576] - Maximum event size in bytes (1MB default)
   */
  constructor(options = {}) {
    super();
    this.events = [];
    this.maxEvents = options.maxEvents || 10000;
    this.maxEventSize = options.maxEventSize || 1048576; // 1MB
  }

  /**
   * Adds event to store
   * @param {Object} event - Event record
   * @returns {string} Event ID
   * @throws {Error} If event is invalid or too large
   */
  addEvent(event) {
    // Validate event
    if (!this.validateEvent(event)) {
      throw new Error('Invalid event structure');
    }

    // Check event size
    const eventSize = JSON.stringify(event).length;
    if (eventSize > this.maxEventSize) {
      throw new Error(
        `Event size exceeds maximum allowed (${eventSize} > ${this.maxEventSize})`
      );
    }

    this.events.push(event);

    // Truncate to max events limit
    if (this.events.length > this.maxEvents) {
      // Remove oldest events
      this.events = this.events.slice(-this.maxEvents);
    }

    return event.id;
  }

  /**
   * Gets all events
   * @returns {Array<Object>} Array of events
   */
  getEvents() {
    return [...this.events];
  }

  /**
   * Clears all events
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Gets events by event name
   * @param {string} eventName - Event name to filter by
   * @returns {Array<Object>} Filtered events
   */
  getEventsByName(eventName) {
    return this.events.filter((event) => event.event === eventName);
  }

  /**
   * Gets events since timestamp
   * @param {Date} since - Date to filter from
   * @returns {Array<Object>} Filtered events
   */
  getEventsSince(since) {
    return this.events.filter((event) => event.timestamp >= since);
  }

  /**
   * Gets recent events
   * @param {number} count - Number of events to return
   * @returns {Array<Object>} Recent events
   */
  getRecentEvents(count = 10) {
    return this.events.slice(-count);
  }

  /**
   * Adds multiple events at once
   * @param {Array<Object>} events - Array of events to add
   * @returns {Array<string>} Array of added event IDs
   */
  addEvents(events) {
    if (!Array.isArray(events)) {
      throw new Error('Events must be an array');
    }

    return events.map((event) => this.addEvent(event));
  }
}
