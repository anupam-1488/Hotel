/**
 * @voilajs/appkit - Storage manager
 * @module @voilajs/appkit/storage/manager
 */

import { LocalProvider } from './providers/local.js';
import { S3Provider } from './providers/s3.js';

let storageInstance = null;

/**
 * Initializes storage provider
 * @param {string} provider - Provider type ('local', 's3')
 * @param {Object} config - Provider configuration
 * @returns {Promise<StorageProvider>} Storage provider instance
 * @throws {Error} If provider is already initialized or invalid
 */
export async function initStorage(provider, config = {}) {
  if (storageInstance) {
    throw new Error('Storage already initialized');
  }

  switch (provider) {
    case 'local':
      storageInstance = new LocalProvider(config);
      break;
    case 's3':
      storageInstance = new S3Provider(config);
      break;
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }

  await storageInstance.initialize();
  return storageInstance;
}

/**
 * Gets current storage instance
 * @returns {StorageProvider} Storage provider instance
 * @throws {Error} If storage is not initialized
 */
export function getStorage() {
  if (!storageInstance) {
    throw new Error('Storage not initialized. Call initStorage() first.');
  }
  return storageInstance;
}