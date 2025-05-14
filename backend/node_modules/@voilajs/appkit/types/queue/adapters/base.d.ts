/**
 * @voilajs/appkit - Base queue adapter
 * @module @voilajs/appkit/queue/adapters/base
 */
/**
 * Base queue adapter interface
 */
export class QueueAdapter {
    constructor(config?: {});
    config: {};
    /**
     * Initializes the queue adapter
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * Adds a job to a queue
     * @param {string} queue - Queue name
     * @param {Object} data - Job data
     * @param {Object} [options] - Job options
     * @returns {Promise<Object>} Job info
     */
    addJob(queue: string, data: any, options?: any): Promise<any>;
    /**
     * Processes jobs from a queue
     * @param {string} queue - Queue name
     * @param {Function} processor - Job processor function
     * @param {Object} [options] - Processing options
     * @returns {void}
     */
    processJobs(queue: string, processor: Function, options?: any): void;
    /**
     * Gets a specific job by ID
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @returns {Promise<Object>} Job data
     */
    getJob(queue: string, jobId: string): Promise<any>;
    /**
     * Updates a job
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @param {Object} update - Update data
     * @returns {Promise<boolean>} Success status
     */
    updateJob(queue: string, jobId: string, update: any): Promise<boolean>;
    /**
     * Removes a job
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @returns {Promise<boolean>} Success status
     */
    removeJob(queue: string, jobId: string): Promise<boolean>;
    /**
     * Gets queue information
     * @param {string} queue - Queue name
     * @returns {Promise<Object>} Queue statistics
     */
    getQueueInfo(queue: string): Promise<any>;
    /**
     * Clears a queue
     * @param {string} queue - Queue name
     * @returns {Promise<boolean>} Success status
     */
    clearQueue(queue: string): Promise<boolean>;
    /**
     * Stops processing jobs
     * @returns {Promise<void>}
     */
    stop(): Promise<void>;
}
