/**
 * @module utils/async
 * @description Asynchronous operation utilities for @voilajs/appkit
 */
/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after delay
 * @throws {Error} If ms is not a positive number
 */
export function sleep(ms: number): Promise<void>;
/**
 * Retries a function on failure with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.attempts - Maximum number of attempts (default: 3)
 * @param {number} options.delay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {number} options.factor - Exponential backoff factor (default: 2)
 * @param {Function} options.onRetry - Callback on each retry
 * @param {Function} options.retryIf - Function to determine if should retry based on error
 * @returns {Promise<any>} Result of successful function execution
 * @throws {Error} If all retry attempts fail
 */
export function retry(fn: Function, options?: {
    attempts: number;
    delay: number;
    maxDelay: number;
    factor: number;
    onRetry: Function;
    retryIf: Function;
}): Promise<any>;
/**
 * Adds timeout to a promise
 * @param {Promise} promise - Promise to add timeout to
 * @param {number} ms - Timeout in milliseconds
 * @param {string|Error} timeoutError - Error to throw on timeout
 * @returns {Promise<any>} Promise that rejects on timeout
 * @throws {Error} If promise is not a Promise or ms is not a positive number
 */
export function timeout(promise: Promise<any>, ms: number, timeoutError?: string | Error): Promise<any>;
/**
 * Runs multiple promises in parallel with concurrency limit
 * @param {Array<Function>} tasks - Array of functions that return promises
 * @param {number} concurrency - Maximum number of concurrent executions
 * @returns {Promise<Array>} Array of results
 * @throws {Error} If tasks is not an array or concurrency is invalid
 */
export function parallel(tasks: Array<Function>, concurrency?: number): Promise<any[]>;
/**
 * Runs promises in series
 * @param {Array<Function>} tasks - Array of functions that return promises
 * @returns {Promise<Array>} Array of results
 * @throws {Error} If tasks is not an array
 */
export function series(tasks: Array<Function>): Promise<any[]>;
/**
 * Debounces a function
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {Object} options - Debounce options
 * @param {boolean} options.leading - Invoke on leading edge (default: false)
 * @param {boolean} options.trailing - Invoke on trailing edge (default: true)
 * @returns {Function} Debounced function
 */
export function debounce(fn: Function, wait: number, options?: {
    leading: boolean;
    trailing: boolean;
}): Function;
/**
 * Throttles a function
 * @param {Function} fn - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @param {Object} options - Throttle options
 * @param {boolean} options.leading - Invoke on leading edge (default: true)
 * @param {boolean} options.trailing - Invoke on trailing edge (default: true)
 * @returns {Function} Throttled function
 */
export function throttle(fn: Function, wait: number, options?: {
    leading: boolean;
    trailing: boolean;
}): Function;
/**
 * Maps over array with async function and concurrency limit
 * @param {Array} array - Array to map over
 * @param {Function} mapper - Async mapper function
 * @param {number} concurrency - Maximum concurrent executions
 * @returns {Promise<Array>} Mapped results
 */
export function mapAsync(array: any[], mapper: Function, concurrency?: number): Promise<any[]>;
/**
 * Filters array with async predicate
 * @param {Array} array - Array to filter
 * @param {Function} predicate - Async predicate function
 * @param {number} concurrency - Maximum concurrent executions
 * @returns {Promise<Array>} Filtered array
 */
export function filterAsync(array: any[], predicate: Function, concurrency?: number): Promise<any[]>;
/**
 * Creates a promise that resolves after all provided promises settle
 * @param {Array<Promise>} promises - Array of promises
 * @returns {Promise<Array>} Array of settlement results
 */
export function allSettled(promises: Array<Promise<any>>): Promise<any[]>;
/**
 * Race promises with timeout
 * @param {Array<Promise>} promises - Array of promises
 * @param {number} ms - Timeout in milliseconds
 * @param {string|Error} timeoutError - Error to throw on timeout
 * @returns {Promise<any>} Result of first resolved promise
 */
export function raceWithTimeout(promises: Array<Promise<any>>, ms: number, timeoutError?: string | Error): Promise<any>;
/**
 * Deferred promise implementation
 * @returns {Object} Object with promise and resolve/reject methods
 */
export function deferred(): any;
/**
 * Queues async tasks with concurrency limit
 * @param {number} concurrency - Maximum concurrent tasks
 * @returns {Object} Queue object with push and wait methods
 */
export function createQueue(concurrency?: number): any;
