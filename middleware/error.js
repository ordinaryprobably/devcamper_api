const ErrorResponse = require("../utils/errorResponse");

function errorHandler(err, req, res, next) {
  console.log(err);
  
  let error = { ...err };

  error.message = err.message; // This is because err.message is not enumerable.
  
  // Occurs when requested BAD ID to MongoDB
  if(err.name === 'CastError') {
    const message = `Resource not found with ID of ${err.value}`;

    error = new ErrorResponse(message, 404);
  }

  if(err.code === 11000) {
    const message = `Duplicate field value`;

    error = new ErrorResponse(message, 400);
  }

  if(err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);

    error = new ErrorResponse(message, 400);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
}

module.exports = errorHandler;