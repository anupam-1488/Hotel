/**
 * @voilajs/appkit - AWS S3 storage provider
 * @module @voilajs/appkit/storage/providers/s3
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from './base.js';

/**
 * AWS S3 storage provider
 * @extends StorageProvider
 */
export class S3Provider extends StorageProvider {
  constructor(config = {}) {
    super(config);
    this.bucket = config.bucket;
    this.region = config.region || 'us-east-1';
    this.credentials = config.credentials;
    this.endpoint = config.endpoint;
    this.forcePathStyle = config.forcePathStyle || false;
    this.publicRead = config.publicRead || false;
    this.baseUrl =
      config.baseUrl ||
      `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
  }

  /**
   * Initializes the storage provider
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this.bucket) {
      throw new Error('S3 bucket name is required');
    }

    // Initialize S3 client
    const clientConfig = {
      region: this.region,
      forcePathStyle: this.forcePathStyle,
    };

    if (this.credentials) {
      clientConfig.credentials = this.credentials;
    }

    if (this.endpoint) {
      clientConfig.endpoint = this.endpoint;
    }

    this.client = new S3Client(clientConfig);
  }

  /**
   * Uploads a file
   * @param {Buffer|Stream} file - File content
   * @param {string} path - Storage path
   * @param {Object} [options] - Upload options
   * @returns {Promise<{url: string, size: number, etag: string}>} Upload result
   */
  async upload(file, path, options = {}) {
    const params = {
      Bucket: this.bucket,
      Key: path,
      Body: file,
      ContentType: options.contentType || 'application/octet-stream',
    };

    if (this.publicRead || options.public) {
      params.ACL = 'public-read';
    }

    if (options.metadata) {
      params.Metadata = options.metadata;
    }

    if (options.cacheControl) {
      params.CacheControl = options.cacheControl;
    }

    try {
      const command = new PutObjectCommand(params);
      const response = await this.client.send(command);

      // Get file size
      let size;
      if (Buffer.isBuffer(file)) {
        size = file.length;
      } else {
        // For streams, we need to get the size after upload
        const metadata = await this.getMetadata(path);
        size = metadata.size;
      }

      return {
        url: this.getUrl(path),
        size,
        etag: response.ETag?.replace(/"/g, ''),
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Downloads a file
   * @param {string} path - Storage path
   * @returns {Promise<Buffer>} File content
   */
  async download(path) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      const response = await this.client.send(command);
      const chunks = [];

      // Convert stream to buffer
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new Error(`File not found: ${path}`);
      }
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Deletes a file
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Success status
   */
  async delete(path) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Gets a file URL
   * @param {string} path - Storage path
   * @param {Object} [options] - URL options
   * @returns {string} File URL
   */
  getUrl(path, options = {}) {
    if (options.signed) {
      // Return a promise for signed URL
      return this.getSignedUrl(path, options);
    }

    // Return public URL
    return `${this.baseUrl}/${path}`;
  }

  /**
   * Gets a signed URL for temporary access
   * @param {string} path - Storage path
   * @param {Object} [options] - Signed URL options
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(path, options = {}) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    try {
      return await getSignedUrl(this.client, command, {
        expiresIn: options.expiresIn || 3600, // 1 hour default
      });
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Checks if a file exists
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Existence status
   */
  async exists(path) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Lists files in a directory
   * @param {string} [prefix] - Path prefix
   * @param {Object} [options] - List options
   * @returns {Promise<Array<{path: string, size: number, modified: Date}>>} File list
   */
  async list(prefix = '', options = {}) {
    const { maxKeys = 1000, delimiter = options.recursive ? undefined : '/' } =
      options;

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
        Delimiter: delimiter,
      });

      const response = await this.client.send(command);
      const files = [];

      if (response.Contents) {
        for (const item of response.Contents) {
          files.push({
            path: item.Key,
            size: item.Size,
            modified: item.LastModified,
          });
        }
      }

      return files;
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Gets file metadata
   * @param {string} path - Storage path
   * @returns {Promise<{size: number, modified: Date, etag: string, contentType: string}>} File metadata
   */
  async getMetadata(path) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      const response = await this.client.send(command);

      return {
        size: response.ContentLength,
        modified: response.LastModified,
        etag: response.ETag?.replace(/"/g, ''),
        contentType: response.ContentType,
      };
    } catch (error) {
      if (error.name === 'NotFound') {
        throw new Error(`File not found: ${path}`);
      }
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  /**
   * Copies a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async copy(source, destination) {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${source}`,
        Key: destination,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new Error(`Source file not found: ${source}`);
      }
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  /**
   * Moves/renames a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async move(source, destination) {
    try {
      // Copy to new location
      await this.copy(source, destination);

      // Delete original
      await this.delete(source);

      return true;
    } catch (error) {
      throw new Error(`Failed to move file: ${error.message}`);
    }
  }
}
