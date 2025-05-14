/**
 * @voilajs/appkit - Base event store interface
 * @module @voilajs/appkit/events/stores/base
 */
/**
 * Base event store interface
 * @abstract
 */
export class EventStore {
    /**
     * Adds event to store
     * @abstract
     * @param {Object} event - Event record
     */
    addEvent(event: any): void;
    /**
     * Gets all events
     * @abstract
     * @returns {Array<Object>} Array of events
     */
    getEvents(): Array<any>;
    /**
     * Clears all events
     * @abstract
     */
    clearEvents(): void;
    /**
     * Gets events count
     * @returns {number} Number of events
     */
    getCount(): number;
}
