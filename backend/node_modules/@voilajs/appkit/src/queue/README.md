# Queue Module

The queue module provides a unified interface for job queue management with
support for multiple backends including in-memory, Redis, and database storage.
It enables asynchronous job processing, retries, priority scheduling, and job
lifecycle management in your Node.js applications.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Queue Adapters](#queue-adapters)
  - [Job Lifecycle](#job-lifecycle)
  - [Processing Jobs](#processing-jobs)
  - [Error Handling](#error-handling)
- [Basic Usage](#basic-usage)
  - [Initialization](#initialization)
  - [Adding Jobs](#adding-jobs)
  - [Processing Jobs](#processing-jobs-1)
  - [Job Management](#job-management)
- [Adapter Configuration](#adapter-configuration)
  - [Memory Adapter](#memory-adapter)
  - [Redis Adapter](#redis-adapter)
  - [Database Adapter](#database-adapter)
- [Advanced Features](#advanced-features)
  - [Priority Jobs](#priority-jobs)
  - [Delayed Jobs](#delayed-jobs)
  - [Job Retries](#job-retries)
  - [Concurrency Control](#concurrency-control)
  - [Progress Tracking](#progress-tracking)
- [Integration Patterns](#integration-patterns)
  - [Email Queue](#email-queue)
  - [Image Processing](#image-processing)
  - [Scheduled Tasks](#scheduled-tasks)
  - [Webhook Delivery](#webhook-delivery)
- [Monitoring and Management](#monitoring-and-management)
  - [Queue Statistics](#queue-statistics)
  - [Failed Jobs](#failed-jobs)
  - [Job Cleanup](#job-cleanup)
  - [Performance Metrics](#performance-metrics)
- [Best Practices](#best-practices)
- [Real-World Examples](#real-world-examples)
- [API Reference](#api-reference)
- [Performance Considerations](#performance-considerations)
- [Error Handling](#error-handling-1)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

## Introduction

The queue module addresses common job processing challenges:

- **Backend Agnostic**: Switch between memory, Redis, or database without
  changing code
- **Reliable Processing**: Automatic retries with configurable backoff
- **Priority Support**: Process important jobs first
- **Concurrency Control**: Process multiple jobs in parallel
- **Progress Tracking**: Monitor job progress and status
- **Error Recovery**: Handle failures gracefully with retry mechanisms

## Installation

```bash
npm install @voilajs/appkit
```

For specific adapters, install their dependencies:

```bash
# For Redis adapter
npm install bull

# For Database adapter (PostgreSQL)
npm install pg

# For Database adapter (MySQL)
npm install mysql2
```

## Quick Start

```javascript
import { initQueue, getQueue } from '@voilajs/appkit/queue';

// Initialize queue
await initQueue('memory'); // For development
// await initQueue('redis', { redis: 'redis://localhost:6379' }); // For production

// Get queue instance
const queue = getQueue();

// Add a job
await queue.addJob('email', {
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome',
});

// Process jobs
await queue.processJobs('email', async (job) => {
  console.log(`Processing job ${job.id}`);
  await sendEmail(job.data);
  return { sent: true };
});
```

## Core Concepts

### Queue Adapters

The module supports three queue adapters:

1. **Memory Adapter**: In-process queue for development
2. **Redis Adapter**: Production-ready with Bull library
3. **Database Adapter**: Uses PostgreSQL or MySQL

Each adapter implements the same interface, allowing seamless switching:

```javascript
// Development
await initQueue('memory');

// Staging
await initQueue('redis', { redis: 'redis://localhost:6379' });

// Production
await initQueue('database', {
  type: 'postgres',
  connectionString: process.env.DATABASE_URL,
});
```

### Job Lifecycle

Jobs go through several states:

1. **Pending**: Waiting to be processed
2. **Delayed**: Scheduled for future processing
3. **Processing**: Currently being worked on
4. **Completed**: Successfully finished
5. **Failed**: Encountered an error

```javascript
// Job states flow
pending → processing → completed
   ↓         ↓
delayed    failed → pending (retry)
```

### Processing Jobs

Jobs are processed by worker functions:

```javascript
await queue.processJobs('myQueue', async (job) => {
  // job.id - Unique job identifier
  // job.data - Job payload
  // job.attempts - Current attempt number

  // Process the job
  const result = await doWork(job.data);

  // Return result (stored with completed job)
  return result;
});
```

### Error Handling

Failed jobs are automatically retried with exponential backoff:

```javascript
// Configure retry behavior
await queue.addJob('risky-task', data, {
  maxAttempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000, // Start with 1 second
  },
});

// Handle failures in processor
await queue.processJobs('risky-task', async (job) => {
  try {
    return await riskyOperation(job.data);
  } catch (error) {
    console.error(`Attempt ${job.attempts} failed:`, error);
    throw error; // Triggers retry
  }
});
```

## Basic Usage

### Initialization

```javascript
import { initQueue } from '@voilajs/appkit/queue';

// Memory adapter (development)
await initQueue('memory');

// Redis adapter (production)
await initQueue('redis', {
  redis: 'redis://localhost:6379',
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
  },
});

// Database adapter
await initQueue('database', {
  type: 'postgres', // or 'mysql'
  connectionString: 'postgresql://user:password@localhost:5432/dbname',
  pollInterval: 1000, // Check for new jobs every second
});
```

### Adding Jobs

```javascript
import { getQueue } from '@voilajs/appkit/queue';

const queue = getQueue();

// Simple job
await queue.addJob('notifications', {
  userId: '123',
  message: 'Your order has shipped!',
});

// Job with options
await queue.addJob(
  'reports',
  { reportType: 'sales', period: 'monthly' },
  {
    priority: 10, // Higher priority jobs run first
    delay: 5000, // Process after 5 seconds
    maxAttempts: 3, // Retry up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  }
);

// Scheduled job
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

await queue.addJob(
  'scheduled-task',
  { task: 'daily-report' },
  { delay: tomorrow - Date.now() }
);
```

### Processing Jobs

```javascript
// Basic processor
await queue.processJobs('notifications', async (job) => {
  const { userId, message } = job.data;
  await notifyUser(userId, message);
  return { notified: true };
});

// Processor with concurrency
await queue.processJobs(
  'images',
  async (job) => {
    const { imageUrl, sizes } = job.data;
    const results = await resizeImage(imageUrl, sizes);
    return results;
  },
  {
    concurrency: 4, // Process 4 images at once
    onCompleted: (jobId, result) => {
      console.log(`Image ${jobId} processed:`, result);
    },
    onFailed: (jobId, error) => {
      console.error(`Image ${jobId} failed:`, error);
    },
  }
);

// Progress reporting (Redis adapter)
await queue.processJobs('large-files', async (job) => {
  const chunks = splitIntoChunks(job.data.file);

  for (let i = 0; i < chunks.length; i++) {
    await processChunk(chunks[i]);

    // Update progress
    if (queue.updateJob) {
      await queue.updateJob('large-files', job.id, {
        progress: Math.round(((i + 1) / chunks.length) * 100),
      });
    }
  }

  return { processed: chunks.length };
});
```

### Job Management

```javascript
// Get job status
const job = await queue.getJob('email', jobId);
console.log(`Job ${jobId} status:`, job.status);

// Update job (if supported)
if (queue.updateJob) {
  await queue.updateJob('email', jobId, {
    progress: 50,
    data: { ...job.data, retryCount: 1 },
  });
}

// Remove job
await queue.removeJob('email', jobId);

// Get queue statistics
const stats = await queue.getQueueInfo('email');
console.log('Queue stats:', stats);
// {
//   name: 'email',
//   total: 150,
//   pending: 50,
//   processing: 10,
//   completed: 80,
//   failed: 10
// }

// Clear entire queue
await queue.clearQueue('email');
```

## Adapter Configuration

### Memory Adapter

The memory adapter stores jobs in-process. Perfect for development and testing.

```javascript
await initQueue('memory', {
  // No specific configuration needed
});

// Features:
// - Zero dependencies
// - Instant processing
// - No persistence
// - Limited by available RAM

// Limitations:
// - Jobs lost on restart
// - Single process only
// - No distributed processing
```

### Redis Adapter

The Redis adapter uses Bull for robust job queue management.

```javascript
await initQueue('redis', {
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'optional-password',
  },
  // or connection string
  redis: 'redis://localhost:6379',

  defaultJobOptions: {
    removeOnComplete: true, // Remove completed jobs
    removeOnFail: false, // Keep failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// Bull-specific features
const queue = getQueue();

// Pause/resume queue
await queue.pauseQueue('email');
await queue.resumeQueue('email');

// Get failed jobs
const failed = await queue.getFailedJobs('email', 0, 10);

// Retry failed job
await queue.retryJob('email', failedJobId);
```

### Database Adapter

The database adapter uses PostgreSQL or MySQL for job storage.

```javascript
// PostgreSQL
await initQueue('database', {
  type: 'postgres',
  connectionString: 'postgresql://user:password@localhost:5432/dbname',
  pollInterval: 1000, // Check for jobs every second
});

// MySQL
await initQueue('database', {
  type: 'mysql',
  connectionString: 'mysql://user:password@localhost:3306/dbname',
  pollInterval: 2000,
});

// Database-specific features
const queue = getQueue();

// Get jobs by status
const pendingJobs = await queue.getJobsByStatus('email', 'pending', 10);

// Clean old jobs
const removed = await queue.cleanupOldJobs('email', 30); // Remove jobs older than 30 days
console.log(`Removed ${removed} old jobs`);

// Retry all failed jobs
const failedJobs = await queue.getFailedJobs('email', 100);
for (const job of failedJobs) {
  await queue.retryJob('email', job.id);
}
```

## Advanced Features

### Priority Jobs

Higher priority jobs are processed first:

```javascript
// Critical alert (high priority)
await queue.addJob(
  'alerts',
  { type: 'system-down', service: 'api' },
  { priority: 100 }
);

// Regular notification (normal priority)
await queue.addJob(
  'alerts',
  { type: 'info', message: 'Update available' },
  { priority: 0 }
);

// Low priority background task
await queue.addJob('cleanup', { type: 'old-files' }, { priority: -10 });
```

### Delayed Jobs

Schedule jobs for future processing:

```javascript
// Process in 1 hour
await queue.addJob('reminder', data, {
  delay: 60 * 60 * 1000,
});

// Process at specific time
const scheduledTime = new Date('2024-12-25T09:00:00');
await queue.addJob('holiday-greeting', data, {
  delay: scheduledTime - Date.now(),
});

// Recurring job (manually re-queue)
await queue.processJobs('daily-task', async (job) => {
  await performDailyTask(job.data);

  // Schedule next occurrence
  await queue.addJob('daily-task', job.data, {
    delay: 24 * 60 * 60 * 1000, // 24 hours
  });
});
```

### Job Retries

Configure retry behavior for failed jobs:

```javascript
// Exponential backoff
await queue.addJob('api-call', data, {
  maxAttempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000, // 1s, 2s, 4s, 8s, 16s
  },
});

// Fixed delay
await queue.addJob('api-call', data, {
  maxAttempts: 3,
  backoff: {
    type: 'fixed',
    delay: 5000, // Always wait 5 seconds
  },
});

// Custom retry logic
await queue.processJobs('api-call', async (job) => {
  try {
    return await makeApiCall(job.data);
  } catch (error) {
    // Don't retry on client errors
    if (error.statusCode >= 400 && error.statusCode < 500) {
      job.maxAttempts = job.attempts; // Prevent retry
    }
    throw error;
  }
});
```

### Concurrency Control

Process multiple jobs in parallel:

```javascript
// Process up to 5 jobs concurrently
await queue.processJobs(
  'downloads',
  async (job) => {
    return await downloadFile(job.data.url);
  },
  { concurrency: 5 }
);

// Dynamic concurrency based on system load
const cpus = require('os').cpus().length;
await queue.processJobs(
  'cpu-intensive',
  async (job) => {
    return await heavyComputation(job.data);
  },
  { concurrency: Math.max(1, cpus - 1) }
);
```

### Progress Tracking

Monitor job progress (supported by Redis adapter):

```javascript
// Report progress from processor
await queue.processJobs('video-encoding', async (job) => {
  const { videoFile, format } = job.data;

  const encoder = createEncoder(videoFile, format);

  encoder.on('progress', async (percent) => {
    if (queue.updateJob) {
      await queue.updateJob('video-encoding', job.id, {
        progress: percent,
      });
    }
  });

  return await encoder.encode();
});

// Monitor progress from outside
const job = await queue.getJob('video-encoding', jobId);
console.log(`Encoding progress: ${job.progress}%`);
```

## Integration Patterns

### Email Queue

```javascript
import { getQueue } from '@voilajs/appkit/queue';
import { sendEmail } from '@voilajs/appkit/email';

class EmailQueue {
  constructor() {
    this.queue = getQueue();
    this.init();
  }

  async init() {
    // Process different email types
    await this.queue.processJobs(
      'transactional-email',
      this.processTransactionalEmail.bind(this),
      { concurrency: 10 }
    );

    await this.queue.processJobs(
      'marketing-email',
      this.processMarketingEmail.bind(this),
      { concurrency: 5 }
    );

    await this.queue.processJobs(
      'bulk-email',
      this.processBulkEmail.bind(this),
      { concurrency: 2 }
    );
  }

  async queueWelcomeEmail(user) {
    return this.queue.addJob(
      'transactional-email',
      {
        type: 'welcome',
        to: user.email,
        data: {
          name: user.name,
          activationUrl: `https://app.com/activate/${user.activationToken}`,
        },
      },
      {
        priority: 10, // High priority
        maxAttempts: 5,
      }
    );
  }

  async queuePasswordReset(user, token) {
    return this.queue.addJob(
      'transactional-email',
      {
        type: 'password-reset',
        to: user.email,
        data: {
          name: user.name,
          resetUrl: `https://app.com/reset/${token}`,
          expiresIn: '1 hour',
        },
      },
      {
        priority: 20, // Very high priority
        maxAttempts: 3,
      }
    );
  }

  async queueNewsletter(subscribers, content) {
    // Queue in batches to avoid overwhelming the system
    const batchSize = 1000;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      await this.queue.addJob(
        'bulk-email',
        {
          type: 'newsletter',
          subscribers: batch,
          content,
        },
        {
          priority: -10, // Low priority
          delay: i * 5000, // Space out batches by 5 seconds
        }
      );
    }
  }

  async processTransactionalEmail(job) {
    const { type, to, data } = job.data;

    const templates = {
      welcome: 'welcome-email',
      'password-reset': 'password-reset',
      'order-confirmation': 'order-confirmation',
    };

    const template = templates[type];
    if (!template) {
      throw new Error(`Unknown email type: ${type}`);
    }

    try {
      const result = await sendEmail(to, template, data);

      // Log delivery
      await this.logEmailDelivery({
        jobId: job.id,
        type,
        to,
        messageId: result.messageId,
        status: 'sent',
      });

      return result;
    } catch (error) {
      // Check if permanent failure
      if (error.code === 'INVALID_EMAIL') {
        // Don't retry invalid emails
        job.maxAttempts = job.attempts;
      }
      throw error;
    }
  }

  async processMarketingEmail(job) {
    // Include unsubscribe handling
    const { to, subject, content, campaign } = job.data;

    const finalContent = this.addUnsubscribeLink(content, to, campaign);

    return sendEmail(to, subject, finalContent, {
      headers: {
        'X-Campaign-ID': campaign.id,
        'List-Unsubscribe': `<mailto:unsubscribe@app.com?subject=${to}>`,
      },
    });
  }

  async processBulkEmail(job) {
    const { subscribers, content } = job.data;
    const results = [];

    for (const subscriber of subscribers) {
      try {
        const result = await sendEmail(
          subscriber.email,
          content.subject,
          content.body,
          { from: content.from }
        );

        results.push({
          email: subscriber.email,
          success: true,
          messageId: result.messageId,
        });
      } catch (error) {
        results.push({
          email: subscriber.email,
          success: false,
          error: error.message,
        });
      }

      // Update progress
      if (this.queue.updateJob) {
        const progress = Math.round(
          (results.length / subscribers.length) * 100
        );
        await this.queue.updateJob('bulk-email', job.id, { progress });
      }
    }

    return {
      total: subscribers.length,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  async getEmailQueueStats() {
    const stats = {};

    for (const queueName of [
      'transactional-email',
      'marketing-email',
      'bulk-email',
    ]) {
      stats[queueName] = await this.queue.getQueueInfo(queueName);
    }

    return stats;
  }
}

// Usage
const emailQueue = new EmailQueue();

// Queue emails
await emailQueue.queueWelcomeEmail(newUser);
await emailQueue.queuePasswordReset(user, resetToken);
await emailQueue.queueNewsletter(subscribers, newsletterContent);

// Monitor queues
const stats = await emailQueue.getEmailQueueStats();
console.log('Email queue stats:', stats);
```

### Image Processing

```javascript
import sharp from 'sharp';
import { getStorage } from '@voilajs/appkit/storage';
import { getQueue } from '@voilajs/appkit/queue';

class ImageProcessor {
  constructor() {
    this.queue = getQueue();
    this.storage = getStorage();
    this.init();
  }

  async init() {
    await this.queue.processJobs(
      'image-resize',
      this.processResize.bind(this),
      { concurrency: 4 }
    );

    await this.queue.processJobs(
      'image-optimize',
      this.processOptimize.bind(this),
      { concurrency: 2 }
    );

    await this.queue.processJobs(
      'generate-thumbnails',
      this.processThumbnails.bind(this),
      { concurrency: 3 }
    );
  }

  async queueImageProcessing(imagePath, operations) {
    const jobs = [];

    // Queue resize operations
    if (operations.resize) {
      const job = await this.queue.addJob(
        'image-resize',
        {
          imagePath,
          sizes: operations.resize,
        },
        { priority: 10 }
      );
      jobs.push(job);
    }

    // Queue optimization
    if (operations.optimize) {
      const job = await this.queue.addJob(
        'image-optimize',
        {
          imagePath,
          quality: operations.optimize.quality || 85,
        },
        { priority: 5 }
      );
      jobs.push(job);
    }

    // Queue thumbnail generation
    if (operations.thumbnails) {
      const job = await this.queue.addJob(
        'generate-thumbnails',
        {
          imagePath,
          sizes: operations.thumbnails,
        },
        { priority: 0 }
      );
      jobs.push(job);
    }

    return jobs;
  }

  async processResize(job) {
    const { imagePath, sizes } = job.data;

    // Download original image
    const imageBuffer = await this.storage.download(imagePath);
    const results = [];

    for (const size of sizes) {
      const resized = await sharp(imageBuffer)
        .resize(size.width, size.height, {
          fit: size.fit || 'cover',
          position: size.position || 'center',
        })
        .toBuffer();

      // Generate output path
      const outputPath = this.generateOutputPath(imagePath, size);

      // Upload resized image
      const uploadResult = await this.storage.upload(resized, outputPath, {
        contentType: 'image/jpeg',
      });

      results.push({
        size: `${size.width}x${size.height}`,
        url: uploadResult.url,
        path: outputPath,
      });

      // Update progress
      if (this.queue.updateJob) {
        const progress = Math.round((results.length / sizes.length) * 100);
        await this.queue.updateJob('image-resize', job.id, { progress });
      }
    }

    return results;
  }

  async processOptimize(job) {
    const { imagePath, quality } = job.data;

    const imageBuffer = await this.storage.download(imagePath);

    // Detect format
    const metadata = await sharp(imageBuffer).metadata();

    let optimized;
    switch (metadata.format) {
      case 'jpeg':
      case 'jpg':
        optimized = await sharp(imageBuffer)
          .jpeg({ quality, progressive: true })
          .toBuffer();
        break;

      case 'png':
        optimized = await sharp(imageBuffer)
          .png({ quality, compressionLevel: 9 })
          .toBuffer();
        break;

      case 'webp':
        optimized = await sharp(imageBuffer).webp({ quality }).toBuffer();
        break;

      default:
        throw new Error(`Unsupported format: ${metadata.format}`);
    }

    // Calculate compression ratio
    const originalSize = imageBuffer.length;
    const optimizedSize = optimized.length;
    const savedBytes = originalSize - optimizedSize;
    const savedPercent = Math.round((savedBytes / originalSize) * 100);

    // Replace original or create optimized version
    const outputPath = imagePath.replace(/\.([^.]+)$/, '-optimized.$1');
    const result = await this.storage.upload(optimized, outputPath);

    return {
      originalSize,
      optimizedSize,
      savedBytes,
      savedPercent,
      url: result.url,
    };
  }

  async processThumbnails(job) {
    const { imagePath, sizes } = job.data;

    const imageBuffer = await this.storage.download(imagePath);
    const thumbnails = [];

    const defaultSizes = sizes || [
      { width: 150, height: 150, name: 'small' },
      { width: 300, height: 300, name: 'medium' },
      { width: 500, height: 500, name: 'large' },
    ];

    for (const size of defaultSizes) {
      const thumbnail = await sharp(imageBuffer)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const outputPath = imagePath.replace(/\.([^.]+)$/, `-${size.name}.$1`);
      const result = await this.storage.upload(thumbnail, outputPath);

      thumbnails.push({
        name: size.name,
        width: size.width,
        height: size.height,
        url: result.url,
      });
    }

    return thumbnails;
  }

  generateOutputPath(originalPath, size) {
    const dir = path.dirname(originalPath);
    const ext = path.extname(originalPath);
    const base = path.basename(originalPath, ext);
    return `${dir}/${base}-${size.width}x${size.height}${ext}`;
  }
}

// Usage
const imageProcessor = new ImageProcessor();

// Process uploaded image
app.post('/upload', upload.single('image'), async (req, res) => {
  // Save original
  const result = await storage.upload(
    req.file.buffer,
    `images/${req.file.filename}`
  );

  // Queue processing
  const jobs = await imageProcessor.queueImageProcessing(result.path, {
    resize: [
      { width: 800, height: 600 },
      { width: 1200, height: 900 },
    ],
    optimize: { quality: 85 },
    thumbnails: true,
  });

  res.json({
    original: result.url,
    processingJobs: jobs.map((j) => j.id),
  });
});
```

### Scheduled Tasks

```javascript
class TaskScheduler {
  constructor() {
    this.queue = getQueue();
    this.tasks = new Map();
    this.init();
  }

  async init() {
    await this.queue.processJobs(
      'scheduled-task',
      this.processTask.bind(this),
      { concurrency: 1 }
    );

    // Register recurring tasks
    this.registerDailyTasks();
    this.registerWeeklyTasks();
    this.registerMonthlyTasks();
  }

  async scheduleTask(name, handler, schedule) {
    this.tasks.set(name, { handler, schedule });

    // Calculate next run time
    const nextRun = this.calculateNextRun(schedule);

    // Queue the task
    await this.queue.addJob(
      'scheduled-task',
      {
        name,
        schedule,
        runAt: nextRun,
      },
      {
        delay: nextRun - Date.now(),
      }
    );
  }

  async processTask(job) {
    const { name, schedule } = job.data;

    const task = this.tasks.get(name);
    if (!task) {
      throw new Error(`Task not found: ${name}`);
    }

    try {
      // Execute task
      const result = await task.handler();

      // Schedule next occurrence
      if (this.isRecurring(schedule)) {
        const nextRun = this.calculateNextRun(schedule);

        await this.queue.addJob(
          'scheduled-task',
          {
            name,
            schedule,
            runAt: nextRun,
          },
          {
            delay: nextRun - Date.now(),
          }
        );
      }

      return result;
    } catch (error) {
      console.error(`Scheduled task ${name} failed:`, error);
      throw error;
    }
  }

  registerDailyTasks() {
    // Daily backup
    this.scheduleTask(
      'daily-backup',
      async () => {
        console.log('Running daily backup...');
        await backupDatabase();
        await cleanupOldBackups();
        return { success: true };
      },
      {
        type: 'daily',
        hour: 2, // 2 AM
        minute: 0,
      }
    );

    // Daily reports
    this.scheduleTask(
      'daily-reports',
      async () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);

        const report = await generateDailyReport(date);
        await emailReport(report);

        return { reportId: report.id };
      },
      {
        type: 'daily',
        hour: 8, // 8 AM
        minute: 0,
      }
    );
  }

  registerWeeklyTasks() {
    // Weekly digest
    this.scheduleTask(
      'weekly-digest',
      async () => {
        const subscribers = await getNewsletterSubscribers();
        const content = await generateWeeklyDigest();

        await queueBulkEmail(subscribers, content);

        return {
          subscribers: subscribers.length,
          subject: content.subject,
        };
      },
      {
        type: 'weekly',
        dayOfWeek: 1, // Monday
        hour: 10,
        minute: 0,
      }
    );
  }

  registerMonthlyTasks() {
    // Monthly billing
    this.scheduleTask(
      'monthly-billing',
      async () => {
        const accounts = await getActiveAccounts();
        let processed = 0;

        for (const account of accounts) {
          try {
            await processMonthlyBilling(account);
            processed++;
          } catch (error) {
            console.error(`Billing failed for account ${account.id}:`, error);
            // Queue for manual review
            await this.queue.addJob('billing-failures', {
              accountId: account.id,
              error: error.message,
              billingPeriod: new Date().toISOString().slice(0, 7),
            });
          }
        }

        return {
          total: accounts.length,
          processed,
          failed: accounts.length - processed,
        };
      },
      {
        type: 'monthly',
        dayOfMonth: 1, // First day of month
        hour: 0,
        minute: 0,
      }
    );

    // Monthly cleanup
    this.scheduleTask(
      'monthly-cleanup',
      async () => {
        // Clean old logs
        const logsDeleted = await cleanupOldLogs(30);

        // Clean old jobs
        const jobsDeleted = await this.queue.cleanupOldJobs('*', 30);

        // Clean old uploads
        const filesDeleted = await cleanupOldUploads(90);

        return {
          logsDeleted,
          jobsDeleted,
          filesDeleted,
        };
      },
      {
        type: 'monthly',
        dayOfMonth: 15, // 15th of each month
        hour: 3,
        minute: 0,
      }
    );
  }

  calculateNextRun(schedule) {
    const now = new Date();
    let next = new Date(now);

    switch (schedule.type) {
      case 'daily':
        next.setHours(schedule.hour, schedule.minute, 0, 0);
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;

      case 'weekly':
        next.setHours(schedule.hour, schedule.minute, 0, 0);
        const daysUntilTarget = (schedule.dayOfWeek - next.getDay() + 7) % 7;
        if (daysUntilTarget === 0 && next <= now) {
          next.setDate(next.getDate() + 7);
        } else {
          next.setDate(next.getDate() + daysUntilTarget);
        }
        break;

      case 'monthly':
        next.setDate(schedule.dayOfMonth);
        next.setHours(schedule.hour, schedule.minute, 0, 0);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
        break;

      case 'interval':
        next = new Date(now.getTime() + schedule.interval);
        break;
    }

    return next;
  }

  isRecurring(schedule) {
    return ['daily', 'weekly', 'monthly', 'interval'].includes(schedule.type);
  }

  async getUpcomingTasks() {
    const jobs = await this.queue.getJobsByStatus('scheduled-task', 'delayed');

    return jobs
      .map((job) => ({
        name: job.data.name,
        schedule: job.data.schedule,
        nextRun: new Date(job.processAfter),
        jobId: job.id,
      }))
      .sort((a, b) => a.nextRun - b.nextRun);
  }
}

// Usage
const scheduler = new TaskScheduler();

// Add custom scheduled task
await scheduler.scheduleTask(
  'check-ssl-certificates',
  async () => {
    const expiringCerts = await checkSSLCertificates();

    if (expiringCerts.length > 0) {
      await notifyAdmins('SSL certificates expiring', expiringCerts);
    }

    return { checked: true, expiring: expiringCerts.length };
  },
  {
    type: 'daily',
    hour: 9,
    minute: 0,
  }
);

// View upcoming tasks
const upcoming = await scheduler.getUpcomingTasks();
console.log('Upcoming scheduled tasks:', upcoming);
```

### Webhook Delivery

```javascript
class WebhookDelivery {
  constructor() {
    this.queue = getQueue();
    this.init();
  }

  async init() {
    await this.queue.processJobs(
      'webhook-delivery',
      this.deliverWebhook.bind(this),
      { concurrency: 10 }
    );

    await this.queue.processJobs(
      'webhook-retry',
      this.retryWebhook.bind(this),
      { concurrency: 5 }
    );
  }

  async queueWebhook(event, data, subscribers) {
    const jobs = [];

    for (const subscriber of subscribers) {
      if (!this.shouldSendWebhook(subscriber, event)) {
        continue;
      }

      const job = await this.queue.addJob(
        'webhook-delivery',
        {
          url: subscriber.url,
          event,
          data,
          subscriberId: subscriber.id,
          secret: subscriber.secret,
          attempt: 1,
        },
        {
          priority: this.getWebhookPriority(event),
          maxAttempts: 3,
        }
      );

      jobs.push(job);
    }

    return jobs;
  }

  async deliverWebhook(job) {
    const { url, event, data, subscriberId, secret, attempt } = job.data;

    // Prepare payload
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      delivery_id: job.id,
    };

    // Generate signature
    const signature = this.generateSignature(payload, secret);

    // Prepare request
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Signature': signature,
        'X-Webhook-Delivery': job.id,
        'X-Webhook-Attempt': attempt.toString(),
      },
      body: JSON.stringify(payload),
      timeout: 10000, // 10 second timeout
    };

    const startTime = Date.now();

    try {
      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;

      // Log delivery
      await this.logDelivery({
        jobId: job.id,
        subscriberId,
        event,
        url,
        attempt,
        status: response.status,
        responseTime,
        success: response.ok,
      });

      if (!response.ok) {
        // Check if should retry
        if (this.shouldRetryStatus(response.status)) {
          throw new Error(`Webhook delivery failed: ${response.status}`);
        } else {
          // Permanent failure
          job.maxAttempts = job.attempts;
          throw new Error(`Webhook permanently failed: ${response.status}`);
        }
      }

      return {
        delivered: true,
        status: response.status,
        responseTime,
      };
    } catch (error) {
      await this.logDelivery({
        jobId: job.id,
        subscriberId,
        event,
        url,
        attempt,
        error: error.message,
        responseTime: Date.now() - startTime,
        success: false,
      });

      // Queue for retry with exponential backoff
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s

        await this.queue.addJob(
          'webhook-retry',
          {
            ...job.data,
            attempt: attempt + 1,
            originalJobId: job.id,
          },
          {
            delay,
            priority: job.options.priority - 1,
          }
        );
      }

      throw error;
    }
  }

  async retryWebhook(job) {
    return this.deliverWebhook(job);
  }

  shouldSendWebhook(subscriber, event) {
    // Check if subscriber is active
    if (!subscriber.active) return false;

    // Check if subscriber wants this event type
    if (subscriber.events && !subscriber.events.includes(event)) return false;

    // Check rate limits
    const limit = subscriber.rateLimit || 1000; // Default: 1000 per hour
    const recentDeliveries = this.getRecentDeliveries(subscriber.id);

    if (recentDeliveries.length >= limit) {
      console.warn(`Rate limit exceeded for subscriber ${subscriber.id}`);
      return false;
    }

    return true;
  }

  getWebhookPriority(event) {
    // Critical events get higher priority
    const priorities = {
      'payment.failed': 20,
      'security.alert': 20,
      'order.created': 10,
      'user.created': 5,
      'user.updated': 0,
    };

    return priorities[event] || 0;
  }

  generateSignature(payload, secret) {
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${timestamp}.${JSON.stringify(payload)}`;

    return crypto.createHmac('sha256', secret).update(message).digest('hex');
  }

  shouldRetryStatus(status) {
    // Retry on server errors and specific client errors
    return status >= 500 || status === 429 || status === 408;
  }

  async getDeliveryStats(subscriberId) {
    const stats = await db.query(
      `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN success = true THEN 1 END) as successful,
        COUNT(CASE WHEN success = false THEN 1 END) as failed,
        AVG(response_time) as avg_response_time,
        MIN(delivered_at) as first_delivery,
        MAX(delivered_at) as last_delivery
      FROM webhook_deliveries
      WHERE subscriber_id = ?
      AND delivered_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
    `,
      [subscriberId]
    );

    return stats[0];
  }
}

// Usage
const webhooks = new WebhookDelivery();

// Queue webhooks for an event
app.post('/api/orders', async (req, res) => {
  const order = await createOrder(req.body);

  // Get webhook subscribers
  const subscribers = await getWebhookSubscribers('order.created');

  // Queue webhook deliveries
  await webhooks.queueWebhook('order.created', order, subscribers);

  res.json(order);
});

// Monitor webhook deliveries
app.get('/api/webhooks/stats/:subscriberId', async (req, res) => {
  const stats = await webhooks.getDeliveryStats(req.params.subscriberId);
  res.json(stats);
});
```

## Monitoring and Management

### Queue Statistics

```javascript
class QueueMonitor {
  constructor() {
    this.queue = getQueue();
  }

  async getOverview() {
    const queues = ['email', 'image-processing', 'webhooks', 'scheduled-tasks'];
    const stats = {};

    for (const queueName of queues) {
      stats[queueName] = await this.queue.getQueueInfo(queueName);
    }

    return {
      timestamp: new Date(),
      queues: stats,
      summary: {
        totalJobs: Object.values(stats).reduce((sum, q) => sum + q.total, 0),
        totalPending: Object.values(stats).reduce(
          (sum, q) => sum + q.pending,
          0
        ),
        totalProcessing: Object.values(stats).reduce(
          (sum, q) => sum + q.processing,
          0
        ),
        totalFailed: Object.values(stats).reduce((sum, q) => sum + q.failed, 0),
      },
    };
  }

  async getQueueMetrics(queueName, period = '1h') {
    const now = new Date();
    const periodMs = this.parsePeriod(period);
    const since = new Date(now - periodMs);

    // Get jobs processed in period
    const processedJobs = await this.getProcessedJobs(queueName, since);

    return {
      queue: queueName,
      period,
      metrics: {
        jobsProcessed: processedJobs.length,
        avgProcessingTime: this.calculateAvgProcessingTime(processedJobs),
        successRate: this.calculateSuccessRate(processedJobs),
        errorRate: this.calculateErrorRate(processedJobs),
        throughput: processedJobs.length / (periodMs / 1000),
      },
    };
  }

  async getFailedJobDetails(queueName, limit = 10) {
    if (this.queue.getFailedJobs) {
      return this.queue.getFailedJobs(queueName, limit);
    }

    // Fallback for adapters without getFailedJobs
    const jobs =
      (await this.queue.getJobsByStatus?.(queueName, 'failed', limit)) || [];

    return jobs.map((job) => ({
      id: job.id,
      data: job.data,
      error: job.error,
      attempts: job.attempts,
      failedAt: job.failedAt,
    }));
  }

  async getQueueHealth() {
    const overview = await this.getOverview();
    const health = {
      status: 'healthy',
      issues: [],
      recommendations: [],
    };

    // Check for high failure rates
    for (const [queue, stats] of Object.entries(overview.queues)) {
      const failureRate = stats.failed / stats.total;

      if (failureRate > 0.1) {
        health.status = 'warning';
        health.issues.push({
          queue,
          issue: 'high_failure_rate',
          value: failureRate,
          message: `${queue} has ${Math.round(failureRate * 100)}% failure rate`,
        });
      }

      // Check for backlog
      if (stats.pending > 1000) {
        health.status = 'warning';
        health.issues.push({
          queue,
          issue: 'large_backlog',
          value: stats.pending,
          message: `${queue} has ${stats.pending} pending jobs`,
        });

        health.recommendations.push({
          queue,
          recommendation: 'increase_concurrency',
          message: `Consider increasing concurrency for ${queue}`,
        });
      }
    }

    return health;
  }

  parsePeriod(period) {
    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = period.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid period format');
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }
}

// Dashboard endpoint
app.get('/api/queues/dashboard', async (req, res) => {
  const monitor = new QueueMonitor();

  const [overview, health] = await Promise.all([
    monitor.getOverview(),
    monitor.getQueueHealth(),
  ]);

  res.json({ overview, health });
});

// Queue-specific metrics
app.get('/api/queues/:name/metrics', async (req, res) => {
  const monitor = new QueueMonitor();
  const metrics = await monitor.getQueueMetrics(
    req.params.name,
    req.query.period || '1h'
  );

  res.json(metrics);
});
```

### Failed Jobs

```javascript
class FailedJobManager {
  constructor() {
    this.queue = getQueue();
  }

  async getFailedJobs(queueName, page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;

    if (this.queue.getFailedJobs) {
      return this.queue.getFailedJobs(queueName, start, pageSize);
    }

    // Fallback implementation
    const allFailed =
      (await this.queue.getJobsByStatus?.(queueName, 'failed', 100)) || [];

    return {
      jobs: allFailed.slice(start, start + pageSize),
      total: allFailed.length,
      page,
      pageSize,
      totalPages: Math.ceil(allFailed.length / pageSize),
    };
  }

  async retryFailedJob(queueName, jobId) {
    if (this.queue.retryJob) {
      return this.queue.retryJob(queueName, jobId);
    }

    // Manual retry
    const job = await this.queue.getJob(queueName, jobId);
    if (!job || job.status !== 'failed') {
      throw new Error('Job not found or not failed');
    }

    // Reset job status
    await this.queue.updateJob(queueName, jobId, {
      status: 'pending',
      attempts: 0,
      error: null,
      failedAt: null,
    });

    return true;
  }

  async retryAllFailed(queueName) {
    const failed = await this.getFailedJobs(queueName, 1, 1000);
    let retried = 0;

    for (const job of failed.jobs) {
      try {
        await this.retryFailedJob(queueName, job.id);
        retried++;
      } catch (error) {
        console.error(`Failed to retry job ${job.id}:`, error);
      }
    }

    return { total: failed.total, retried };
  }

  async analyzeFailures(queueName) {
    const failed = await this.getFailedJobs(queueName, 1, 100);

    const analysis = {
      total: failed.total,
      byError: {},
      byAttempts: {},
      patterns: [],
    };

    for (const job of failed.jobs) {
      // Group by error message
      const errorKey = job.error || 'Unknown';
      analysis.byError[errorKey] = (analysis.byError[errorKey] || 0) + 1;

      // Group by attempts
      const attempts = job.attempts || 0;
      analysis.byAttempts[attempts] = (analysis.byAttempts[attempts] || 0) + 1;
    }

    // Identify patterns
    if (failed.total > 10) {
      const topError = Object.entries(analysis.byError).sort(
        ([, a], [, b]) => b - a
      )[0];

      if (topError && topError[1] / failed.total > 0.5) {
        analysis.patterns.push({
          type: 'common_error',
          error: topError[0],
          percentage: Math.round((topError[1] / failed.total) * 100),
        });
      }
    }

    return analysis;
  }
}

// Failed job management endpoints
app.get('/api/queues/:name/failed', async (req, res) => {
  const manager = new FailedJobManager();
  const failed = await manager.getFailedJobs(
    req.params.name,
    parseInt(req.query.page) || 1,
    parseInt(req.query.pageSize) || 10
  );

  res.json(failed);
});

app.post('/api/queues/:name/failed/:jobId/retry', async (req, res) => {
  const manager = new FailedJobManager();
  await manager.retryFailedJob(req.params.name, req.params.jobId);

  res.json({ success: true });
});

app.post('/api/queues/:name/failed/retry-all', async (req, res) => {
  const manager = new FailedJobManager();
  const result = await manager.retryAllFailed(req.params.name);

  res.json(result);
});

app.get('/api/queues/:name/failed/analysis', async (req, res) => {
  const manager = new FailedJobManager();
  const analysis = await manager.analyzeFailures(req.params.name);

  res.json(analysis);
});
```

### Job Cleanup

```javascript
class QueueCleaner {
  constructor() {
    this.queue = getQueue();
  }

  async cleanupOldJobs(queueName, daysOld = 30) {
    if (this.queue.cleanupOldJobs) {
      return this.queue.cleanupOldJobs(queueName, daysOld);
    }

    // Manual cleanup for adapters without built-in cleanup
    let cleaned = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Get completed jobs
    const completed =
      (await this.queue.getJobsByStatus?.(queueName, 'completed', 1000)) || [];

    for (const job of completed) {
      if (job.completedAt && job.completedAt < cutoffDate) {
        await this.queue.removeJob(queueName, job.id);
        cleaned++;
      }
    }

    // Get failed jobs
    const failed =
      (await this.queue.getJobsByStatus?.(queueName, 'failed', 1000)) || [];

    for (const job of failed) {
      if (job.failedAt && job.failedAt < cutoffDate) {
        await this.queue.removeJob(queueName, job.id);
        cleaned++;
      }
    }

    return cleaned;
  }

  async setupAutoCleanup(schedule = '0 3 * * *') {
    // Use cron-like schedule for cleanup
    const cron = require('node-cron');

    cron.schedule(schedule, async () => {
      console.log('Running queue cleanup...');

      const queues = ['email', 'webhooks', 'image-processing'];
      const results = {};

      for (const queueName of queues) {
        try {
          const cleaned = await this.cleanupOldJobs(queueName, 30);
          results[queueName] = cleaned;
        } catch (error) {
          console.error(`Cleanup failed for ${queueName}:`, error);
          results[queueName] = { error: error.message };
        }
      }

      console.log('Cleanup complete:', results);
    });
  }

  async getStorageStats() {
    const queues = await this.getAllQueues();
    const stats = {};
    let totalJobs = 0;

    for (const queueName of queues) {
      const info = await this.queue.getQueueInfo(queueName);
      stats[queueName] = info;
      totalJobs += info.total;
    }

    return {
      queues: stats,
      totalJobs,
      recommendations: this.getCleanupRecommendations(stats),
    };
  }

  getCleanupRecommendations(stats) {
    const recommendations = [];

    for (const [queue, info] of Object.entries(stats)) {
      // Recommend cleanup for queues with many completed jobs
      if (info.completed > 10000) {
        recommendations.push({
          queue,
          action: 'cleanup_completed',
          reason: `${info.completed} completed jobs consuming storage`,
        });
      }

      // Recommend cleanup for old failed jobs
      if (info.failed > 1000) {
        recommendations.push({
          queue,
          action: 'cleanup_failed',
          reason: `${info.failed} failed jobs should be reviewed and cleaned`,
        });
      }
    }

    return recommendations;
  }
}

// Initialize auto-cleanup
const cleaner = new QueueCleaner();
cleaner.setupAutoCleanup();

// Manual cleanup endpoint
app.post('/api/queues/:name/cleanup', async (req, res) => {
  const daysOld = parseInt(req.query.daysOld) || 30;
  const cleaned = await cleaner.cleanupOldJobs(req.params.name, daysOld);

  res.json({ cleaned, daysOld });
});

// Storage stats endpoint
app.get('/api/queues/storage-stats', async (req, res) => {
  const stats = await cleaner.getStorageStats();
  res.json(stats);
});
```

### Performance Metrics

```javascript
class QueuePerformance {
  constructor() {
    this.queue = getQueue();
    this.metrics = new Map();
  }

  startTracking(queueName) {
    const metrics = {
      processed: 0,
      failed: 0,
      totalProcessingTime: 0,
      startTime: Date.now(),
    };

    this.metrics.set(queueName, metrics);

    // Hook into job processing
    const originalProcess = this.queue.processJobs.bind(this.queue);

    this.queue.processJobs = async (queue, processor, options) => {
      if (queue !== queueName) {
        return originalProcess(queue, processor, options);
      }

      const wrappedProcessor = async (job) => {
        const startTime = Date.now();

        try {
          const result = await processor(job);

          // Update metrics
          const metrics = this.metrics.get(queueName);
          metrics.processed++;
          metrics.totalProcessingTime += Date.now() - startTime;

          return result;
        } catch (error) {
          const metrics = this.metrics.get(queueName);
          metrics.failed++;
          metrics.totalProcessingTime += Date.now() - startTime;

          throw error;
        }
      };

      return originalProcess(queue, wrappedProcessor, options);
    };
  }

  getMetrics(queueName) {
    const metrics = this.metrics.get(queueName);
    if (!metrics) return null;

    const runtime = Date.now() - metrics.startTime;
    const total = metrics.processed + metrics.failed;

    return {
      queue: queueName,
      runtime: runtime,
      processed: metrics.processed,
      failed: metrics.failed,
      total: total,
      successRate: total > 0 ? metrics.processed / total : 0,
      failureRate: total > 0 ? metrics.failed / total : 0,
      avgProcessingTime: total > 0 ? metrics.totalProcessingTime / total : 0,
      throughput: runtime > 0 ? (total / runtime) * 1000 : 0, // jobs per second
    };
  }

  getAllMetrics() {
    const allMetrics = {};

    for (const [queue, _] of this.metrics) {
      allMetrics[queue] = this.getMetrics(queue);
    }

    return allMetrics;
  }
}

// Performance tracking
const performance = new QueuePerformance();
performance.startTracking('email');
performance.startTracking('image-processing');

// Performance endpoint
app.get('/api/queues/performance', async (req, res) => {
  const metrics = performance.getAllMetrics();
  res.json(metrics);
});
```

## Best Practices

### 1. Choose the Right Adapter

```javascript
// Development
if (process.env.NODE_ENV === 'development') {
  await initQueue('memory');
}

// Production with Redis (recommended)
else if (process.env.REDIS_URL) {
  await initQueue('redis', {
    redis: process.env.REDIS_URL,
  });
}

// Production with existing database
else if (process.env.DATABASE_URL) {
  await initQueue('database', {
    connectionString: process.env.DATABASE_URL,
  });
}
```

### 2. Handle Failures Gracefully

```javascript
await queue.processJobs('critical-task', async (job) => {
  try {
    return await processCriticalTask(job.data);
  } catch (error) {
    // Log detailed error information
    logger.error('Critical task failed', {
      jobId: job.id,
      attempt: job.attempts,
      error: error.message,
      stack: error.stack,
      data: job.data,
    });

    // Don't retry certain errors
    if (error.code === 'INVALID_INPUT') {
      job.maxAttempts = job.attempts; // Stop retries
    }

    // Alert on final failure
    if (job.attempts >= job.maxAttempts) {
      await notifyOncall('Critical task failed permanently', {
        jobId: job.id,
        error: error.message,
      });
    }

    throw error;
  }
});
```

### 3. Use Appropriate Concurrency

```javascript
// CPU-bound tasks: limit to CPU cores
const cpus = require('os').cpus().length;
await queue.processJobs('cpu-intensive', processor, {
  concurrency: Math.max(1, cpus - 1),
});

// I/O-bound tasks: higher concurrency
await queue.processJobs('api-calls', processor, {
  concurrency: 20,
});

// Memory-intensive tasks: limit concurrency
await queue.processJobs('large-files', processor, {
  concurrency: 2,
});
```

### 4. Monitor Queue Health

```javascript
// Regular health checks
setInterval(async () => {
  const queues = ['email', 'webhooks', 'processing'];

  for (const queueName of queues) {
    const info = await queue.getQueueInfo(queueName);

    // Alert if queue is backing up
    if (info.pending > 1000) {
      logger.warn('Queue backlog detected', {
        queue: queueName,
        pending: info.pending,
      });
    }

    // Alert if high failure rate
    if (info.failed / info.total > 0.1) {
      logger.error('High failure rate', {
        queue: queueName,
        failureRate: info.failed / info.total,
      });
    }
  }
}, 60000); // Check every minute
```

### 5. Implement Idempotency

```javascript
// Ensure jobs can be safely retried
await queue.processJobs('payments', async (job) => {
  const { paymentId, amount, userId } = job.data;

  // Check if already processed
  const existing = await db.payments.findOne({ paymentId });
  if (existing) {
    logger.info('Payment already processed', { paymentId });
    return existing;
  }

  // Process payment with idempotency key
  const result = await paymentProcessor.charge({
    amount,
    userId,
    idempotencyKey: paymentId,
  });

  // Save result
  await db.payments.create({
    paymentId,
    ...result,
  });

  return result;
});
```

### 6. Use Priorities Wisely

```javascript
// Priority levels
const PRIORITY = {
  CRITICAL: 100,
  HIGH: 50,
  NORMAL: 0,
  LOW: -50,
  BATCH: -100,
};

// Critical operations
await queue.addJob('alerts', alertData, {
  priority: PRIORITY.CRITICAL,
});

// User-facing operations
await queue.addJob('email', welcomeEmail, {
  priority: PRIORITY.HIGH,
});

// Background tasks
await queue.addJob('cleanup', cleanupData, {
  priority: PRIORITY.LOW,
});

// Bulk operations
await queue.addJob('report-generation', reportData, {
  priority: PRIORITY.BATCH,
});
```

### 7. Batch Related Jobs

```javascript
// Process related jobs together
async function batchUserNotifications(users, message) {
  // Group users by preference
  const batches = {
    email: users.filter((u) => u.preferEmail),
    sms: users.filter((u) => u.preferSMS),
    push: users.filter((u) => u.preferPush),
  };

  // Queue batches with different priorities
  if (batches.email.length > 0) {
    await queue.addJob(
      'bulk-email',
      {
        users: batches.email,
        message,
      },
      { priority: 0 }
    );
  }

  if (batches.sms.length > 0) {
    await queue.addJob(
      'bulk-sms',
      {
        users: batches.sms,
        message,
      },
      { priority: 10 }
    ); // Higher priority for SMS
  }

  if (batches.push.length > 0) {
    await queue.addJob(
      'bulk-push',
      {
        users: batches.push,
        message,
      },
      { priority: 5 }
    );
  }
}
```

### 8. Clean Up Completed Jobs

```javascript
// Configure retention policies
await initQueue('redis', {
  redis: process.env.REDIS_URL,
  defaultJobOptions: {
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Manual cleanup for database adapter
if (queue.cleanupOldJobs) {
  // Run daily cleanup
  cron.schedule('0 3 * * *', async () => {
    const cleaned = await queue.cleanupOldJobs('*', 30);
    logger.info('Cleaned old jobs', { count: cleaned });
  });
}
```

### 9. Handle Graceful Shutdown

```javascript
let isShuttingDown = false;

async function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info('Starting graceful shutdown...');

  // Stop accepting new jobs
  if (queue.stop) {
    await queue.stop();
  }

  // Wait for current jobs to complete (with timeout)
  const timeout = 30000; // 30 seconds
  const shutdownStart = Date.now();

  while (Date.now() - shutdownStart < timeout) {
    const stats = await queue.getQueueInfo('all');

    if (stats.processing === 0) {
      logger.info('All jobs completed');
      break;
    }

    logger.info('Waiting for jobs to complete', {
      processing: stats.processing,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### 10. Use Dead Letter Queues

```javascript
// Configure dead letter queue for permanently failed jobs
class DeadLetterQueue {
  constructor() {
    this.queue = getQueue();
  }

  async setupDeadLetterProcessing() {
    // Monitor failed jobs
    setInterval(async () => {
      const queues = ['critical-tasks', 'payments', 'notifications'];

      for (const queueName of queues) {
        const failed = await this.queue.getFailedJobs(queueName, 100);

        for (const job of failed) {
          // Move to dead letter queue if exceeded max attempts
          if (job.attempts >= job.maxAttempts) {
            await this.moveToDeadLetter(job, queueName);
          }
        }
      }
    }, 60000); // Check every minute
  }

  async moveToDeadLetter(job, originalQueue) {
    // Add to dead letter queue
    await this.queue.addJob(
      'dead-letter',
      {
        originalQueue,
        originalJob: job,
        failedAt: new Date(),
        reason: job.error,
      },
      {
        priority: -100, // Low priority
      }
    );

    // Remove from original queue
    await this.queue.removeJob(originalQueue, job.id);

    // Alert admins
    await this.alertAdmins(job, originalQueue);
  }

  async alertAdmins(job, queue) {
    logger.error('Job moved to dead letter queue', {
      queue,
      jobId: job.id,
      error: job.error,
      attempts: job.attempts,
    });

    // Send notification
    await notifyAdmins('Dead letter job', {
      queue,
      job,
    });
  }
}

const dlq = new DeadLetterQueue();
dlq.setupDeadLetterProcessing();
```

## Real-World Examples

### Complete Job Processing System

```javascript
import { initQueue, getQueue } from '@voilajs/appkit/queue';
import { createLogger } from '@voilajs/appkit/logging';
import { initEmail } from '@voilajs/appkit/email';

class JobProcessingSystem {
  constructor() {
    this.logger = createLogger({ defaultMeta: { service: 'job-processor' } });
    this.initialized = false;
  }

  async initialize() {
    try {
      // Initialize queue
      await initQueue(process.env.QUEUE_ADAPTER || 'redis', {
        redis: process.env.REDIS_URL,
        connectionString: process.env.DATABASE_URL,
      });

      // Initialize email
      await initEmail('smtp', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      this.queue = getQueue();
      this.initialized = true;

      // Start processors
      await this.startProcessors();

      // Setup monitoring
      this.setupMonitoring();

      this.logger.info('Job processing system initialized');
    } catch (error) {
      this.logger.error('Failed to initialize job processing system', {
        error,
      });
      throw error;
    }
  }

  async startProcessors() {
    // Email processor
    await this.queue.processJobs('email', this.processEmail.bind(this), {
      concurrency: 10,
    });

    // Image processor
    await this.queue.processJobs(
      'image-processing',
      this.processImage.bind(this),
      { concurrency: 4 }
    );

    // Report generator
    await this.queue.processJobs('reports', this.processReport.bind(this), {
      concurrency: 2,
    });

    // Webhook delivery
    await this.queue.processJobs('webhooks', this.processWebhook.bind(this), {
      concurrency: 20,
    });

    this.logger.info('Job processors started');
  }

  async processEmail(job) {
    const jobLogger = this.logger.child({
      jobId: job.id,
      jobType: 'email',
    });

    jobLogger.info('Processing email job');

    try {
      const { to, subject, template, data } = job.data;

      const result = await sendTemplatedEmail(to, subject, template, data);

      jobLogger.info('Email sent successfully', {
        messageId: result.messageId,
      });

      return result;
    } catch (error) {
      jobLogger.error('Email processing failed', {
        error: error.message,
        attempt: job.attempts,
      });

      // Don't retry for invalid emails
      if (error.code === 'INVALID_EMAIL') {
        job.maxAttempts = job.attempts;
      }

      throw error;
    }
  }

  async processImage(job) {
    const jobLogger = this.logger.child({
      jobId: job.id,
      jobType: 'image',
    });

    jobLogger.info('Processing image job');

    const { imagePath, operations } = job.data;
    const results = {};

    try {
      // Download image
      const imageBuffer = await storage.download(imagePath);

      // Process operations
      if (operations.resize) {
        results.resize = await this.resizeImage(imageBuffer, operations.resize);
      }

      if (operations.optimize) {
        results.optimize = await this.optimizeImage(
          imageBuffer,
          operations.optimize
        );
      }

      if (operations.watermark) {
        results.watermark = await this.addWatermark(
          imageBuffer,
          operations.watermark
        );
      }

      jobLogger.info('Image processing completed', { results });

      return results;
    } catch (error) {
      jobLogger.error('Image processing failed', {
        error: error.message,
        operation: error.operation,
      });
      throw error;
    }
  }

  async processReport(job) {
    const jobLogger = this.logger.child({
      jobId: job.id,
      jobType: 'report',
    });

    jobLogger.info('Processing report job');

    const { type, parameters, userId } = job.data;

    try {
      // Generate report
      const report = await this.generateReport(type, parameters);

      // Save to storage
      const reportPath = `reports/${type}/${report.id}.pdf`;
      await storage.upload(report.buffer, reportPath);

      // Notify user
      await this.queue.addJob(
        'email',
        {
          to: await getUserEmail(userId),
          subject: `Your ${type} report is ready`,
          template: 'report-ready',
          data: {
            reportType: type,
            downloadUrl: await storage.getSignedUrl(reportPath),
          },
        },
        { priority: 5 }
      );

      jobLogger.info('Report generated successfully', {
        reportId: report.id,
        type,
      });

      return { reportId: report.id, path: reportPath };
    } catch (error) {
      jobLogger.error('Report generation failed', {
        error: error.message,
        type,
        userId,
      });
      throw error;
    }
  }

  async processWebhook(job) {
    const jobLogger = this.logger.child({
      jobId: job.id,
      jobType: 'webhook',
    });

    const { url, payload, secret, headers = {} } = job.data;

    jobLogger.info('Delivering webhook', { url });

    try {
      // Sign payload
      const signature = this.signWebhookPayload(payload, secret);

      // Send webhook
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          ...headers,
        },
        body: JSON.stringify(payload),
        timeout: 10000,
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }

      jobLogger.info('Webhook delivered successfully', {
        status: response.status,
      });

      return {
        status: response.status,
        deliveredAt: new Date(),
      };
    } catch (error) {
      jobLogger.error('Webhook delivery failed', {
        error: error.message,
        url,
        attempt: job.attempts,
      });

      // Don't retry client errors
      if (error.status >= 400 && error.status < 500) {
        job.maxAttempts = job.attempts;
      }

      throw error;
    }
  }

  setupMonitoring() {
    // Queue health check
    setInterval(async () => {
      const stats = await this.getQueueStats();

      // Check for issues
      for (const [queue, info] of Object.entries(stats)) {
        if (info.failed > 50) {
          this.logger.error('High failure count', {
            queue,
            failed: info.failed,
          });
        }

        if (info.pending > 1000) {
          this.logger.warn('Large queue backlog', {
            queue,
            pending: info.pending,
          });
        }
      }
    }, 60000);

    // Performance tracking
    this.trackPerformance();

    // Failed job monitoring
    this.monitorFailedJobs();
  }

  async getQueueStats() {
    const queues = ['email', 'image-processing', 'reports', 'webhooks'];
    const stats = {};

    for (const queueName of queues) {
      stats[queueName] = await this.queue.getQueueInfo(queueName);
    }

    return stats;
  }

  trackPerformance() {
    const startTimes = new Map();

    // Hook into job start/complete events
    this.queue.on?.('job:start', (jobId) => {
      startTimes.set(jobId, Date.now());
    });

    this.queue.on?.('job:complete', (jobId) => {
      const startTime = startTimes.get(jobId);
      if (startTime) {
        const duration = Date.now() - startTime;
        this.logger.info('Job completed', { jobId, duration });
        startTimes.delete(jobId);
      }
    });
  }

  async monitorFailedJobs() {
    setInterval(
      async () => {
        const queues = ['email', 'webhooks', 'reports'];

        for (const queueName of queues) {
          const failed = await this.queue.getFailedJobs?.(queueName, 10);

          if (failed && failed.length > 0) {
            // Analyze failure patterns
            const patterns = this.analyzeFailurePatterns(failed);

            if (patterns.systemicIssue) {
              this.logger.error('Systemic issue detected', {
                queue: queueName,
                pattern: patterns.systemicIssue,
              });

              // Alert team
              await this.alertOncall({
                severity: 'high',
                message: `Systemic issue in ${queueName} queue`,
                details: patterns,
              });
            }
          }
        }
      },
      5 * 60 * 1000
    ); // Every 5 minutes
  }

  analyzeFailurePatterns(failedJobs) {
    const patterns = {
      byError: {},
      systemicIssue: null,
    };

    // Group by error
    for (const job of failedJobs) {
      const error = job.error || 'Unknown';
      patterns.byError[error] = (patterns.byError[error] || 0) + 1;
    }

    // Check for systemic issues
    const totalFailures = failedJobs.length;
    for (const [error, count] of Object.entries(patterns.byError)) {
      if (count / totalFailures > 0.5) {
        patterns.systemicIssue = { error, percentage: count / totalFailures };
      }
    }

    return patterns;
  }

  async alertOncall(alert) {
    // Implementation depends on alerting system
    this.logger.error('ALERT', alert);

    // Could integrate with PagerDuty, Slack, etc.
    await this.queue.addJob(
      'notifications',
      {
        type: 'oncall-alert',
        ...alert,
      },
      { priority: 100 }
    );
  }
}

// Initialize and start the system
const jobSystem = new JobProcessingSystem();

async function start() {
  try {
    await jobSystem.initialize();
    console.log('Job processing system started');
  } catch (error) {
    console.error('Failed to start job processing system:', error);
    process.exit(1);
  }
}

start();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await jobSystem.shutdown();
  process.exit(0);
});
```

### Multi-tenant Job Processing

```javascript
class MultiTenantJobProcessor {
  constructor() {
    this.queue = getQueue();
    this.tenantProcessors = new Map();
  }

  async registerTenant(tenantId, config) {
    this.tenantProcessors.set(tenantId, config);

    // Start tenant-specific processors
    await this.queue.processJobs(
      `tenant:${tenantId}:email`,
      (job) => this.processTenantJob(tenantId, 'email', job),
      { concurrency: config.emailConcurrency || 5 }
    );

    await this.queue.processJobs(
      `tenant:${tenantId}:reports`,
      (job) => this.processTenantJob(tenantId, 'reports', job),
      { concurrency: config.reportConcurrency || 2 }
    );
  }

  async queueTenantJob(tenantId, jobType, data, options = {}) {
    const config = this.tenantProcessors.get(tenantId);
    if (!config) {
      throw new Error(`Tenant not registered: ${tenantId}`);
    }

    // Apply tenant-specific limits
    const priority = Math.min(options.priority || 0, config.maxPriority || 50);

    // Check rate limits
    const key = `${tenantId}:${jobType}:count`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour window

    if (count > (config.rateLimits?.[jobType] || 1000)) {
      throw new Error('Rate limit exceeded');
    }

    // Queue job
    return this.queue.addJob(`tenant:${tenantId}:${jobType}`, data, {
      ...options,
      priority,
      metadata: { tenantId },
    });
  }

  async processTenantJob(tenantId, jobType, job) {
    const config = this.tenantProcessors.get(tenantId);

    try {
      // Apply tenant context
      const context = {
        tenantId,
        config,
        logger: logger.child({ tenantId, jobType, jobId: job.id }),
      };

      // Process based on job type
      switch (jobType) {
        case 'email':
          return await this.processTenantEmail(context, job);
        case 'reports':
          return await this.processTenantReport(context, job);
        default:
          throw new Error(`Unknown job type: ${jobType}`);
      }
    } catch (error) {
      context.logger.error('Tenant job failed', { error: error.message });
      throw error;
    }
  }

  async processTenantEmail(context, job) {
    const { tenantId, config } = context;

    // Use tenant-specific email configuration
    const emailConfig = config.email || {};
    const fromAddress = emailConfig.from || 'noreply@example.com';

    return sendEmail(job.data.to, job.data.subject, job.data.html, {
      from: fromAddress,
      replyTo: emailConfig.replyTo,
    });
  }

  async getTenantQueueStats(tenantId) {
    const jobTypes = ['email', 'reports'];
    const stats = {};

    for (const jobType of jobTypes) {
      const queueName = `tenant:${tenantId}:${jobType}`;
      stats[jobType] = await this.queue.getQueueInfo(queueName);
    }

    return stats;
  }
}

// Usage
const multiTenant = new MultiTenantJobProcessor();

// Register tenants
await multiTenant.registerTenant('tenant-1', {
  emailConcurrency: 10,
  reportConcurrency: 3,
  maxPriority: 75,
  rateLimits: {
    email: 5000, // 5000 emails per hour
    reports: 100, // 100 reports per hour
  },
  email: {
    from: 'noreply@tenant1.com',
    replyTo: 'support@tenant1.com',
  },
});

// Queue tenant jobs
await multiTenant.queueTenantJob('tenant-1', 'email', {
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our service</h1>',
});

// Monitor tenant queues
app.get('/api/tenants/:tenantId/queues', async (req, res) => {
  const stats = await multiTenant.getTenantQueueStats(req.params.tenantId);
  res.json(stats);
});
```

## API Reference

### initQueue(adapter, config)

Initializes the queue module with specified adapter.

**Parameters:**

- `adapter` (string): Adapter type ('memory', 'redis', 'database')
- `config` (Object): Adapter-specific configuration

**Returns:** Promise<QueueAdapter>

```javascript
await initQueue('redis', {
  redis: 'redis://localhost:6379',
});
```

### getQueue()

Gets the current queue instance.

**Returns:** QueueAdapter

**Throws:** Error if queue is not initialized

```javascript
const queue = getQueue();
```

### QueueAdapter Methods

#### addJob(queue, data, options?)

Adds a job to a queue.

**Parameters:**

- `queue` (string): Queue name
- `data` (Object): Job data
- `options` (Object, optional):
  - `priority` (number): Job priority (higher = higher priority)
  - `delay` (number): Delay in milliseconds
  - `maxAttempts` (number): Maximum retry attempts
  - `backoff` (Object): Retry backoff configuration

**Returns:** Promise<{id: string, queue: string, status: string}>

```javascript
const job = await queue.addJob(
  'email',
  { to: 'user@example.com', subject: 'Hello' },
  { priority: 10, delay: 5000 }
);
```

#### processJobs(queue, processor, options?)

Processes jobs from a queue.

**Parameters:**

- `queue` (string): Queue name
- `processor` (Function): Job processor function
- `options` (Object, optional):
  - `concurrency` (number): Number of concurrent jobs
  - `onCompleted` (Function): Completion callback
  - `onFailed` (Function): Failure callback

**Returns:** Promise<void>

```javascript
await queue.processJobs(
  'email',
  async (job) => {
    console.log('Processing:', job.data);
    return { sent: true };
  },
  { concurrency: 5 }
);
```

#### getJob(queue, jobId)

Gets a specific job by ID.

**Parameters:**

- `queue` (string): Queue name
- `jobId` (string): Job ID

**Returns:** Promise<Object|null>

```javascript
const job = await queue.getJob('email', 'job_123');
```

#### updateJob(queue, jobId, update)

Updates a job.

**Parameters:**

- `queue` (string): Queue name
- `jobId` (string): Job ID
- `update` (Object): Update data

**Returns:** Promise<boolean>

```javascript
await queue.updateJob('email', 'job_123', {
  progress: 50,
});
```

#### removeJob(queue, jobId)

Removes a job.

**Parameters:**

- `queue` (string): Queue name
- `jobId` (string): Job ID

**Returns:** Promise<boolean>

```javascript
await queue.removeJob('email', 'job_123');
```

#### getQueueInfo(queue)

Gets queue statistics.

**Parameters:**

- `queue` (string): Queue name

**Returns:** Promise<Object>

```javascript
const info = await queue.getQueueInfo('email');
// {
//   name: 'email',
//   total: 100,
//   pending: 20,
//   processing: 5,
//   completed: 70,
//   failed: 5
// }
```

#### clearQueue(queue)

Clears all jobs from a queue.

**Parameters:**

- `queue` (string): Queue name

**Returns:** Promise<boolean>

```javascript
await queue.clearQueue('email');
```

#### stop()

Stops processing jobs.

**Returns:** Promise<void>

```javascript
await queue.stop();
```

## Performance Considerations

### Concurrency Tuning

```javascript
// CPU-bound tasks
const optimalConcurrency = require('os').cpus().length - 1;

// I/O-bound tasks
const ioConcurrency = 20; // Adjust based on external service limits

// Memory-intensive tasks
const memoryConcurrency = Math.floor(availableMemory / taskMemoryUsage);
```

### Batch Processing

```javascript
// Process jobs in batches for efficiency
await queue.processJobs('bulk-operations', async (job) => {
  const { items } = job.data;
  const batchSize = 100;
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processBatch(batch);
    results.push(...batchResults);

    // Update progress
    if (queue.updateJob) {
      const progress = Math.round(((i + batchSize) / items.length) * 100);
      await queue.updateJob('bulk-operations', job.id, { progress });
    }
  }

  return results;
});
```

### Connection Pooling

```javascript
// Redis adapter uses connection pooling by default
// For database adapter, configure pool settings
await initQueue('database', {
  type: 'postgres',
  connectionString: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
  },
});
```

## Error Handling

### Job Errors

```javascript
await queue.processJobs('risky-operation', async (job) => {
  try {
    return await riskyOperation(job.data);
  } catch (error) {
    // Log error details
    logger.error('Job failed', {
      jobId: job.id,
      error: error.message,
      stack: error.stack,
      attempt: job.attempts,
    });

    // Categorize errors
    if (error instanceof ValidationError) {
      // Don't retry validation errors
      job.maxAttempts = job.attempts;
    } else if (error instanceof NetworkError) {
      // Retry network errors with backoff
      error.retryable = true;
    } else if (error instanceof RateLimitError) {
      // Delay retry for rate limits
      error.retryDelay = 60000; // 1 minute
    }

    throw error;
  }
});
```

### System Errors

```javascript
// Handle adapter errors
try {
  await queue.addJob('email', data);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    logger.error('Queue service unavailable');
    // Fallback to synchronous processing or alternative queue
  } else {
    throw error;
  }
}

// Monitor queue health
setInterval(async () => {
  try {
    await queue.getQueueInfo('health-check');
  } catch (error) {
    logger.error('Queue health check failed', { error });
    // Alert operations team
  }
}, 30000);
```

## Migration Guide

### From Bull to @voilajs/appkit Queue

```javascript
// Before (Bull)
const queue = new Bull('email', 'redis://localhost:6379');

queue.add({ to: 'user@example.com' });

queue.process(async (job) => {
  return sendEmail(job.data);
});

// After (@voilajs/appkit)
await initQueue('redis', { redis: 'redis://localhost:6379' });
const queue = getQueue();

await queue.addJob('email', { to: 'user@example.com' });

await queue.processJobs('email', async (job) => {
  return sendEmail(job.data);
});
```

### From Database Jobs to @voilajs/appkit Queue

```javascript
// Before (Custom database implementation)
await db.jobs.create({
  type: 'email',
  data: { to: 'user@example.com' },
  status: 'pending',
});

// After (@voilajs/appkit)
await initQueue('database', {
  type: 'postgres',
  connectionString: process.env.DATABASE_URL,
});

const queue = getQueue();
await queue.addJob('email', { to: 'user@example.com' });
```

## Troubleshooting

### Common Issues

#### 1. Jobs Not Processing

```javascript
// Check if processors are running
const info = await queue.getQueueInfo('email');
console.log('Pending jobs:', info.pending);
console.log('Processing jobs:', info.processing);

// Ensure processor is started
await queue.processJobs('email', processor);

// Check for errors in processor
await queue.processJobs('email', async (job) => {
  try {
    return await processor(job);
  } catch (error) {
    console.error('Processor error:', error);
    throw error;
  }
});
```

#### 2. High Memory Usage

```javascript
// Limit concurrency
await queue.processJobs('memory-intensive', processor, {
  concurrency: 2,
});

// Process in smaller batches
await queue.processJobs('large-dataset', async (job) => {
  const { data } = job.data;
  const chunkSize = 1000;

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await processChunk(chunk);

    // Allow garbage collection
    if (global.gc) global.gc();
  }
});
```

#### 3. Redis Connection Issues

```javascript
// Add connection error handling
await initQueue('redis', {
  redis: {
    host: 'localhost',
    port: 6379,
    retryStrategy: (times) => {
      if (times > 3) {
        return new Error('Redis connection failed');
      }
      return Math.min(times * 50, 2000);
    },
  },
});

// Monitor Redis connection
const queue = getQueue();
if (queue.on) {
  queue.on('error', (error) => {
    logger.error('Queue error', { error });
  });
}
```

#### 4. Database Adapter Performance

```javascript
// Optimize polling interval
await initQueue('database', {
  type: 'postgres',
  connectionString: process.env.DATABASE_URL,
  pollInterval: 2000, // Poll every 2 seconds instead of 1
});

// Add indexes for better performance
// Run this migration:
/*
CREATE INDEX idx_jobs_queue_status_priority 
ON jobs(queue, status, process_after, priority DESC);

CREATE INDEX idx_jobs_created_at 
ON jobs(created_at);

CREATE INDEX idx_jobs_completed_at 
ON jobs(completed_at) 
WHERE status = 'completed';
*/
```

#### 5. Job Duplication

```javascript
// Implement idempotency
await queue.processJobs('payments', async (job) => {
  const { paymentId } = job.data;

  // Check if already processed
  const existing = await db.processedJobs.findOne({
    jobId: job.id,
    paymentId,
  });

  if (existing) {
    logger.warn('Job already processed', { jobId: job.id });
    return existing.result;
  }

  // Process payment
  const result = await processPayment(job.data);

  // Record as processed
  await db.processedJobs.create({
    jobId: job.id,
    paymentId,
    result,
    processedAt: new Date(),
  });

  return result;
});
```

### Debug Mode

```javascript
// Enable debug logging for queue operations
const debug = process.env.DEBUG === 'true';

class DebugQueue {
  constructor(queue) {
    this.queue = queue;
  }

  async addJob(queueName, data, options) {
    if (debug) {
      console.log(`[QUEUE] Adding job to ${queueName}:`, {
        data,
        options,
      });
    }

    const start = Date.now();
    const result = await this.queue.addJob(queueName, data, options);

    if (debug) {
      console.log(`[QUEUE] Job added in ${Date.now() - start}ms:`, result);
    }

    return result;
  }

  // Wrap other methods similarly...
}

// Use debug wrapper
const queue = new DebugQueue(getQueue());
```

### Health Checks

```javascript
// Comprehensive health check endpoint
app.get('/health/queues', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      queues: {},
      issues: [],
    };

    // Check each queue
    const queueNames = ['email', 'webhooks', 'reports'];

    for (const queueName of queueNames) {
      try {
        const info = await queue.getQueueInfo(queueName);
        health.queues[queueName] = info;

        // Check for issues
        if (info.failed > 100) {
          health.issues.push({
            queue: queueName,
            issue: 'high_failure_count',
            failed: info.failed,
          });
        }

        if (info.pending > 1000) {
          health.issues.push({
            queue: queueName,
            issue: 'large_backlog',
            pending: info.pending,
          });
        }
      } catch (error) {
        health.status = 'unhealthy';
        health.issues.push({
          queue: queueName,
          issue: 'queue_error',
          error: error.message,
        });
      }
    }

    // Set overall status
    if (health.issues.length > 0) {
      health.status = 'degraded';
    }

    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});
```

## Support

For issues and feature requests, visit our
[GitHub repository](https://github.com/voilajs/appkit).
