/**
 * Initializes storage provider
 * @param {string} provider - Provider type ('local', 's3')
 * @param {Object} config - Provider configuration
 * @returns {Promise<StorageProvider>} Storage provider instance
 * @throws {Error} If provider is already initialized or invalid
 */
export function initStorage(provider: string, config?: any): Promise<StorageProvider>;
/**
 * Gets current storage instance
 * @returns {StorageProvider} Storage provider instance
 * @throws {Error} If storage is not initialized
 */
export function getStorage(): StorageProvider;
