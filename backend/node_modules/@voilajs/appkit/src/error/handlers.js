/**
 * @voilajs/appkit - Error handling utilities
 * @module @voilajs/appkit/error/handlers
 */

import { AppError, ErrorTypes } from './errors.js';

/**
 * Formats error for API response
 * @param {Error} error - Error to format
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error) {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      error: {
        type: error.type,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp,
      },
    };
  }

  // Handle validation errors from common libraries
  if (error.name === 'ValidationError') {
    const errors = {};

    // Mongoose validation error
    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
    }

    return {
      error: {
        type: ErrorTypes.VALIDATION,
        message: 'Validation failed',
        details: { errors },
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Handle other known error types
  if (error.name === 'CastError') {
    return {
      error: {
        type: ErrorTypes.BAD_REQUEST,
        message: 'Invalid ID format',
        details: { value: error.value },
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (error.name === 'JsonWebTokenError') {
    return {
      error: {
        type: ErrorTypes.AUTHENTICATION,
        message: 'Invalid token',
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      error: {
        type: ErrorTypes.AUTHENTICATION,
        message: 'Token expired',
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Handle duplicate key errors (MongoDB)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      error: {
        type: ErrorTypes.CONFLICT,
        message: `Duplicate value for ${field}`,
        details: { field, value: error.keyValue[field] },
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Default error response
  return {
    error: {
      type: ErrorTypes.INTERNAL,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Creates error handler middleware
 * @param {Object} [options] - Handler options
 * @param {Function} [options.logger] - Logger function
 * @param {boolean} [options.includeStack=false] - Include stack trace in response
 * @returns {Function} Express error middleware
 */
export function createErrorHandler(options = {}) {
  const { logger = console.error, includeStack = false } = options;

  return (error, req, res, next) => {
    // Log error
    logger({
      error: error.message,
      type: error.type || 'UNKNOWN',
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'], // Fixed: changed input.headers to req.headers
      },
      timestamp: new Date().toISOString(),
    });

    // Get status code
    let statusCode = 500;

    if (error instanceof AppError) {
      statusCode = error.statusCode;
    } else if (error.status) {
      statusCode = error.status;
    } else if (error.statusCode) {
      statusCode = error.statusCode;
    }

    // Format response
    const response = formatErrorResponse(error);

    // Include stack trace in development
    if (includeStack && process.env.NODE_ENV !== 'production') {
      response.error.stack = error.stack;
    }

    // Send response
    res.status(statusCode).json(response);
  };
}

/**
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Creates a not found handler middleware
 * @returns {Function} Express middleware
 */
export function notFoundHandler() {
  return (req, res, next) => {
    const error = new AppError(
      ErrorTypes.NOT_FOUND,
      `Route ${req.method} ${req.url} not found`,
      {
        method: req.method,
        url: req.url,
      },
      404
    );
    next(error);
  };
}

/**
 * Handles unhandled promise rejections
 * @param {Function} [logger] - Logger function
 */
export function handleUnhandledRejections(logger = console.error) {
  process.on('unhandledRejection', (reason, promise) => {
    logger('Unhandled Promise Rejection:', reason);

    // Exit process in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
}

/**
 * Handles uncaught exceptions
 * @param {Function} [logger] - Logger function
 */
export function handleUncaughtExceptions(logger = console.error) {
  process.on('uncaughtException', (error) => {
    logger('Uncaught Exception:', error);

    // Exit process
    process.exit(1);
  });
}

/**
 * Validates request body against schema
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        errors[detail.path.join('.')] = detail.message;
      });

      return next(validationError(errors));
    }

    next();
  };
}
