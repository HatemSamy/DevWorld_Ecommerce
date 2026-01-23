import { ApiError } from '../utils/ApiError.js';

/**
 * Centralized error handling middleware
 * Handles all errors from the application and formats consistent responses
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.message);
    if (err.stack) {
      console.error('Stack:', err.stack);
    }
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      errors: err.errors || null
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map(e => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path || 'data'} format`,
      errors: [{ field: err.path, message: err.message }]
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum allowed size is 10MB per file.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Please check the upload limit.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please check your upload field names.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

export default errorHandler;
