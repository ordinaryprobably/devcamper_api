const ErrorResponse = require("../utils/errorResponse");

function errorHandler(err, req, res, next) {
  console.log(err.stack.red);
  
  let error = { ...err };

  error.message = err.message; // This is because err.message is not enumerable.
  
  if(err.name === 'CastError') {
    const message = `Resource not found with ID of ${err.value}`;

    error = new ErrorResponse(message, 404);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
}

module.exports = errorHandler;