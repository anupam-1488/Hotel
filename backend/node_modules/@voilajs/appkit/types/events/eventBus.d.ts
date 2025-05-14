/**
 * Subscribes to an event
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function
 * @returns {Function} Unsubscribe function
 */
export function subscribe(event: string, callback: Function): Function;
/**
 * Unsubscribes from an event
 * @param {string} event - Event name
 * @param {Function} callback - Event handler function to remove
 */
export function unsubscribe(event: string, callback: Function): void;
/**
 * Publishes an event
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export function publish(event: string, data: any): void;
/**
 * Gets event history
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.event] - Filter by event name
 * @param {Date} [filters.since] - Filter events since date
 * @returns {Array<Object>} Array of event records
 */
export function getEventHistory(filters?: {
    event?: string;
    since?: Date;
}): Array<any>;
/**
 * Clears event history
 */
export function clearEventHistory(): void;
