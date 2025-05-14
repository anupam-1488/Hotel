/**
 * @voilajs/appkit - Memory queue adapter
 * @module @voilajs/appkit/queue/adapters/memory
 */

import { QueueAdapter } from './base.js';
import crypto from 'crypto';

/**
 * In-memory queue adapter
 * @extends QueueAdapter
 */
export class MemoryAdapter extends QueueAdapter {
  constructor(config = {}) {
    super(config);
    this.queues = new Map();
    this.processors = new Map();
    this.processing = new Map();
    this.jobCounter = 0;
  }

  /**
   * Adds a job to a queue
   * @param {string} queue - Queue name
   * @param {Object} data - Job data
   * @param {Object} [options] - Job options
   * @returns {Promise<Object>} Job info
   */
  async addJob(queue, data, options = {}) {
    if (!this.queues.has(queue)) {
      this.queues.set(queue, []);
    }

    const job = {
      id: this.generateJobId(),
      queue,
      data,
      options,
      status: 'pending',
      createdAt: new Date(),
      attempts: 0,
      priority: options.priority || 0,
      delay: options.delay || 0,
    };

    // Handle delayed jobs
    if (job.delay > 0) {
      job.status = 'delayed';
      job.processAfter = new Date(Date.now() + job.delay);
      setTimeout(() => {
        if (job.status === 'delayed') {
          job.status = 'pending';
          this.processNextJob(queue);
        }
      }, job.delay);
    }

    this.queues.get(queue).push(job);

    // Sort by priority
    this.queues.get(queue).sort((a, b) => b.priority - a.priority);

    // Trigger processing
    this.processNextJob(queue);

    return {
      id: job.id,
      queue: job.queue,
      status: job.status,
    };
  }

  /**
   * Processes jobs from a queue
   * @param {string} queue - Queue name
   * @param {Function} processor - Job processor function
   * @param {Object} [options] - Processing options
   */
  async processJobs(queue, processor, options = {}) {
    const concurrency = options.concurrency || 1;

    this.processors.set(queue, {
      processor,
      concurrency,
      options,
    });

    // Start processing
    for (let i = 0; i < concurrency; i++) {
      this.processNextJob(queue);
    }
  }

  /**
   * Gets a specific job by ID
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job data
   */
  async getJob(queue, jobId) {
    const jobs = this.queues.get(queue) || [];
    return jobs.find((job) => job.id === jobId);
  }

  /**
   * Updates a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @param {Object} update - Update data
   * @returns {Promise<boolean>} Success status
   */
  async updateJob(queue, jobId, update) {
    const job = await this.getJob(queue, jobId);
    if (!job) return false;

    Object.assign(job, update);
    return true;
  }

  /**
   * Removes a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async removeJob(queue, jobId) {
    const jobs = this.queues.get(queue) || [];
    const index = jobs.findIndex((job) => job.id === jobId);

    if (index === -1) return false;

    jobs.splice(index, 1);
    return true;
  }

  /**
   * Gets queue information
   * @param {string} queue - Queue name
   * @returns {Promise<Object>} Queue statistics
   */
  async getQueueInfo(queue) {
    const jobs = this.queues.get(queue) || [];

    const stats = {
      name: queue,
      total: jobs.length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      processing: jobs.filter((j) => j.status === 'processing').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      delayed: jobs.filter((j) => j.status === 'delayed').length,
    };

    return stats;
  }

  /**
   * Clears a queue
   * @param {string} queue - Queue name
   * @returns {Promise<boolean>} Success status
   */
  async clearQueue(queue) {
    this.queues.set(queue, []);
    return true;
  }

  /**
   * Stops processing jobs
   * @returns {Promise<void>}
   */
  async stop() {
    this.processors.clear();
  }

  /**
   * Process next job in queue
   * @private
   * @param {string} queue - Queue name
   */
  async processNextJob(queue) {
    const processorConfig = this.processors.get(queue);
    if (!processorConfig) return;

    const { processor, concurrency, options } = processorConfig;

    // Check concurrency limit
    const processing = this.processing.get(queue) || 0;
    if (processing >= concurrency) return;

    // Get next job
    const jobs = this.queues.get(queue) || [];
    const job = jobs.find(
      (j) =>
        j.status === 'pending' &&
        (!j.processAfter || j.processAfter <= new Date())
    );

    if (!job) return;

    // Mark as processing
    job.status = 'processing';
    job.startedAt = new Date();
    job.attempts++;

    this.processing.set(queue, processing + 1);

    try {
      // Process job
      const result = await processor(job);

      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;

      // Remove completed jobs if configured
      if (options.removeOnComplete) {
        await this.removeJob(queue, job.id);
      }
    } catch (error) {
      job.status = 'failed';
      job.failedAt = new Date();
      job.error = error.message;

      // Handle retries
      if (job.attempts < (job.options.maxAttempts || 3)) {
        job.status = 'pending';
        job.delay = this.calculateRetryDelay(job.attempts);
        job.processAfter = new Date(Date.now() + job.delay);
      }
    } finally {
      this.processing.set(queue, processing - 1);

      // Process next job
      setImmediate(() => this.processNextJob(queue));
    }
  }

  /**
   * Generates a unique job ID
   * @private
   * @returns {string} Job ID
   */
  generateJobId() {
    return `job_${++this.jobCounter}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Calculates retry delay
   * @private
   * @param {number} attempt - Attempt number
   * @returns {number} Delay in milliseconds
   */
  calculateRetryDelay(attempt) {
    // Exponential backoff
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }
}
