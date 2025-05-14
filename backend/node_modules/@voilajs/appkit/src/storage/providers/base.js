/**
 * @voilajs/appkit - Base storage provider
 * @module @voilajs/appkit/storage/providers/base
 */

/**
 * Base storage provider interface
 */
export class StorageProvider {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Initializes the storage provider
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Uploads a file
   * @param {Buffer|Stream} file - File content
   * @param {string} path - Storage path
   * @param {Object} [options] - Upload options
   * @returns {Promise<{url: string, size: number, etag?: string}>} Upload result
   */
  async upload(file, path, options = {}) {
    throw new Error('upload() must be implemented by subclass');
  }

  /**
   * Downloads a file
   * @param {string} path - Storage path
   * @returns {Promise<Buffer>} File content
   */
  async download(path) {
    throw new Error('download() must be implemented by subclass');
  }

  /**
   * Deletes a file
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Success status
   */
  async delete(path) {
    throw new Error('delete() must be implemented by subclass');
  }

  /**
   * Gets a file URL
   * @param {string} path - Storage path
   * @param {Object} [options] - URL options
   * @returns {string} File URL
   */
  getUrl(path, options = {}) {
    throw new Error('getUrl() must be implemented by subclass');
  }

  /**
   * Checks if a file exists
   * @param {string} path - Storage path
   * @returns {Promise<boolean>} Existence status
   */
  async exists(path) {
    throw new Error('exists() must be implemented by subclass');
  }

  /**
   * Lists files in a directory
   * @param {string} [prefix] - Path prefix
   * @param {Object} [options] - List options
   * @returns {Promise<Array<{path: string, size: number, modified: Date}>>} File list
   */
  async list(prefix = '', options = {}) {
    throw new Error('list() must be implemented by subclass');
  }

  /**
   * Gets file metadata
   * @param {string} path - Storage path
   * @returns {Promise<{size: number, modified: Date, etag?: string, contentType?: string}>} File metadata
   */
  async getMetadata(path) {
    throw new Error('getMetadata() must be implemented by subclass');
  }

  /**
   * Copies a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async copy(source, destination) {
    throw new Error('copy() must be implemented by subclass');
  }

  /**
   * Moves/renames a file
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async move(source, destination) {
    throw new Error('move() must be implemented by subclass');
  }
}
