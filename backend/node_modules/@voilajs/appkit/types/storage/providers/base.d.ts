/**
 * @voilajs/appkit - Base storage provider
 * @module @voilajs/appkit/storage/providers/base
 */
/**
 * Base storage provider interface
 */
export class StorageProvider {
    constructor(config?: {});
    config: {};
    /**
     * Initializes the storage provider
     * @returns {Promise<void>}
     */
    initialize(): Promise<void>;
    /**
     * Uploads a file
     * @param {Buffer|Stream} file - File content
     * @param {string} path - Storage path
     * @param {Object} [options] - Upload options
     * @returns {Promise<{url: string, size: number, etag?: string}>} Upload result
     */
    upload(file: Buffer | Stream, path: string, options?: any): Promise<{
        url: string;
        size: number;
        etag?: string;
    }>;
    /**
     * Downloads a file
     * @param {string} path - Storage path
     * @returns {Promise<Buffer>} File content
     */
    download(path: string): Promise<Buffer>;
    /**
     * Deletes a file
     * @param {string} path - Storage path
     * @returns {Promise<boolean>} Success status
     */
    delete(path: string): Promise<boolean>;
    /**
     * Gets a file URL
     * @param {string} path - Storage path
     * @param {Object} [options] - URL options
     * @returns {string} File URL
     */
    getUrl(path: string, options?: any): string;
    /**
     * Checks if a file exists
     * @param {string} path - Storage path
     * @returns {Promise<boolean>} Existence status
     */
    exists(path: string): Promise<boolean>;
    /**
     * Lists files in a directory
     * @param {string} [prefix] - Path prefix
     * @param {Object} [options] - List options
     * @returns {Promise<Array<{path: string, size: number, modified: Date}>>} File list
     */
    list(prefix?: string, options?: any): Promise<Array<{
        path: string;
        size: number;
        modified: Date;
    }>>;
    /**
     * Gets file metadata
     * @param {string} path - Storage path
     * @returns {Promise<{size: number, modified: Date, etag?: string, contentType?: string}>} File metadata
     */
    getMetadata(path: string): Promise<{
        size: number;
        modified: Date;
        etag?: string;
        contentType?: string;
    }>;
    /**
     * Copies a file
     * @param {string} source - Source path
     * @param {string} destination - Destination path
     * @returns {Promise<boolean>} Success status
     */
    copy(source: string, destination: string): Promise<boolean>;
    /**
     * Moves/renames a file
     * @param {string} source - Source path
     * @param {string} destination - Destination path
     * @returns {Promise<boolean>} Success status
     */
    move(source: string, destination: string): Promise<boolean>;
}
