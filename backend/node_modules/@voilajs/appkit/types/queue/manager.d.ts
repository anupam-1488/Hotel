/**
 * Initializes queue adapter
 * @param {string} adapter - Adapter type ('memory', 'redis', 'database')
 * @param {Object} config - Adapter configuration
 * @returns {Promise<QueueAdapter>} Queue adapter instance
 * @throws {Error} If adapter is already initialized or invalid
 */
export function initQueue(adapter: string, config?: any): Promise<QueueAdapter>;
/**
 * Gets current queue instance
 * @returns {QueueAdapter} Queue adapter instance
 * @throws {Error} If queue is not initialized
 */
export function getQueue(): QueueAdapter;
