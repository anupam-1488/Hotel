/**
 * AWS S3 storage provider
 * @extends StorageProvider
 */
export class S3Provider extends StorageProvider {
    bucket: any;
    region: any;
    credentials: any;
    endpoint: any;
    forcePathStyle: any;
    publicRead: any;
    baseUrl: any;
    client: S3Client;
    /**
     * Uploads a file
     * @param {Buffer|Stream} file - File content
     * @param {string} path - Storage path
     * @param {Object} [options] - Upload options
     * @returns {Promise<{url: string, size: number, etag: string}>} Upload result
     */
    upload(file: Buffer | Stream, path: string, options?: any): Promise<{
        url: string;
        size: number;
        etag: string;
    }>;
    /**
     * Gets a signed URL for temporary access
     * @param {string} path - Storage path
     * @param {Object} [options] - Signed URL options
     * @returns {Promise<string>} Signed URL
     */
    getSignedUrl(path: string, options?: any): Promise<string>;
    /**
     * Gets file metadata
     * @param {string} path - Storage path
     * @returns {Promise<{size: number, modified: Date, etag: string, contentType: string}>} File metadata
     */
    getMetadata(path: string): Promise<{
        size: number;
        modified: Date;
        etag: string;
        contentType: string;
    }>;
}
import { StorageProvider } from './base.js';
import { S3Client } from '@aws-sdk/client-s3';
