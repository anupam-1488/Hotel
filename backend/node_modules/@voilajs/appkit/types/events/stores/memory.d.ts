/**
 * In-memory event store implementation
 * @extends EventStore
 */
export class MemoryStore extends EventStore {
    constructor(options?: {});
    events: any[];
    maxEvents: any;
    /**
     * Gets events by event name
     * @param {string} eventName - Event name to filter by
     * @returns {Array<Object>} Filtered events
     */
    getEventsByName(eventName: string): Array<any>;
    /**
     * Gets events since timestamp
     * @param {Date} since - Date to filter from
     * @returns {Array<Object>} Filtered events
     */
    getEventsSince(since: Date): Array<any>;
    /**
     * Gets recent events
     * @param {number} count - Number of events to return
     * @returns {Array<Object>} Recent events
     */
    getRecentEvents(count?: number): Array<any>;
}
import { EventStore } from './base.js';
