/**
 * @voilajs/appkit - Cache instance manager
 * @module @voilajs/appkit/cache/manager
 */

import { createCache } from './factory.js';

// Cache instances registry
const instances = new Map();

/**
 * Creates and registers a named cache instance
 * @param {string} name - Instance name
 * @param {Object} options - Cache options (strategy, connection details, etc.)
 * @returns {Promise<Object>} Cache instance
 * @throws {Error} If an instance with the same name already exists
 */
export async function createNamedCache(name, options) {
  if (instances.has(name)) {
    throw new Error(`Cache instance "${name}" already exists`);
  }

  const instance = await createCache(options);
  instances.set(name, instance);

  return instance;
}

/**
 * Gets a previously created cache instance by name
 * @param {string} name - Instance name
 * @returns {Object} Cache instance
 * @throws {Error} If the named instance doesn't exist
 */
export function getNamedCache(name) {
  const instance = instances.get(name);

  if (!instance) {
    throw new Error(`Cache instance "${name}" not found`);
  }

  return instance;
}

/**
 * Checks if a named cache instance exists
 * @param {string} name - Instance name
 * @returns {boolean} True if the instance exists
 */
export function hasNamedCache(name) {
  return instances.has(name);
}

/**
 * Closes and removes a named cache instance
 * @param {string} name - Instance name
 * @returns {Promise<boolean>} True if the instance was removed
 */
export async function removeNamedCache(name) {
  const instance = instances.get(name);

  if (!instance) {
    return false;
  }

  await instance.disconnect();
  return instances.delete(name);
}

/**
 * Closes and removes all cache instances
 * @returns {Promise<void>}
 */
export async function clearAllCaches() {
  const closePromises = Array.from(instances.values()).map((instance) =>
    instance.disconnect()
  );

  await Promise.all(closePromises);
  instances.clear();
}

/**
 * Gets all registered cache instance names
 * @returns {string[]} Array of instance names
 */
export function getCacheNames() {
  return Array.from(instances.keys());
}
