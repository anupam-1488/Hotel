/**
 * In-memory queue adapter
 * @extends QueueAdapter
 */
export class MemoryAdapter extends QueueAdapter {
    queues: Map<any, any>;
    processors: Map<any, any>;
    processing: Map<any, any>;
    jobCounter: number;
    /**
     * Processes jobs from a queue
     * @param {string} queue - Queue name
     * @param {Function} processor - Job processor function
     * @param {Object} [options] - Processing options
     */
    processJobs(queue: string, processor: Function, options?: any): Promise<void>;
    /**
     * Process next job in queue
     * @private
     * @param {string} queue - Queue name
     */
    private processNextJob;
    /**
     * Generates a unique job ID
     * @private
     * @returns {string} Job ID
     */
    private generateJobId;
    /**
     * Calculates retry delay
     * @private
     * @param {number} attempt - Attempt number
     * @returns {number} Delay in milliseconds
     */
    private calculateRetryDelay;
}
import { QueueAdapter } from './base.js';
