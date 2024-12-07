/**
 * Custom Error Class for Application-wide Error Handling
 * Provides more detailed and structured error information
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null, details = {}) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errorCode = errorCode;
    this.details = details;

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Static method to create common error types
   */
  static create = {
    badRequest: (message, details = {}) => 
      new AppError(message, 400, 'BAD_REQUEST', details),
    unauthorized: (message, details = {}) => 
      new AppError(message, 401, 'UNAUTHORIZED', details),
    forbidden: (message, details = {}) => 
      new AppError(message, 403, 'FORBIDDEN', details),
    notFound: (message, details = {}) => 
      new AppError(message, 404, 'NOT_FOUND', details),
    conflict: (message, details = {}) => 
      new AppError(message, 409, 'CONFLICT', details),
    internalServer: (message, details = {}) => 
      new AppError(message, 500, 'INTERNAL_SERVER_ERROR', details)
  };
}

module.exports = AppError;
