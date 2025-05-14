# Storage Module

The storage module provides a unified interface for file storage operations
across different storage backends. It offers seamless switching between local
filesystem and cloud storage (AWS S3) with a consistent API, making it easy to
handle file uploads, downloads, and management in your Node.js applications.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Storage Providers](#storage-providers)
  - [File Operations](#file-operations)
  - [Stream Support](#stream-support)
- [Basic Usage](#basic-usage)
  - [Initialization](#initialization)
  - [Uploading Files](#uploading-files)
  - [Downloading Files](#downloading-files)
  - [File Management](#file-management)
- [Advanced Features](#advanced-features)
  - [Signed URLs](#signed-urls)
  - [File Metadata](#file-metadata)
  - [Directory Operations](#directory-operations)
  - [Stream Processing](#stream-processing)
- [Configuration](#configuration)
  - [Local Storage](#local-storage)
  - [S3 Storage](#s3-storage)
  - [Custom Providers](#custom-providers)
- [Integration Patterns](#integration-patterns)
  - [Express Integration](#express-integration)
  - [Image Processing](#image-processing)
  - [Multi-tenant Storage](#multi-tenant-storage)
- [Best Practices](#best-practices)
- [Real-World Examples](#real-world-examples)
- [API Reference](#api-reference)
- [Performance Considerations](#performance-considerations)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Introduction

The storage module addresses common file storage challenges:

- **Provider Agnostic**: Switch between local and cloud storage without changing
  code
- **Stream Support**: Handle large files efficiently with streaming
- **Type Safety**: Full TypeScript support for better developer experience
- **Error Handling**: Consistent error messages across providers
- **Extensible**: Easy to add custom storage providers
- **Performance**: Optimized for both small files and large uploads

## Installation

```bash
npm install @voilajs/appkit
```

For S3 support, install the AWS SDK:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Quick Start

```javascript
import { initStorage, getStorage } from '@voilajs/appkit/storage';

// Initialize local storage
await initStorage('local', {
  basePath: './uploads',
  baseUrl: '/files',
});

// Upload a file
const storage = getStorage();
const result = await storage.upload(buffer, 'images/logo.png');
console.log(result.url); // /files/images/logo.png

// Download a file
const fileContent = await storage.download('images/logo.png');

// Delete a file
await storage.delete('images/logo.png');
```

## Core Concepts

### Storage Providers

The module supports multiple storage backends:

- **LocalProvider**: Stores files on the local filesystem
- **S3Provider**: Stores files in AWS S3 or S3-compatible services
- **Custom Providers**: Extend the base class for other storage services

### File Operations

All providers support these core operations:

- **upload**: Store a file
- **download**: Retrieve file content
- **delete**: Remove a file
- **exists**: Check if file exists
- **getUrl**: Get file URL
- **getMetadata**: Get file information
- **copy**: Duplicate a file
- **move**: Relocate a file
- **list**: List files in directory

### Stream Support

The module handles both Buffer and Stream inputs for efficient memory usage:

```javascript
// Upload from Buffer
const buffer = Buffer.from('Hello World');
await storage.upload(buffer, 'hello.txt');

// Upload from Stream
const stream = fs.createReadStream('large-file.zip');
await storage.upload(stream, 'uploads/large-file.zip');
```

## Basic Usage

### Initialization

```javascript
import { initStorage, getStorage } from '@voilajs/appkit/storage';

// Local storage
await initStorage('local', {
  basePath: './storage',
  baseUrl: '/files',
});

// S3 storage
await initStorage('s3', {
  bucket: 'my-bucket',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Get storage instance anywhere in your app
const storage = getStorage();
```

### Uploading Files

```javascript
// Simple upload
const buffer = Buffer.from('file content');
const result = await storage.upload(buffer, 'documents/file.txt');
console.log(result);
// { url: '/files/documents/file.txt', size: 12, path: 'documents/file.txt' }

// Upload with content type
const image = await sharp(inputBuffer).resize(800).toBuffer();
const result = await storage.upload(image, 'images/resized.jpg', {
  contentType: 'image/jpeg',
  cacheControl: 'public, max-age=31536000',
});

// Upload stream for large files
const videoStream = fs.createReadStream('video.mp4');
const result = await storage.upload(videoStream, 'videos/large.mp4');
```

### Downloading Files

```javascript
// Download as Buffer
const content = await storage.download('documents/file.txt');
console.log(content.toString()); // file content

// Download and save to disk
const data = await storage.download('images/photo.jpg');
await fs.promises.writeFile('./downloads/photo.jpg', data);

// Download and process
const imageBuffer = await storage.download('images/original.png');
const resized = await sharp(imageBuffer).resize(200, 200).toBuffer();
```

### File Management

```javascript
// Check if file exists
const exists = await storage.exists('documents/important.pdf');
if (exists) {
  console.log('File found');
}

// Delete file
const deleted = await storage.delete('temp/old-file.txt');
console.log(deleted ? 'File deleted' : 'File not found');

// Copy file
await storage.copy('templates/document.docx', 'user-123/document.docx');

// Move/rename file
await storage.move('temp/upload.jpg', 'images/profile.jpg');

// Get file URL
const url = storage.getUrl('images/logo.png');
console.log(url); // /files/images/logo.png
```

## Advanced Features

### Signed URLs

For S3 storage, generate temporary access URLs:

```javascript
// Get signed URL (S3 only)
const signedUrl = await storage.getUrl('private/document.pdf', {
  signed: true,
  expiresIn: 3600, // 1 hour
});

// Share temporary access
console.log(signedUrl); // https://bucket.s3.amazonaws.com/private/document.pdf?X-Amz-Signature=...
```

### File Metadata

```javascript
// Get file information
const metadata = await storage.getMetadata('images/photo.jpg');
console.log(metadata);
// {
//   size: 45231,
//   modified: Date('2024-01-01T00:00:00.000Z'),
//   contentType: 'image/jpeg',
//   etag: '123456' // S3 only
// }

// Upload with custom metadata (S3)
await storage.upload(buffer, 'documents/report.pdf', {
  metadata: {
    author: 'John Doe',
    department: 'Sales',
  },
});
```

### Directory Operations

```javascript
// List files in directory
const files = await storage.list('images/', {
  recursive: true,
  limit: 100,
});

console.log(files);
// [
//   { path: 'images/logo.png', size: 1234, modified: Date(...) },
//   { path: 'images/icons/icon1.svg', size: 567, modified: Date(...) }
// ]

// List only direct children
const directFiles = await storage.list('documents/', {
  recursive: false,
});

// Filter by prefix
const pdfFiles = await storage
  .list('documents/', {
    recursive: true,
  })
  .then((files) => files.filter((f) => f.path.endsWith('.pdf')));
```

### Stream Processing

```javascript
// Upload large file with progress
const fileStream = fs.createReadStream('large-video.mp4');
const fileSize = fs.statSync('large-video.mp4').size;
let uploaded = 0;

const progressStream = new Transform({
  transform(chunk, encoding, callback) {
    uploaded += chunk.length;
    console.log(`Progress: ${((uploaded / fileSize) * 100).toFixed(2)}%`);
    callback(null, chunk);
  },
});

fileStream.pipe(progressStream);
await storage.upload(progressStream, 'videos/large-video.mp4');

// Process file in chunks
const downloadStream = await storage.downloadStream('large-file.csv');
const rl = readline.createInterface({
  input: downloadStream,
  crlfDelay: Infinity,
});

for await (const line of rl) {
  // Process each line
  console.log(line);
}
```

## Configuration

### Local Storage

```javascript
await initStorage('local', {
  // Base directory for file storage
  basePath: './storage',

  // Base URL for file access
  baseUrl: '/files',

  // Optional: Custom permissions for created directories
  dirMode: 0o755,
});

// Serve files with Express
app.use('/files', express.static('./storage'));
```

### S3 Storage

```javascript
await initStorage('s3', {
  // Required: S3 bucket name
  bucket: 'my-app-files',

  // AWS region
  region: 'us-east-1',

  // AWS credentials (optional if using IAM roles)
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  // Optional: Custom endpoint for S3-compatible services
  endpoint: 'https://s3.example.com',

  // Optional: Use path-style URLs
  forcePathStyle: true,

  // Optional: Make uploaded files public by default
  publicRead: true,

  // Optional: Custom base URL for public files
  baseUrl: 'https://cdn.example.com',
});
```

### Custom Providers

```javascript
import { StorageProvider } from '@voilajs/appkit/storage';

class AzureProvider extends StorageProvider {
  constructor(config) {
    super(config);
    this.containerName = config.containerName;
    // Initialize Azure client
  }

  async upload(file, path, options = {}) {
    // Implement Azure Blob Storage upload
  }

  async download(path) {
    // Implement Azure Blob Storage download
  }

  // Implement other required methods...
}

// Register custom provider
await initStorage('azure', {
  containerName: 'files',
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
});
```

## Integration Patterns

### Express Integration

```javascript
import express from 'express';
import multer from 'multer';
import { initStorage, getStorage } from '@voilajs/appkit/storage';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize storage
await initStorage('s3', {
  bucket: 'uploads',
  region: 'us-east-1',
});

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const storage = getStorage();
    const file = req.file;

    // Generate unique filename
    const filename = `uploads/${Date.now()}-${file.originalname}`;

    // Upload file
    const result = await storage.upload(file.buffer, filename, {
      contentType: file.mimetype,
    });

    res.json({
      success: true,
      url: result.url,
      size: result.size,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// File download endpoint
app.get('/download/:filename', async (req, res) => {
  try {
    const storage = getStorage();
    const filename = req.params.filename;

    // Check if file exists
    if (!(await storage.exists(filename))) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file metadata
    const metadata = await storage.getMetadata(filename);

    // Download file
    const content = await storage.download(filename);

    // Set headers
    res.setHeader('Content-Type', metadata.contentType);
    res.setHeader('Content-Length', metadata.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send file
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Signed URL endpoint (S3 only)
app.get('/get-upload-url', async (req, res) => {
  try {
    const storage = getStorage();
    const filename = `uploads/${Date.now()}-${req.query.filename}`;

    // Generate signed URL for direct upload
    const uploadUrl = await storage.getUploadUrl(filename, {
      expiresIn: 300, // 5 minutes
      contentType: req.query.contentType,
    });

    res.json({
      uploadUrl,
      filename,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Image Processing

```javascript
import sharp from 'sharp';
import { getStorage } from '@voilajs/appkit/storage';

class ImageProcessor {
  constructor() {
    this.storage = getStorage();
  }

  async processImage(inputPath, options = {}) {
    // Download original image
    const originalBuffer = await this.storage.download(inputPath);

    // Create different sizes
    const sizes = [
      { name: 'thumb', width: 150, height: 150 },
      { name: 'small', width: 300, height: 300 },
      { name: 'medium', width: 600, height: 600 },
      { name: 'large', width: 1200, height: 1200 },
    ];

    const results = [];

    for (const size of sizes) {
      const resized = await sharp(originalBuffer)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Generate output path
      const outputPath = inputPath.replace(/\.[^.]+$/, `-${size.name}.jpg`);

      // Upload resized image
      const result = await this.storage.upload(resized, outputPath, {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      });

      results.push({
        size: size.name,
        url: result.url,
        width: size.width,
        height: size.height,
      });
    }

    return results;
  }

  async generateThumbnails(videoPath) {
    // Similar implementation for video thumbnails
  }
}

// Usage
const processor = new ImageProcessor();
const results = await processor.processImage('uploads/photo.jpg');
```

### Multi-tenant Storage

```javascript
import { getStorage } from '@voilajs/appkit/storage';

class TenantStorage {
  constructor(tenantId) {
    this.tenantId = tenantId;
    this.storage = getStorage();
  }

  // Add tenant prefix to all paths
  getTenantPath(path) {
    return `tenants/${this.tenantId}/${path}`;
  }

  async upload(file, path, options = {}) {
    const tenantPath = this.getTenantPath(path);
    return this.storage.upload(file, tenantPath, options);
  }

  async download(path) {
    const tenantPath = this.getTenantPath(path);
    return this.storage.download(tenantPath);
  }

  async list(prefix = '', options = {}) {
    const tenantPrefix = this.getTenantPath(prefix);
    const files = await this.storage.list(tenantPrefix, options);

    // Remove tenant prefix from results
    return files.map((file) => ({
      ...file,
      path: file.path.replace(`tenants/${this.tenantId}/`, ''),
    }));
  }

  // Implement other methods with tenant prefix...
}

// Usage
app.use((req, res, next) => {
  req.storage = new TenantStorage(req.user.tenantId);
  next();
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const result = await req.storage.upload(
    req.file.buffer,
    `documents/${req.file.originalname}`
  );
  res.json(result);
});
```

## Best Practices

### 1. Use Appropriate Storage Provider

```javascript
// Development: Use local storage
if (process.env.NODE_ENV === 'development') {
  await initStorage('local', {
    basePath: './dev-storage',
  });
} else {
  // Production: Use S3
  await initStorage('s3', {
    bucket: process.env.S3_BUCKET,
    region: process.env.AWS_REGION,
  });
}
```

### 2. Handle Errors Gracefully

```javascript
async function uploadFile(file, path) {
  try {
    const storage = getStorage();
    const result = await storage.upload(file, path);
    return { success: true, ...result };
  } catch (error) {
    console.error('Upload failed:', error);

    // Handle specific errors
    if (error.message.includes('File too large')) {
      return { success: false, error: 'File exceeds size limit' };
    }

    if (error.message.includes('Permission denied')) {
      return { success: false, error: 'Storage permission error' };
    }

    return { success: false, error: 'Upload failed' };
  }
}
```

### 3. Use Streams for Large Files

```javascript
// ❌ Don't load large files into memory
const largeFile = await fs.promises.readFile('1gb-file.zip');
await storage.upload(largeFile, 'large.zip');

// ✅ Use streams
const stream = fs.createReadStream('1gb-file.zip');
await storage.upload(stream, 'large.zip');
```

### 4. Implement File Validation

```javascript
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const maxSize = 10 * 1024 * 1024; // 10MB

async function validateAndUpload(file, path) {
  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }

  // Check file size
  if (file.size > maxSize) {
    throw new Error('File too large');
  }

  // Scan for viruses (if applicable)
  if (await scanFile(file.buffer)) {
    throw new Error('File failed security scan');
  }

  return storage.upload(file.buffer, path, {
    contentType: file.mimetype,
  });
}
```

### 5. Organize Files Effectively

```javascript
function generateFilePath(userId, type, filename) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // Organize by user, type, and date
  return `users/${userId}/${type}/${year}/${month}/${filename}`;
}

// Usage
const path = generateFilePath(user.id, 'documents', 'contract.pdf');
// users/123/documents/2024/01/contract.pdf
```

### 6. Cache File URLs

```javascript
import { getCache } from '@voilajs/appkit/cache';

async function getCachedFileUrl(path, options = {}) {
  const cache = getCache();
  const cacheKey = `file-url:${path}`;

  // Check cache
  const cached = await cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Generate URL
  const storage = getStorage();
  const url = await storage.getUrl(path, options);

  // Cache for appropriate duration
  const ttl = options.signed ? 3600 : 86400; // 1 hour for signed, 24 hours for public
  await cache.set(cacheKey, url, ttl);

  return url;
}
```

### 7. Implement Cleanup Strategies

```javascript
class StorageCleanup {
  constructor(storage) {
    this.storage = storage;
  }

  async cleanupOldFiles(directory, daysOld = 30) {
    const files = await this.storage.list(directory, {
      recursive: true,
    });

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldFiles = files.filter((file) => file.modified < cutoffDate);

    for (const file of oldFiles) {
      await this.storage.delete(file.path);
      console.log(`Deleted old file: ${file.path}`);
    }

    return oldFiles.length;
  }

  async cleanupTempFiles() {
    return this.cleanupOldFiles('temp/', 1); // Delete temp files older than 1 day
  }
}

// Schedule cleanup
const cleanup = new StorageCleanup(getStorage());
setInterval(() => cleanup.cleanupTempFiles(), 24 * 60 * 60 * 1000);
```

## Real-World Examples

### Complete File Management System

```javascript
import express from 'express';
import multer from 'multer';
import { initStorage, getStorage } from '@voilajs/appkit/storage';
import { createLogger } from '@voilajs/appkit/logging';

const app = express();
const logger = createLogger();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Initialize storage
await initStorage('s3', {
  bucket: process.env.S3_BUCKET,
  region: process.env.AWS_REGION,
});

// File manager class
class FileManager {
  constructor() {
    this.storage = getStorage();
    this.logger = logger.child({ component: 'FileManager' });
  }

  async uploadFile(file, userId, metadata = {}) {
    const uploadId = generateId();
    this.logger.info('Starting file upload', {
      uploadId,
      filename: file.originalname,
      size: file.size,
      type: file.mimetype,
    });

    try {
      // Validate file
      await this.validateFile(file);

      // Generate path
      const filename = this.sanitizeFilename(file.originalname);
      const path = `users/${userId}/uploads/${Date.now()}-${filename}`;

      // Upload file
      const result = await this.storage.upload(file.buffer, path, {
        contentType: file.mimetype,
        metadata: {
          ...metadata,
          uploadId,
          originalName: file.originalname,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      });

      // Save to database
      await this.saveFileRecord({
        id: uploadId,
        userId,
        path: result.path,
        url: result.url,
        size: result.size,
        type: file.mimetype,
        originalName: file.originalname,
        metadata,
      });

      this.logger.info('File uploaded successfully', {
        uploadId,
        path: result.path,
      });

      return {
        id: uploadId,
        url: result.url,
        size: result.size,
      };
    } catch (error) {
      this.logger.error('File upload failed', {
        uploadId,
        error: error.message,
      });
      throw error;
    }
  }

  async validateFile(file) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('File type not allowed');
    }

    // Validate file extension matches content
    const ext = path.extname(file.originalname).toLowerCase();
    const expectedExt = this.getExtensionForMimeType(file.mimetype);

    if (ext !== expectedExt) {
      throw new Error('File extension does not match content type');
    }
  }

  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  async getFileById(fileId, userId) {
    // Get file record from database
    const fileRecord = await this.getFileRecord(fileId);

    if (!fileRecord) {
      throw new Error('File not found');
    }

    if (fileRecord.userId !== userId && !fileRecord.public) {
      throw new Error('Access denied');
    }

    return fileRecord;
  }

  async shareFile(fileId, userId, options = {}) {
    const file = await this.getFileById(fileId, userId);

    // Generate signed URL for sharing
    const shareUrl = await this.storage.getUrl(file.path, {
      signed: true,
      expiresIn: options.expiresIn || 7 * 24 * 60 * 60, // 7 days
    });

    // Create share record
    const shareId = generateId();
    await this.createShareRecord({
      id: shareId,
      fileId,
      userId,
      url: shareUrl,
      expiresAt: new Date(
        Date.now() + (options.expiresIn || 7 * 24 * 60 * 60) * 1000
      ),
      permissions: options.permissions || ['read'],
    });

    return {
      shareId,
      url: shareUrl,
      expiresAt: new Date(
        Date.now() + (options.expiresIn || 7 * 24 * 60 * 60) * 1000
      ),
    };
  }
}

// API endpoints
const fileManager = new FileManager();

app.post(
  '/api/files/upload',
  authenticate,
  upload.single('file'),
  async (req, res) => {
    try {
      const result = await fileManager.uploadFile(
        req.file,
        req.user.id,
        req.body.metadata
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

app.get('/api/files/:id', authenticate, async (req, res) => {
  try {
    const file = await fileManager.getFileById(req.params.id, req.user.id);
    res.json(file);
  } catch (error) {
    res
      .status(error.message === 'File not found' ? 404 : 403)
      .json({ error: error.message });
  }
});

app.post('/api/files/:id/share', authenticate, async (req, res) => {
  try {
    const result = await fileManager.shareFile(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Media Processing Pipeline

````javascript
import { getStorage } from '@voilajs/appkit/storage';
import { getQueue } from '@voilajs/appkit/queue';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

class MediaProcessor {
  constructor() {
    this.storage = getStorage();
    this.queue = getQueue();
    this.setupWorkers();
  }

  setupWorkers() {
    // Image processing worker
    this.queue.processJobs('process-image', async (job) => {
      const { fileId, operations } = job.data;
      await this.processImage(fileId, operations);
    });

    // Video processing worker
    this.queue.processJobs('process-video', async (job) => {
      const { fileId, operations } = job.data;
      await this.processVideo(fileId, operations);
    });
  }

  async processImage(fileId, operations) {
    const file = await this.getFileRecord(fileId);
    const original = await this.storage.download(file.path);

    const results = [];

    for (const op of operations) {
      let processed = sharp(original);

      // Apply operations
      if (op.resize) {
        processed = processed.resize(op.resize.width, op.resize.height, {
          fit: op.resize.fit || 'cover'
        });
      }

      if (op.format) {
        processed = processed.toFormat(op.format, op.formatOptions);
      }

      if (op.watermark) {
        processed = processed.composite([{
          input: await this.storage.download(op.watermark.path),
          gravity: op.watermark.position || 'southeast'
        }]);
      }

      // Generate output path
      const outputPath = this.generateOutputPath(file.path, op.suffix);

      // Process and upload
      const output = await processed.toBuffer();
      const result = await this.storage.upload(output, outputPath, {
        contentType: `image/${op.format || 'jpeg'}`
      });

      results.push({
        operation: op.name,
        url: result.url,
        size: result.size
      });
    }

    // Update file record with processed versions
    await this.updateFileRecord(fileId, {
      processed: results,
      processedAt: new Date()
    });

    return results;
  }

  async processVideo(fileId, operations) {
    const file = await this.getFileRecord(fileId);
    const tempInput = `/tmp/${fileId}-input`;
    const tempOutput = `/tmp/${fileId}-output`;

    // Download video to temp file
    const videoData = await this.storage.download(file.path);
    await fs.promises.writeFile(tempInput, videoData);

    try {
      for (const op of operations) {
        if (op.type === 'transcode') {
          await this.transcodeVideo(tempInput, tempOutput, op.options);

          // Upload transcoded video
          const output = await fs.promises.readFile(tempOutput);
          const outputPath = this.generateOutputPath(file.path, op.suffix);

          await this.storage.upload(output, outputPath, {
            contentType: 'video/mp4'
          });
        ```javascript
        } else if (op.type === 'extract-thumbnails') {
          await this.extractThumbnails(tempInput, fileId, op.options);
        } else if (op.type === 'generate-preview') {
          await this.generateVideoPreview(tempInput, fileId, op.options);
        }
      }
    } finally {
      // Cleanup temp files
      await fs.promises.unlink(tempInput).catch(() => {});
      await fs.promises.unlink(tempOutput).catch(() => {});
    }
  }

  async transcodeVideo(input, output, options) {
    return new Promise((resolve, reject) => {
      ffmpeg(input)
        .videoCodec(options.codec || 'libx264')
        .size(options.resolution || '1280x720')
        .videoBitrate(options.bitrate || '1000k')
        .output(output)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  async extractThumbnails(videoPath, fileId, options = {}) {
    const { count = 5, format = 'jpg' } = options;
    const thumbnails = [];

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          count,
          folder: '/tmp',
          filename: `${fileId}-thumb-%i.${format}`
        })
        .on('end', async () => {
          // Upload thumbnails
          for (let i = 1; i <= count; i++) {
            const thumbPath = `/tmp/${fileId}-thumb-${i}.${format}`;
            const thumbData = await fs.promises.readFile(thumbPath);

            const result = await this.storage.upload(
              thumbData,
              `thumbnails/${fileId}/thumb-${i}.${format}`,
              { contentType: `image/${format}` }
            );

            thumbnails.push(result.url);

            // Cleanup
            await fs.promises.unlink(thumbPath);
          }

          resolve(thumbnails);
        })
        .on('error', reject);
    });
  }

  async generateVideoPreview(videoPath, fileId, options = {}) {
    const { duration = 30, format = 'mp4' } = options;
    const outputPath = `/tmp/${fileId}-preview.${format}`;

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(0)
        .setDuration(duration)
        .output(outputPath)
        .videoCodec('libx264')
        .size('640x360')
        .videoBitrate('500k')
        .on('end', async () => {
          // Upload preview
          const previewData = await fs.promises.readFile(outputPath);
          const result = await this.storage.upload(
            previewData,
            `previews/${fileId}/preview.${format}`,
            { contentType: `video/${format}` }
          );

          // Cleanup
          await fs.promises.unlink(outputPath);

          resolve(result.url);
        })
        .on('error', reject);
    });
  }

  generateOutputPath(originalPath, suffix) {
    const dir = path.dirname(originalPath);
    const ext = path.extname(originalPath);
    const base = path.basename(originalPath, ext);
    return `${dir}/${base}-${suffix}${ext}`;
  }
}

// Usage
const processor = new MediaProcessor();

// Queue image processing
await processor.queue.addJob('process-image', {
  fileId: 'file-123',
  operations: [
    {
      name: 'thumbnail',
      suffix: 'thumb',
      resize: { width: 150, height: 150 },
      format: 'webp'
    },
    {
      name: 'medium',
      suffix: 'medium',
      resize: { width: 800, height: 600, fit: 'inside' },
      format: 'jpeg',
      formatOptions: { quality: 85 }
    },
    {
      name: 'watermarked',
      suffix: 'watermark',
      watermark: { path: 'assets/watermark.png' }
    }
  ]
});

// Queue video processing
await processor.queue.addJob('process-video', {
  fileId: 'video-456',
  operations: [
    {
      type: 'transcode',
      suffix: '720p',
      options: {
        resolution: '1280x720',
        codec: 'libx264',
        bitrate: '1500k'
      }
    },
    {
      type: 'extract-thumbnails',
      options: { count: 10, format: 'jpg' }
    },
    {
      type: 'generate-preview',
      options: { duration: 30 }
    }
  ]
});
````

### Document Management System

```javascript
import { getStorage } from '@voilajs/appkit/storage';
import PDFDocument from 'pdfkit';
import { extractText } from 'pdf-text-extract';

class DocumentManager {
  constructor() {
    this.storage = getStorage();
  }

  async createDocument(templatePath, data) {
    // Download template
    const template = await this.storage.download(templatePath);

    // Generate document (example with PDFKit)
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {});

    // Add content based on template and data
    doc.fontSize(20).text(data.title, 50, 50);
    doc.fontSize(12).text(data.content, 50, 100);

    // Add dynamic content
    if (data.items) {
      let y = 200;
      data.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item}`, 50, y);
        y += 20;
      });
    }

    doc.end();

    // Convert to buffer
    const pdfBuffer = Buffer.concat(chunks);

    // Generate filename
    const filename = `documents/${data.userId}/${Date.now()}-${data.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;

    // Upload document
    const result = await this.storage.upload(pdfBuffer, filename, {
      contentType: 'application/pdf',
      metadata: {
        title: data.title,
        createdBy: data.userId,
        template: templatePath,
      },
    });

    // Extract text for search indexing
    const text = await this.extractTextFromPDF(pdfBuffer);

    // Save document record
    await this.saveDocumentRecord({
      id: generateId(),
      userId: data.userId,
      path: result.path,
      url: result.url,
      title: data.title,
      contentText: text,
      metadata: data.metadata,
    });

    return result;
  }

  async extractTextFromPDF(pdfBuffer) {
    return new Promise((resolve, reject) => {
      // Save to temp file for extraction
      const tempPath = `/tmp/${generateId()}.pdf`;
      fs.writeFileSync(tempPath, pdfBuffer);

      extractText(tempPath, (error, text) => {
        // Cleanup
        fs.unlinkSync(tempPath);

        if (error) {
          reject(error);
        } else {
          resolve(text);
        }
      });
    });
  }

  async convertDocument(inputPath, outputFormat) {
    const supportedConversions = {
      'pdf-to-txt': this.pdfToText.bind(this),
      'doc-to-pdf': this.docToPdf.bind(this),
      'image-to-pdf': this.imageToPdf.bind(this),
    };

    const inputExt = path.extname(inputPath).toLowerCase().slice(1);
    const conversionKey = `${inputExt}-to-${outputFormat}`;

    const converter = supportedConversions[conversionKey];
    if (!converter) {
      throw new Error(
        `Conversion from ${inputExt} to ${outputFormat} not supported`
      );
    }

    return converter(inputPath);
  }

  async pdfToText(pdfPath) {
    const pdfBuffer = await this.storage.download(pdfPath);
    const text = await this.extractTextFromPDF(pdfBuffer);

    const outputPath = pdfPath.replace('.pdf', '.txt');
    const result = await this.storage.upload(Buffer.from(text), outputPath, {
      contentType: 'text/plain',
    });

    return result;
  }

  async mergePDFs(pdfPaths, outputPath) {
    const PDFMerger = require('pdf-merger-js');
    const merger = new PDFMerger();

    // Download all PDFs
    for (const pdfPath of pdfPaths) {
      const pdfData = await this.storage.download(pdfPath);
      merger.add(pdfData);
    }

    // Merge PDFs
    const mergedPdf = await merger.saveAsBuffer();

    // Upload merged PDF
    return this.storage.upload(mergedPdf, outputPath, {
      contentType: 'application/pdf',
    });
  }

  async searchDocuments(query, userId) {
    // This would typically search in a database
    // Example implementation with basic text search
    const userDocs = await this.getUserDocuments(userId);

    const results = userDocs.filter((doc) => {
      const searchText = (doc.title + ' ' + doc.contentText).toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    // Enhance results with signed URLs if needed
    return Promise.all(
      results.map(async (doc) => ({
        ...doc,
        downloadUrl: await this.storage.getUrl(doc.path, {
          signed: true,
          expiresIn: 3600,
        }),
      }))
    );
  }
}

// Usage
const docManager = new DocumentManager();

// Create document from template
const document = await docManager.createDocument('templates/invoice.pdf', {
  userId: 'user-123',
  title: 'Invoice #2024-001',
  content: 'Invoice for services rendered',
  items: [
    'Web Development - $5000',
    'Design Services - $2000',
    'Consultation - $1000',
  ],
});

// Convert document
await docManager.convertDocument('documents/report.pdf', 'txt');

// Merge multiple PDFs
await docManager.mergePDFs(
  [
    'documents/chapter1.pdf',
    'documents/chapter2.pdf',
    'documents/chapter3.pdf',
  ],
  'documents/complete-book.pdf'
);
```

## API Reference

### initStorage(provider, config)

Initializes the storage module with a specific provider.

**Parameters:**

- `provider` (string): Provider type ('local' or 's3')
- `config` (Object): Provider-specific configuration

**Returns:** Promise<StorageProvider>

```javascript
await initStorage('local', {
  basePath: './storage',
  baseUrl: '/files',
});
```

### getStorage()

Gets the current storage instance.

**Returns:** StorageProvider

**Throws:** Error if storage is not initialized

```javascript
const storage = getStorage();
```

### StorageProvider Methods

#### upload(file, path, options?)

Uploads a file to storage.

**Parameters:**

- `file` (Buffer|Stream): File content
- `path` (string): Storage path
- `options` (Object, optional): Upload options
  - `contentType` (string): MIME type
  - `metadata` (Object): Custom metadata
  - `cacheControl` (string): Cache control header
  - `public` (boolean): Make file publicly accessible

**Returns:** Promise<{url: string, size: number, path: string, etag?: string}>

```javascript
const result = await storage.upload(buffer, 'images/photo.jpg', {
  contentType: 'image/jpeg',
});
```

#### download(path)

Downloads a file from storage.

**Parameters:**

- `path` (string): Storage path

**Returns:** Promise<Buffer>

```javascript
const content = await storage.download('documents/file.pdf');
```

#### delete(path)

Deletes a file from storage.

**Parameters:**

- `path` (string): Storage path

**Returns:** Promise<boolean>

```javascript
const deleted = await storage.delete('temp/old-file.txt');
```

#### exists(path)

Checks if a file exists.

**Parameters:**

- `path` (string): Storage path

**Returns:** Promise<boolean>

```javascript
const exists = await storage.exists('images/logo.png');
```

#### getUrl(path, options?)

Gets URL for a file.

**Parameters:**

- `path` (string): Storage path
- `options` (Object, optional): URL options
  - `signed` (boolean): Generate signed URL (S3 only)
  - `expiresIn` (number): Expiration time in seconds

**Returns:** string | Promise<string>

```javascript
// Public URL
const url = storage.getUrl('images/public.jpg');

// Signed URL (S3)
const signedUrl = await storage.getUrl('private/doc.pdf', {
  signed: true,
  expiresIn: 3600,
});
```

#### getMetadata(path)

Gets file metadata.

**Parameters:**

- `path` (string): Storage path

**Returns:** Promise<{size: number, modified: Date, contentType?: string, etag?:
string}>

```javascript
const metadata = await storage.getMetadata('documents/report.pdf');
```

#### list(prefix?, options?)

Lists files in storage.

**Parameters:**

- `prefix` (string, optional): Path prefix
- `options` (Object, optional): List options
  - `recursive` (boolean): Include subdirectories
  - `limit` (number): Maximum results

**Returns:** Promise<Array<{path: string, size: number, modified: Date}>>

```javascript
const files = await storage.list('images/', {
  recursive: true,
  limit: 100,
});
```

#### copy(source, destination)

Copies a file.

**Parameters:**

- `source` (string): Source path
- `destination` (string): Destination path

**Returns:** Promise<boolean>

```javascript
await storage.copy('templates/doc.docx', 'users/123/doc.docx');
```

#### move(source, destination)

Moves/renames a file.

**Parameters:**

- `source` (string): Source path
- `destination` (string): Destination path

**Returns:** Promise<boolean>

```javascript
await storage.move('temp/upload.jpg', 'images/final.jpg');
```

## Performance Considerations

### Stream Large Files

```javascript
// For large file uploads
const readStream = fs.createReadStream('large-file.zip');
await storage.upload(readStream, 'backups/large-file.zip');

// For large file downloads
const writeStream = fs.createWriteStream('download.zip');
const data = await storage.download('backups/large-file.zip');
writeStream.write(data);
```

### Implement Caching

```javascript
const cache = new Map();

async function getCachedFile(path) {
  if (cache.has(path)) {
    return cache.get(path);
  }

  const content = await storage.download(path);
  cache.set(path, content);

  // Clear cache after 1 hour
  setTimeout(() => cache.delete(path), 60 * 60 * 1000);

  return content;
}
```

### Batch Operations

```javascript
async function batchDelete(paths) {
  const results = await Promise.allSettled(
    paths.map((path) => storage.delete(path))
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return { succeeded, failed };
}
```

## Security

### Access Control

```javascript
class SecureStorage {
  constructor(storage, user) {
    this.storage = storage;
    this.user = user;
  }

  async upload(file, path, options = {}) {
    // Ensure user owns the path
    const userPath = `users/${this.user.id}/${path}`;
    return this.storage.upload(file, userPath, options);
  }

  async download(path) {
    // Check permissions before download
    if (!(await this.checkPermission(path))) {
      throw new Error('Access denied');
    }
    return this.storage.download(path);
  }

  async checkPermission(path) {
    // Implement your permission logic
    return path.startsWith(`users/${this.user.id}/`);
  }
}
```

### File Validation

```javascript
const crypto = require('crypto');

async function validateFileIntegrity(file, expectedHash) {
  const hash = crypto.createHash('sha256');
  hash.update(file);
  const fileHash = hash.digest('hex');

  if (fileHash !== expectedHash) {
    throw new Error('File integrity check failed');
  }
}
```

### Secure URLs

```javascript
// Generate secure, time-limited URLs
async function generateSecureUrl(path, userId) {
  const token = crypto.randomBytes(32).toString('hex');

  // Store token with expiration
  await cache.set(`file-token:${token}`, {
    path,
    userId,
    expires: Date.now() + 3600000, // 1 hour
  });

  return `/secure-files/${token}`;
}

// Validate secure URL
app.get('/secure-files/:token', async (req, res) => {
  const tokenData = await cache.get(`file-token:${req.params.token}`);

  if (!tokenData || tokenData.expires < Date.now()) {
    return res.status(404).send('File not found');
  }

  const content = await storage.download(tokenData.path);
  res.send(content);
});
```

## Troubleshooting

### Common Issues

#### 1. File Upload Failures

```javascript
// Check file size limits
if (file.size > MAX_FILE_SIZE) {
  throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE} bytes`);
}

// Validate MIME type
const allowedTypes = ['image/jpeg', 'image/png'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

// Handle network errors
try {
  await storage.upload(file, path);
} catch (error) {
  if (error.code === 'ECONNRESET') {
    // Retry upload
    await storage.upload(file, path);
  }
}
```

#### 2. S3 Permission Issues

```javascript
// Test S3 permissions
async function testS3Permissions() {
  try {
    // Test upload
    await storage.upload(Buffer.from('test'), 'test.txt');
    console.log('✓ Upload permission');

    // Test download
    await storage.download('test.txt');
    console.log('✓ Download permission');

    // Test delete
    await storage.delete('test.txt');
    console.log('✓ Delete permission');
  } catch (error) {
    console.error('Permission error:', error.message);
  }
}
```

#### 3. Local Storage Path Issues

```javascript
// Ensure paths are normalized
function normalizePath(inputPath) {
  // Remove leading/trailing slashes
  let normalized = inputPath.replace(/^\/+|\/+$/g, '');

  // Replace backslashes with forward slashes
  normalized = normalized.replace(/\\/g, '/');

  // Remove dangerous path segments
  normalized = normalized.replace(/\.\./g, '');

  return normalized;
}

// Use normalized paths
const safePath = normalizePath(userInput);
await storage.upload(file, safePath);
```

#### 4. Memory Issues with Large Files

```javascript
// Stream large files instead of loading into memory
const archiver = require('archiver');

async function createArchive(files, outputPath) {
  const archive = archiver('zip');
  const output = new stream.PassThrough();

  archive.pipe(output);

  // Add files to archive
  for (const file of files) {
    const content = await storage.download(file.path);
    archive.append(content, { name: file.name });
  }

  archive.finalize();

  // Upload archive as stream
  await storage.upload(output, outputPath);
}
```

### Debug Mode

```javascript
// Enable debug logging
const debug = process.env.DEBUG === 'true';

function logDebug(message, data) {
  if (debug) {
    console.log(`[Storage Debug] ${message}`, data);
  }
}

// Wrap storage methods with debug logging
const debugStorage = new Proxy(storage, {
  get(target, prop) {
    if (typeof target[prop] === 'function') {
      return async (...args) => {
        logDebug(`Calling ${prop}`, args);
        const start = Date.now();

        try {
          const result = await target[prop](...args);
          logDebug(`${prop} completed`, {
            duration: Date.now() - start,
            result,
          });
          return result;
        } catch (error) {
          logDebug(`${prop} failed`, {
            duration: Date.now() - start,
            error: error.message,
          });
          throw error;
        }
      };
    }
    return target[prop];
  },
});
```

## Support

For issues and feature requests, visit our
[GitHub repository](https://github.com/voilajs/appkit).
