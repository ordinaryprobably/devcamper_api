const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("./async");

/**
 * @description Allow only logged in users to visit certain routes.
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if(req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
  
  if(!token) {
    return next(new ErrorResponse('Not authorized to access this route.', 401));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedToken.id);
    next();
  }
  catch(err) {
    return next(new ErrorResponse('Not authorized to access this route.', 401));
  }
});

/**
 * @description Grant access to specific roles.
 */
exports.authorize = (...roles) => {
  return function(req, res, next) {
    if(!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role [${req.user.role}] is not authorized to access this route`, 403));
    }

    next();
  }
}