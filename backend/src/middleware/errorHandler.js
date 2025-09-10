/**
 * Global error handling middleware
 */
export const errorHandler = (error, req, res, _next) => {
  console.error('Error caught by error handler:', error);

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';
  let errors = null;

  // Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = error.errors.map(err => ({
      field: err.path,
      message: err.message,
    }));
  }

  // Sequelize unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
    errors = error.errors.map(err => ({
      field: err.path,
      message: `${err.path} already exists`,
    }));
  }

  // Sequelize foreign key errors
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Multer errors (file upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }

  // Custom application errors
  if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Send error response
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
};

/**
 * Middleware to handle 404 errors
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};