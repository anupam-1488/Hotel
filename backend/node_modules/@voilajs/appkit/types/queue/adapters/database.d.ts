/**
 * Database queue adapter (PostgreSQL/MySQL)
 * @extends QueueAdapter
 */
export class DatabaseAdapter extends QueueAdapter {
    dbType: any;
    connectionString: any;
    connection: any;
    processors: Map<any, any>;
    processing: boolean;
    pollInterval: any;
    /**
     * Creates the jobs table
     * @private
     * @returns {Promise<void>}
     */
    private createJobsTable;
    /**
     * Executes a query
     * @private
     * @param {string} sql - SQL query
     * @param {Array} [params] - Query parameters
     * @returns {Promise<Object>} Query result
     */
    private query;
    /**
     * Processes jobs from a queue
     * @param {string} queue - Queue name
     * @param {Function} processor - Job processor function
     * @param {Object} [options] - Processing options
     */
    processJobs(queue: string, processor: Function, options?: any): Promise<void>;
    /**
     * Starts the processing loop
     * @private
     */
    private startProcessing;
    /**
     * Main processing loop
     * @private
     */
    private processLoop;
    /**
     * Processes the next batch of jobs
     * @private
     */
    private processNextBatch;
    /**
     * Gets the next available jobs
     * @private
     * @param {string} queue - Queue name
     * @param {number} limit - Number of jobs to get
     * @returns {Promise<Array>} Jobs
     */
    private getNextJobs;
    /**
     * Processes a single job
     * @private
     * @param {Object} job - Job data
     * @param {Function} processor - Job processor function
     */
    private processJob;
    /**
     * Formats a job from database row
     * @private
     * @param {Object} row - Database row
     * @returns {Object} Formatted job
     */
    private formatJob;
    /**
     * Calculates retry delay
     * @private
     * @param {number} attempts - Current attempt count
     * @param {Object} options - Job options
     * @returns {number} Delay in milliseconds
     */
    private calculateRetryDelay;
    /**
     * Additional database-specific methods
     */
    /**
     * Gets failed jobs
     * @param {string} queue - Queue name
     * @param {number} [limit=10] - Number of jobs to retrieve
     * @returns {Promise<Array>} Failed jobs
     */
    getFailedJobs(queue: string, limit?: number): Promise<any[]>;
    /**
     * Retries a failed job
     * @param {string} queue - Queue name
     * @param {string} jobId - Job ID
     * @returns {Promise<boolean>} Success status
     */
    retryJob(queue: string, jobId: string): Promise<boolean>;
    /**
     * Gets jobs by status
     * @param {string} queue - Queue name
     * @param {string} status - Job status
     * @param {number} [limit=10] - Number of jobs to retrieve
     * @returns {Promise<Array>} Jobs
     */
    getJobsByStatus(queue: string, status: string, limit?: number): Promise<any[]>;
    /**
     * Cleans up old completed jobs
     * @param {string} queue - Queue name
     * @param {number} [daysOld=7] - Age of jobs to remove
     * @returns {Promise<number>} Number of jobs removed
     */
    cleanupOldJobs(queue: string, daysOld?: number): Promise<number>;
}
import { QueueAdapter } from './base.js';
