/**
 * Local filesystem storage provider
 * @extends StorageProvider
 */
export class LocalProvider extends StorageProvider {
    basePath: any;
    baseUrl: any;
    /**
     * Uploads a file
     * @param {Buffer|Stream} file - File content
     * @param {string} filePath - Storage path
     * @param {Object} [options] - Upload options
     * @returns {Promise<{url: string, size: number, path: string}>} Upload result
     */
    upload(file: Buffer | Stream, filePath: string, options?: any): Promise<{
        url: string;
        size: number;
        path: string;
    }>;
    /**
     * Gets file metadata
     * @param {string} filePath - Storage path
     * @returns {Promise<{size: number, modified: Date, contentType?: string}>} File metadata
     */
    getMetadata(filePath: string): Promise<{
        size: number;
        modified: Date;
        contentType?: string;
    }>;
}
import { StorageProvider } from './base.js';
