/**
 * @voilajs/appkit - Database queue adapter
 * @module @voilajs/appkit/queue/adapters/database
 */

import { QueueAdapter } from './base.js';
import pg from 'pg';
import mysql from 'mysql2/promise';

/**
 * Database queue adapter (PostgreSQL/MySQL)
 * @extends QueueAdapter
 */
export class DatabaseAdapter extends QueueAdapter {
  constructor(config = {}) {
    super(config);
    this.dbType = config.type || 'postgres';
    this.connectionString = config.connectionString;
    this.connection = null;
    this.processors = new Map();
    this.processing = false;
    this.pollInterval = config.pollInterval || 1000;
  }

  /**
   * Initializes the database connection and creates tables
   * @returns {Promise<void>}
   */
  async initialize() {
    // Connect to database
    if (this.dbType === 'postgres') {
      const { Pool } = pg;
      this.connection = new Pool({
        connectionString: this.connectionString,
      });
    } else if (this.dbType === 'mysql') {
      this.connection = await mysql.createPool(this.connectionString);
    } else {
      throw new Error(`Unsupported database type: ${this.dbType}`);
    }

    // Create jobs table if not exists
    await this.createJobsTable();
  }

  /**
   * Creates the jobs table
   * @private
   * @returns {Promise<void>}
   */
  async createJobsTable() {
    const sql =
      this.dbType === 'postgres'
        ? `
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        queue VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        options JSONB DEFAULT '{}',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        priority INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        process_after TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        failed_at TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_jobs_queue_status 
      ON jobs(queue, status, process_after, priority);
    `
        : `
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        queue VARCHAR(255) NOT NULL,
        data JSON NOT NULL,
        options JSON DEFAULT '{}',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        priority INT DEFAULT 0,
        attempts INT DEFAULT 0,
        max_attempts INT DEFAULT 3,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        process_after TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        failed_at TIMESTAMP NULL,
        INDEX idx_jobs_queue_status (queue, status, process_after, priority)
      );
    `;

    await this.query(sql);
  }

  /**
   * Executes a query
   * @private
   * @param {string} sql - SQL query
   * @param {Array} [params] - Query parameters
   * @returns {Promise<Object>} Query result
   */
  async query(sql, params = []) {
    if (this.dbType === 'postgres') {
      const result = await this.connection.query(sql, params);
      return result;
    } else {
      const [rows, fields] = await this.connection.execute(sql, params);
      return { rows, fields };
    }
  }

  /**
   * Adds a job to a queue
   * @param {string} queue - Queue name
   * @param {Object} data - Job data
   * @param {Object} [options] - Job options
   * @returns {Promise<Object>} Job info
   */
  async addJob(queue, data, options = {}) {
    const delay = options.delay || 0;
    const processAfter = new Date(Date.now() + delay);

    const sql =
      this.dbType === 'postgres'
        ? `
      INSERT INTO jobs (queue, data, options, priority, max_attempts, process_after)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, queue, status
    `
        : `
      INSERT INTO jobs (queue, data, options, priority, max_attempts, process_after)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      queue,
      JSON.stringify(data),
      JSON.stringify(options),
      options.priority || 0,
      options.maxAttempts || 3,
      processAfter,
    ];

    const result = await this.query(sql, params);

    let jobId;
    if (this.dbType === 'postgres') {
      jobId = result.rows[0].id;
    } else {
      jobId = result.rows.insertId;
    }

    // Trigger processing
    this.startProcessing();

    return {
      id: jobId.toString(),
      queue,
      status: 'pending',
    };
  }

  /**
   * Processes jobs from a queue
   * @param {string} queue - Queue name
   * @param {Function} processor - Job processor function
   * @param {Object} [options] - Processing options
   */
  async processJobs(queue, processor, options = {}) {
    this.processors.set(queue, {
      processor,
      concurrency: options.concurrency || 1,
      options,
    });

    this.startProcessing();
  }

  /**
   * Gets a specific job by ID
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Job data
   */
  async getJob(queue, jobId) {
    const sql = `
      SELECT * FROM jobs 
      WHERE queue = ? AND id = ?
    `;

    const result = await this.query(sql, [queue, parseInt(jobId)]);
    const job = result.rows[0];

    if (!job) return null;

    return this.formatJob(job);
  }

  /**
   * Updates a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @param {Object} update - Update data
   * @returns {Promise<boolean>} Success status
   */
  async updateJob(queue, jobId, update) {
    const sets = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(update).forEach(([key, value]) => {
      if (key === 'data') value = JSON.stringify(value);
      sets.push(
        `${key} = ${this.dbType === 'postgres' ? '$' + paramIndex++ : '?'}`
      );
      values.push(value);
    });

    values.push(queue, parseInt(jobId));

    const sql = `
      UPDATE jobs 
      SET ${sets.join(', ')}
      WHERE queue = ${this.dbType === 'postgres' ? '$' + paramIndex++ : '?'} 
      AND id = ${this.dbType === 'postgres' ? '$' + paramIndex : '?'}
    `;

    const result = await this.query(sql, values);
    return result.rows.length > 0;
  }

  /**
   * Removes a job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async removeJob(queue, jobId) {
    const sql = `
      DELETE FROM jobs 
      WHERE queue = ? AND id = ?
    `;

    const result = await this.query(sql, [queue, parseInt(jobId)]);
    return result.rows.length > 0;
  }

  /**
   * Gets queue information
   * @param {string} queue - Queue name
   * @returns {Promise<Object>} Queue statistics
   */
  async getQueueInfo(queue) {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' AND process_after > ${this.dbType === 'postgres' ? 'NOW()' : 'NOW()'} THEN 1 ELSE 0 END) as delayed
      FROM jobs
      WHERE queue = ?
    `;

    const result = await this.query(sql, [queue]);
    const stats = result.rows[0];

    return {
      name: queue,
      total: parseInt(stats.total),
      pending: parseInt(stats.pending),
      processing: parseInt(stats.processing),
      completed: parseInt(stats.completed),
      failed: parseInt(stats.failed),
      delayed: parseInt(stats.delayed),
    };
  }

  /**
   * Clears a queue
   * @param {string} queue - Queue name
   * @returns {Promise<boolean>} Success status
   */
  async clearQueue(queue) {
    const sql = `DELETE FROM jobs WHERE queue = ?`;
    await this.query(sql, [queue]);
    return true;
  }

  /**
   * Stops processing jobs
   * @returns {Promise<void>}
   */
  async stop() {
    this.processing = false;
    this.processors.clear();

    if (this.connection) {
      await this.connection.end();
    }
  }

  /**
   * Starts the processing loop
   * @private
   */
  startProcessing() {
    if (this.processing) return;

    this.processing = true;
    this.processLoop();
  }

  /**
   * Main processing loop
   * @private
   */
  async processLoop() {
    while (this.processing && this.processors.size > 0) {
      try {
        await this.processNextBatch();
      } catch (error) {
        console.error('Error in process loop:', error);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
    }
  }

  /**
   * Processes the next batch of jobs
   * @private
   */
  async processNextBatch() {
    for (const [queueName, config] of this.processors.entries()) {
      const { processor, concurrency } = config;

      // Get available jobs
      const jobs = await this.getNextJobs(queueName, concurrency);

      // Process jobs concurrently
      const promises = jobs.map((job) => this.processJob(job, processor));
      await Promise.allSettled(promises);
    }
  }

  /**
   * Gets the next available jobs
   * @private
   * @param {string} queue - Queue name
   * @param {number} limit - Number of jobs to get
   * @returns {Promise<Array>} Jobs
   */
  async getNextJobs(queue, limit) {
    // Select and lock jobs for processing
    const sql =
      this.dbType === 'postgres'
        ? `
      UPDATE jobs
      SET status = 'processing', started_at = NOW()
      WHERE id IN (
        SELECT id FROM jobs
        WHERE queue = $1 
          AND status = 'pending' 
          AND process_after <= NOW()
        ORDER BY priority DESC, created_at ASC
        LIMIT $2
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *
    `
        : `
      UPDATE jobs
      SET status = 'processing', started_at = NOW()
      WHERE queue = ? 
        AND status = 'pending' 
        AND process_after <= NOW()
      ORDER BY priority DESC, created_at ASC
      LIMIT ?
    `;

    // For MySQL, we need a different approach
    if (this.dbType === 'mysql') {
      // First, select the jobs
      const selectSql = `
        SELECT id FROM jobs
        WHERE queue = ? 
          AND status = 'pending' 
          AND process_after <= NOW()
        ORDER BY priority DESC, created_at ASC
        LIMIT ?
        FOR UPDATE
      `;

      const selectResult = await this.query(selectSql, [queue, limit]);

      if (selectResult.rows.length === 0) {
        return [];
      }

      const ids = selectResult.rows.map((row) => row.id);

      // Then update them
      const updateSql = `
        UPDATE jobs
        SET status = 'processing', started_at = NOW()
        WHERE id IN (${ids.map(() => '?').join(',')})
      `;

      await this.query(updateSql, ids);

      // Finally, select the updated jobs
      const finalSql = `
        SELECT * FROM jobs
        WHERE id IN (${ids.map(() => '?').join(',')})
      `;

      const result = await this.query(finalSql, ids);
      return result.rows.map((job) => this.formatJob(job));
    }

    const result = await this.query(sql, [queue, limit]);
    return result.rows.map((job) => this.formatJob(job));
  }

  /**
   * Processes a single job
   * @private
   * @param {Object} job - Job data
   * @param {Function} processor - Job processor function
   */
  async processJob(job, processor) {
    try {
      job.attempts++;

      const result = await processor(job);

      // Mark as completed
      await this.updateJob(job.queue, job.id, {
        status: 'completed',
        completed_at: new Date(),
        result: JSON.stringify(result),
      });
    } catch (error) {
      // Mark as failed
      await this.updateJob(job.queue, job.id, {
        status: 'failed',
        failed_at: new Date(),
        error: error.message,
        attempts: job.attempts,
      });

      // Check if should retry
      if (job.attempts < job.maxAttempts) {
        const retryDelay = this.calculateRetryDelay(job.attempts, job.options);
        const processAfter = new Date(Date.now() + retryDelay);

        await this.updateJob(job.queue, job.id, {
          status: 'pending',
          process_after: processAfter,
        });
      }
    }
  }

  /**
   * Formats a job from database row
   * @private
   * @param {Object} row - Database row
   * @returns {Object} Formatted job
   */
  formatJob(row) {
    return {
      id: row.id.toString(),
      queue: row.queue,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      options:
        typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      status: row.status,
      priority: row.priority,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      error: row.error,
      createdAt: row.created_at,
      processAfter: row.process_after,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      failedAt: row.failed_at,
    };
  }

  /**
   * Calculates retry delay
   * @private
   * @param {number} attempts - Current attempt count
   * @param {Object} options - Job options
   * @returns {number} Delay in milliseconds
   */
  calculateRetryDelay(attempts, options) {
    const backoff = options.backoff || { type: 'exponential', delay: 1000 };

    if (backoff.type === 'exponential') {
      return Math.min(
        backoff.delay * Math.pow(2, attempts - 1),
        backoff.maxDelay || 30000
      );
    } else if (backoff.type === 'fixed') {
      return backoff.delay;
    }

    return 1000; // Default to 1 second
  }

  /**
   * Additional database-specific methods
   */

  /**
   * Gets failed jobs
   * @param {string} queue - Queue name
   * @param {number} [limit=10] - Number of jobs to retrieve
   * @returns {Promise<Array>} Failed jobs
   */
  async getFailedJobs(queue, limit = 10) {
    const sql = `
      SELECT * FROM jobs
      WHERE queue = ? AND status = 'failed'
      ORDER BY failed_at DESC
      LIMIT ?
    `;

    const result = await this.query(sql, [queue, limit]);
    return result.rows.map((job) => this.formatJob(job));
  }

  /**
   * Retries a failed job
   * @param {string} queue - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} Success status
   */
  async retryJob(queue, jobId) {
    const sql = `
      UPDATE jobs
      SET status = 'pending', 
          attempts = 0,
          error = NULL,
          failed_at = NULL,
          process_after = ${this.dbType === 'postgres' ? 'NOW()' : 'NOW()'}
      WHERE queue = ? AND id = ? AND status = 'failed'
    `;

    const result = await this.query(sql, [queue, parseInt(jobId)]);

    if (result.rows.length > 0) {
      this.startProcessing();
      return true;
    }

    return false;
  }

  /**
   * Gets jobs by status
   * @param {string} queue - Queue name
   * @param {string} status - Job status
   * @param {number} [limit=10] - Number of jobs to retrieve
   * @returns {Promise<Array>} Jobs
   */
  async getJobsByStatus(queue, status, limit = 10) {
    const sql = `
      SELECT * FROM jobs
      WHERE queue = ? AND status = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const result = await this.query(sql, [queue, status, limit]);
    return result.rows.map((job) => this.formatJob(job));
  }

  /**
   * Cleans up old completed jobs
   * @param {string} queue - Queue name
   * @param {number} [daysOld=7] - Age of jobs to remove
   * @returns {Promise<number>} Number of jobs removed
   */
  async cleanupOldJobs(queue, daysOld = 7) {
    const sql = `
      DELETE FROM jobs
      WHERE queue = ? 
        AND status IN ('completed', 'failed')
        AND completed_at < ${this.dbType === 'postgres' ? "NOW() - INTERVAL '" + daysOld + " days'" : 'DATE_SUB(NOW(), INTERVAL ? DAY)'}
    `;

    const params = this.dbType === 'postgres' ? [queue] : [queue, daysOld];
    const result = await this.query(sql, params);

    return result.rows.length;
  }
}
