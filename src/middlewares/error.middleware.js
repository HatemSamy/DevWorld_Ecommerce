// src/middlewares/errorHandler.js
import { ApiError } from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
  // Log unexpected errors for debugging
  console.error(err.stack || err);

  // Handle custom ApiError (for your business logic)
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      errors: err.errors || null
    });
  }

  // Handle any other unknown errors
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
};

export default errorHandler;
