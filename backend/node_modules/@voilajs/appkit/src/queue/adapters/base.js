/**
 * @voilajs/appkit - Base queue adapter
 * @module @voilajs/appkit/queue/adapters/base
 */

/**
 * Base queue adapter interface
 */
export class QueueAdapter {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Initializes the queue adapter
   * @returns {Promise<void>}
   */
  async initialize() {
    // Override in subclasses if needed
  }

  /**
   * Adds a job to a queue
   * @param {string} queue - Queue name
   * @param {Object} data - Job data
   * @param {Object} [options] - Job options
   * @returns {Promise<Object>} Job info
   */
  async addJob(queue, data, options = {}) {
    throw new Error('addJob() must be implemented by subclass');
  }

  /**
   * Processes jobs from a queue
   * @param {string} queue - Queue name
   * @param {Function} processor - Job processor function
   * @param {Object} [options] - Processing options
   * @returns {void}
   */
  async processJobs(queue, processor, options = {}) {
    throw new Error('processJobs() must be implemented by subclass');
  }

  /**
   * Gets a specific job by ID
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job data
   */
  async getJob(queue, jobId) {
    throw new Error('getJob() must be implemented by subclass');
  }

  /**
   * Updates a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @param {Object} update - Update data
   * @returns {Promise<boolean>} Success status
   */
  async updateJob(queue, jobId, update) {
    throw new Error('updateJob() must be implemented by subclass');
  }

  /**
   * Removes a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async removeJob(queue, jobId) {
    throw new Error('removeJob() must be implemented by subclass');
  }

  /**
   * Gets queue information
   * @param {string} queue - Queue name
   * @returns {Promise<Object>} Queue statistics
   */
  async getQueueInfo(queue) {
    throw new Error('getQueueInfo() must be implemented by subclass');
  }

  /**
   * Clears a queue
   * @param {string} queue - Queue name
   * @returns {Promise<boolean>} Success status
   */
  async clearQueue(queue) {
    throw new Error('clearQueue() must be implemented by subclass');
  }

  /**
   * Stops processing jobs
   * @returns {Promise<void>}
   */
  async stop() {
    throw new Error('stop() must be implemented by subclass');
  }
}
