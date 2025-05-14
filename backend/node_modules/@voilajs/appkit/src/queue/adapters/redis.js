/**
 * @voilajs/appkit - Redis queue adapter (uses Bull)
 * @module @voilajs/appkit/queue/adapters/redis
 */

import Bull from 'bull';
import { QueueAdapter } from './base.js';

/**
 * Redis queue adapter using Bull
 * @extends QueueAdapter
 */
export class RedisAdapter extends QueueAdapter {
  constructor(config = {}) {
    super(config);
    this.queues = new Map();
    this.redisConfig = config.redis || 'redis://localhost:6379';
    this.defaultJobOptions = config.defaultJobOptions || {};
  }

  /**
   * Gets or creates a Bull queue
   * @private
   * @param {string} name - Queue name
   * @returns {Bull.Queue} Bull queue instance
   */
  getOrCreateQueue(name) {
    if (!this.queues.has(name)) {
      const queue = new Bull(name, this.redisConfig);
      this.queues.set(name, queue);
    }
    return this.queues.get(name);
  }

  /**
   * Adds a job to a queue
   * @param {string} queue - Queue name
   * @param {Object} data - Job data
   * @param {Object} [options] - Job options
   * @returns {Promise<Object>} Job info
   */
  async addJob(queue, data, options = {}) {
    const bullQueue = this.getOrCreateQueue(queue);

    const jobOptions = {
      ...this.defaultJobOptions,
      ...options,
      priority: options.priority || 0,
      delay: options.delay || 0,
      attempts: options.maxAttempts || 3,
      backoff: options.backoff || {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: options.removeOnComplete !== false,
      removeOnFail: options.removeOnFail !== false,
    };

    const job = await bullQueue.add(data, jobOptions);

    return {
      id: job.id.toString(),
      queue,
      status: await job.getState(),
    };
  }

  /**
   * Processes jobs from a queue
   * @param {string} queue - Queue name
   * @param {Function} processor - Job processor function
   * @param {Object} [options] - Processing options
   */
  async processJobs(queue, processor, options = {}) {
    const bullQueue = this.getOrCreateQueue(queue);
    const concurrency = options.concurrency || 1;

    bullQueue.process(concurrency, async (job) => {
      // Wrap Bull job to match our interface
      const wrappedJob = {
        id: job.id.toString(),
        queue,
        data: job.data,
        options: job.opts,
        attempts: job.attemptsMade,
      };

      try {
        const result = await processor(wrappedJob);
        return result;
      } catch (error) {
        throw error;
      }
    });

    // Set up event handlers
    bullQueue.on('completed', (job, result) => {
      if (options.onCompleted) {
        options.onCompleted(job.id.toString(), result);
      }
    });

    bullQueue.on('failed', (job, error) => {
      if (options.onFailed) {
        options.onFailed(job.id.toString(), error);
      }
    });

    bullQueue.on('progress', (job, progress) => {
      if (options.onProgress) {
        options.onProgress(job.id.toString(), progress);
      }
    });
  }

  /**
   * Gets a specific job by ID
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job data
   */
  async getJob(queue, jobId) {
    const bullQueue = this.getOrCreateQueue(queue);
    const job = await bullQueue.getJob(jobId);

    if (!job) return null;

    return {
      id: job.id.toString(),
      queue,
      data: job.data,
      options: job.opts,
      status: await job.getState(),
      attempts: job.attemptsMade,
      progress: job.progress(),
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
      completedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      failedReason: job.failedReason,
    };
  }

  /**
   * Updates a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @param {Object} update - Update data
   * @returns {Promise<boolean>} Success status
   */
  async updateJob(queue, jobId, update) {
    const bullQueue = this.getOrCreateQueue(queue);
    const job = await bullQueue.getJob(jobId);

    if (!job) return false;

    // Update progress if provided
    if (update.progress !== undefined) {
      await job.progress(update.progress);
    }

    // Update data if provided
    if (update.data) {
      await job.update(update.data);
    }

    return true;
  }

  /**
   * Removes a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async removeJob(queue, jobId) {
    const bullQueue = this.getOrCreateQueue(queue);
    const job = await bullQueue.getJob(jobId);

    if (!job) return false;

    await job.remove();
    return true;
  }

  /**
   * Gets queue information
   * @param {string} queue - Queue name
   * @returns {Promise<Object>} Queue statistics
   */
  async getQueueInfo(queue) {
    const bullQueue = this.getOrCreateQueue(queue);

    const [waiting, active, completed, failed, delayed, paused] =
      await Promise.all([
        bullQueue.getWaitingCount(),
        bullQueue.getActiveCount(),
        bullQueue.getCompletedCount(),
        bullQueue.getFailedCount(),
        bullQueue.getDelayedCount(),
        bullQueue.getPausedCount(),
      ]);

    return {
      name: queue,
      total: waiting + active + completed + failed + delayed + paused,
      pending: waiting,
      processing: active,
      completed,
      failed,
      delayed,
      paused,
    };
  }

  /**
   * Clears a queue
   * @param {string} queue - Queue name
   * @returns {Promise<boolean>} Success status
   */
  async clearQueue(queue) {
    const bullQueue = this.getOrCreateQueue(queue);

    await bullQueue.empty();
    return true;
  }

  /**
   * Stops processing jobs
   * @returns {Promise<void>}
   */
  async stop() {
    const promises = [];

    for (const [name, queue] of this.queues.entries()) {
      promises.push(queue.close());
    }

    await Promise.all(promises);
    this.queues.clear();
  }

  /**
   * Additional Bull-specific methods
   */

  /**
   * Pauses a queue
   * @param {string} queue - Queue name
   * @returns {Promise<void>}
   */
  async pauseQueue(queue) {
    const bullQueue = this.getOrCreateQueue(queue);
    await bullQueue.pause();
  }

  /**
   * Resumes a queue
   * @param {string} queue - Queue name
   * @returns {Promise<void>}
   */
  async resumeQueue(queue) {
    const bullQueue = this.getOrCreateQueue(queue);
    await bullQueue.resume();
  }

  /**
   * Gets failed jobs
   * @param {string} queue - Queue name
   * @param {number} [start=0] - Start index
   * @param {number} [end=-1] - End index
   * @returns {Promise<Array>} Failed jobs
   */
  async getFailedJobs(queue, start = 0, end = -1) {
    const bullQueue = this.getOrCreateQueue(queue);
    const jobs = await bullQueue.getFailed(start, end);

    return jobs.map((job) => ({
      id: job.id.toString(),
      data: job.data,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
    }));
  }

  /**
   * Retries a failed job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async retryJob(queue, jobId) {
    const bullQueue = this.getOrCreateQueue(queue);
    const job = await bullQueue.getJob(jobId);

    if (!job) return false;

    await job.retry();
    return true;
  }
}
