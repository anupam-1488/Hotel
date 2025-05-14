/**
 * @voilajs/appkit - Local filesystem storage provider
 * @module @voilajs/appkit/storage/providers/local
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { StorageProvider } from './base.js';

const pipelineAsync = promisify(pipeline);

/**
 * Local filesystem storage provider
 * @extends StorageProvider
 */
export class LocalProvider extends StorageProvider {
  constructor(config = {}) {
    super(config);
    this.basePath = config.basePath || './storage';
    this.baseUrl = config.baseUrl || '/storage';
  }

  /**
   * Initializes the storage provider
   * @returns {Promise<void>}
   */
  async initialize() {
    // Ensure base directory exists
    await fs.promises.mkdir(this.basePath, { recursive: true });
  }

  /**
   * Uploads a file
   * @param {Buffer|Stream} file - File content
   * @param {string} filePath - Storage path
   * @param {Object} [options] - Upload options
   * @returns {Promise<{url: string, size: number, path: string}>} Upload result
   */
  async upload(file, filePath, options = {}) {
    const fullPath = path.join(this.basePath, filePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.promises.mkdir(dir, { recursive: true });

    let size;

    if (Buffer.isBuffer(file)) {
      // Handle Buffer
      await fs.promises.writeFile(fullPath, file);
      size = file.length;
    } else if (file.pipe) {
      // Handle Stream
      const writeStream = fs.createWriteStream(fullPath);
      await pipelineAsync(file, writeStream);
      const stats = await fs.promises.stat(fullPath);
      size = stats.size;
    } else {
      throw new Error('File must be Buffer or Stream');
    }

    return {
      url: this.getUrl(filePath),
      size,
      path: filePath,
    };
  }

  /**
   * Downloads a file
   * @param {string} filePath - Storage path
   * @returns {Promise<Buffer>} File content
   */
  async download(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      return await fs.promises.readFile(fullPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Deletes a file
   * @param {string} filePath - Storage path
   * @returns {Promise<boolean>} Success status
   */
  async delete(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      await fs.promises.unlink(fullPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Gets a file URL
   * @param {string} filePath - Storage path
   * @param {Object} [options] - URL options
   * @returns {string} File URL
   */
  getUrl(filePath, options = {}) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return `${this.baseUrl}/${normalizedPath}`;
  }

  /**
   * Checks if a file exists
   * @param {string} filePath - Storage path
   * @returns {Promise<boolean>} Existence status
   */
  async exists(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lists files in a directory
   * @param {string} [prefix] - Path prefix
   * @param {Object} [options] - List options
   * @returns {Promise<Array<{path: string, size: number, modified: Date}>>} File list
   */
  async list(prefix = '', options = {}) {
    const { recursive = true, limit = 1000 } = options;
    const fullPath = path.join(this.basePath, prefix);
    const files = [];

    async function walkDir(dir, baseDir) {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const entryPath = path.join(dir, entry.name);
          const relativePath = path.relative(baseDir, entryPath);

          if (entry.isFile()) {
            const stats = await fs.promises.stat(entryPath);
            files.push({
              path: relativePath.replace(/\\/g, '/'),
              size: stats.size,
              modified: stats.mtime,
            });

            if (files.length >= limit) {
              break;
            }
          } else if (entry.isDirectory() && recursive) {
            await walkDir(entryPath, baseDir);

            if (files.length >= limit) {
              break;
            }
          }
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }

    await walkDir(fullPath, this.basePath);
    return files.slice(0, limit);
  }

  /**
   * Gets file metadata
   * @param {string} filePath - Storage path
   * @returns {Promise<{size: number, modified: Date, contentType?: string}>} File metadata
   */
  async getMetadata(filePath) {
    const fullPath = path.join(this.basePath, filePath);

    try {
      const stats = await fs.promises.stat(fullPath);

      // Determine content type based on extension
      let contentType;
      const ext = path.extname(filePath).toLowerCase();

      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.html': 'text/html',
        '.json': 'application/json',
        '.js': 'application/javascript',
        '.css': 'text/css',
      };

      contentType = mimeTypes[ext] || 'application/octet-stream';

      return {
        size: stats.size,
        modified: stats.mtime,
        contentType,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Copies a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async copy(source, destination) {
    const sourcePath = path.join(this.basePath, source);
    const destPath = path.join(this.basePath, destination);
    const destDir = path.dirname(destPath);

    try {
      // Ensure destination directory exists
      await fs.promises.mkdir(destDir, { recursive: true });

      // Copy file
      await fs.promises.copyFile(sourcePath, destPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Source file not found: ${source}`);
      }
      throw error;
    }
  }

  /**
   * Moves/renames a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async move(source, destination) {
    const sourcePath = path.join(this.basePath, source);
    const destPath = path.join(this.basePath, destination);
    const destDir = path.dirname(destPath);

    try {
      // Ensure destination directory exists
      await fs.promises.mkdir(destDir, { recursive: true });

      // Move file
      await fs.promises.rename(sourcePath, destPath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Source file not found: ${source}`);
      }
      throw error;
    }
  }
}
