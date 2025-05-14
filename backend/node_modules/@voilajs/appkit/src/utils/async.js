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
export function sleep(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    throw new Error('Delay must be a positive number');
  }

  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
export async function retry(fn, options = {}) {
  if (typeof fn !== 'function') {
    throw new Error('First argument must be a function');
  }

  const {
    attempts = 3,
    delay = 1000,
    maxDelay = 10000,
    factor = 2,
    onRetry,
    retryIf = () => true,
  } = options;

  if (attempts < 1) {
    throw new Error('Attempts must be at least 1');
  }

  let lastError;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === attempts || !retryIf(error)) {
        throw error;
      }

      // Call onRetry callback if provided
      if (typeof onRetry === 'function') {
        onRetry(error, attempt, currentDelay);
      }

      // Wait before next attempt
      await sleep(currentDelay);

      // Calculate next delay with exponential backoff
      currentDelay = Math.min(currentDelay * factor, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Adds timeout to a promise
 * @param {Promise} promise - Promise to add timeout to
 * @param {number} ms - Timeout in milliseconds
 * @param {string|Error} timeoutError - Error to throw on timeout
 * @returns {Promise<any>} Promise that rejects on timeout
 * @throws {Error} If promise is not a Promise or ms is not a positive number
 */
export function timeout(promise, ms, timeoutError = 'Operation timed out') {
  if (!promise || typeof promise.then !== 'function') {
    throw new Error('First argument must be a Promise');
  }

  if (typeof ms !== 'number' || ms < 0) {
    throw new Error('Timeout must be a positive number');
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        timeoutError instanceof Error ? timeoutError : new Error(timeoutError)
      );
    }, ms);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Runs multiple promises in parallel with concurrency limit
 * @param {Array<Function>} tasks - Array of functions that return promises
 * @param {number} concurrency - Maximum number of concurrent executions
 * @returns {Promise<Array>} Array of results
 * @throws {Error} If tasks is not an array or concurrency is invalid
 */
export async function parallel(tasks, concurrency = Infinity) {
  if (!Array.isArray(tasks)) {
    throw new Error('Tasks must be an array');
  }

  if (typeof concurrency !== 'number' || concurrency < 1) {
    throw new Error('Concurrency must be a positive number');
  }

  const results = [];
  const executing = new Set();

  for (const [index, task] of tasks.entries()) {
    const promise = (async () => {
      try {
        const result = await task();
        results[index] = result;
      } catch (error) {
        results[index] = { error };
      }
    })();

    executing.add(promise);
    promise.finally(() => executing.delete(promise));

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Runs promises in series
 * @param {Array<Function>} tasks - Array of functions that return promises
 * @returns {Promise<Array>} Array of results
 * @throws {Error} If tasks is not an array
 */
export async function series(tasks) {
  if (!Array.isArray(tasks)) {
    throw new Error('Tasks must be an array');
  }

  const results = [];

  for (const task of tasks) {
    try {
      results.push(await task());
    } catch (error) {
      results.push({ error });
    }
  }

  return results;
}

/**
 * Debounces a function
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {Object} options - Debounce options
 * @param {boolean} options.leading - Invoke on leading edge (default: false)
 * @param {boolean} options.trailing - Invoke on trailing edge (default: true)
 * @returns {Function} Debounced function
 */
export function debounce(fn, wait, options = {}) {
  if (typeof fn !== 'function') {
    throw new Error('First argument must be a function');
  }

  if (typeof wait !== 'number' || wait < 0) {
    throw new Error('Wait must be a positive number');
  }

  const { leading = false, trailing = true } = options;

  let timeout;
  let lastCallTime;
  let lastThis;
  let lastArgs;

  const later = () => {
    const last = Date.now() - lastCallTime;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (trailing && lastArgs) {
        const result = fn.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
        return result;
      }
    }
  };

  const debounced = function (...args) {
    const now = Date.now();
    const isInvoking = leading && !timeout;

    lastCallTime = now;
    lastArgs = args;
    lastThis = this;

    if (!timeout) {
      timeout = setTimeout(later, wait);
    }

    if (isInvoking) {
      const result = fn.apply(this, args);
      lastArgs = lastThis = null;
      return result;
    }
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastArgs = lastThis = null;
  };

  return debounced;
}

/**
 * Throttles a function
 * @param {Function} fn - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @param {Object} options - Throttle options
 * @param {boolean} options.leading - Invoke on leading edge (default: true)
 * @param {boolean} options.trailing - Invoke on trailing edge (default: true)
 * @returns {Function} Throttled function
 */
export function throttle(fn, wait, options = {}) {
  if (typeof fn !== 'function') {
    throw new Error('First argument must be a function');
  }

  if (typeof wait !== 'number' || wait < 0) {
    throw new Error('Wait must be a positive number');
  }

  const { leading = true, trailing = true } = options;

  let timeout;
  let lastCallTime = 0;
  let lastThis;
  let lastArgs;

  const later = () => {
    lastCallTime = leading ? Date.now() : 0;
    timeout = null;
    if (lastArgs) {
      const result = fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
      return result;
    }
  };

  const throttled = function (...args) {
    const now = Date.now();

    if (!lastCallTime && !leading) {
      lastCallTime = now;
    }

    const remaining = wait - (now - lastCallTime);

    lastThis = this;
    lastArgs = args;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCallTime = now;
      const result = fn.apply(this, args);
      lastArgs = lastThis = null;
      return result;
    } else if (!timeout && trailing) {
      timeout = setTimeout(later, remaining);
    }
  };

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastCallTime = 0;
    lastArgs = lastThis = null;
  };

  return throttled;
}

/**
 * Maps over array with async function and concurrency limit
 * @param {Array} array - Array to map over
 * @param {Function} mapper - Async mapper function
 * @param {number} concurrency - Maximum concurrent executions
 * @returns {Promise<Array>} Mapped results
 */
export async function mapAsync(array, mapper, concurrency = Infinity) {
  if (!Array.isArray(array)) {
    throw new Error('First argument must be an array');
  }

  if (typeof mapper !== 'function') {
    throw new Error('Mapper must be a function');
  }

  const tasks = array.map((item, index) => () => mapper(item, index, array));
  return parallel(tasks, concurrency);
}

/**
 * Filters array with async predicate
 * @param {Array} array - Array to filter
 * @param {Function} predicate - Async predicate function
 * @param {number} concurrency - Maximum concurrent executions
 * @returns {Promise<Array>} Filtered array
 */
export async function filterAsync(array, predicate, concurrency = Infinity) {
  if (!Array.isArray(array)) {
    throw new Error('First argument must be an array');
  }

  if (typeof predicate !== 'function') {
    throw new Error('Predicate must be a function');
  }

  const results = await mapAsync(array, predicate, concurrency);
  return array.filter((_, index) => results[index]);
}

/**
 * Creates a promise that resolves after all provided promises settle
 * @param {Array<Promise>} promises - Array of promises
 * @returns {Promise<Array>} Array of settlement results
 */
export function allSettled(promises) {
  if (!Array.isArray(promises)) {
    throw new Error('First argument must be an array of promises');
  }

  return Promise.all(
    promises.map((promise) =>
      Promise.resolve(promise)
        .then((value) => ({ status: 'fulfilled', value }))
        .catch((reason) => ({ status: 'rejected', reason }))
    )
  );
}

/**
 * Race promises with timeout
 * @param {Array<Promise>} promises - Array of promises
 * @param {number} ms - Timeout in milliseconds
 * @param {string|Error} timeoutError - Error to throw on timeout
 * @returns {Promise<any>} Result of first resolved promise
 */
export function raceWithTimeout(promises, ms, timeoutError = 'Race timed out') {
  if (!Array.isArray(promises)) {
    throw new Error('First argument must be an array of promises');
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          timeoutError instanceof Error ? timeoutError : new Error(timeoutError)
        ),
      ms
    )
  );

  return Promise.race([...promises, timeoutPromise]);
}

/**
 * Deferred promise implementation
 * @returns {Object} Object with promise and resolve/reject methods
 */
export function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Queues async tasks with concurrency limit
 * @param {number} concurrency - Maximum concurrent tasks
 * @returns {Object} Queue object with push and wait methods
 */
export function createQueue(concurrency = 1) {
  if (typeof concurrency !== 'number' || concurrency < 1) {
    throw new Error('Concurrency must be a positive number');
  }

  const queue = [];
  const running = new Set();

  const process = async () => {
    if (queue.length === 0 || running.size >= concurrency) {
      return;
    }

    const { task, resolve, reject } = queue.shift();
    const promise = (async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    })();

    running.add(promise);
    promise.finally(() => {
      running.delete(promise);
      process();
    });
  };

  return {
    push(task) {
      return new Promise((resolve, reject) => {
        queue.push({ task, resolve, reject });
        process();
      });
    },

    wait() {
      return Promise.all(running);
    },

    size() {
      return queue.length + running.size;
    },

    clear() {
      queue.length = 0;
    },
  };
}
