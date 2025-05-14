/**
 * Redis queue adapter using Bull
 * @extends QueueAdapter
 */
export class RedisAdapter extends QueueAdapter {
    queues: Map<any, any>;
    redisConfig: any;
    defaultJobOptions: any;
    /**
     * Gets or creates a Bull queue
     * @private
     * @param {string} name - Queue name
     * @returns {Bull.Queue} Bull queue instance
     */
    private getOrCreateQueue;
    /**
     * Processes jobs from a queue
     * @param {string} queue - Queue name
     * @param {Function} processor - Job processor function
     * @param {Object} [options] - Processing options
     */
    processJobs(queue: string, processor: Function, options?: any): Promise<void>;
    /**
     * Additional Bull-specific methods
     */
    /**
     * Pauses a queue
     * @param {string} queue - Queue name
     * @returns {Promise<void>}
     */
    pauseQueue(queue: string): Promise<void>;
    /**
     * Resumes a queue
     * @param {string} queue - Queue name
     * @returns {Promise<void>}
     */
    resumeQueue(queue: string): Promise<void>;
    /**
     * Gets failed jobs
     * @param {string} queue - Queue name
     * @param {number} [start=0] - Start index
     * @param {number} [end=-1] - End index
     * @returns {Promise<Array>} Failed jobs
     */
    getFailedJobs(queue: string, start?: number, end?: number): Promise<any[]>;
    /**
     * Retries a failed job
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @returns {Promise<boolean>} Success status
     */
    retryJob(queue: string, jobId: string): Promise<boolean>;
}
import { QueueAdapter } from './base.js';
