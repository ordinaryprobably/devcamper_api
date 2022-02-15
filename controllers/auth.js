const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @description Register a user
 * @route       POST /api/v1/auth/register
 * @access      Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    password,
    email,
    role
  });

  sendTokenResponse(user, 200, res);
})

/**
 * @description Log-in user
 * @route       POST /api/v1/auth/login
 * @access      Public
 */
 exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if(!email || !password) {
    return next(new ErrorResponse(`Please provide an email and password`, 404));
  }

  const user = await User.findOne({ email: email }).select('+password');

  if(!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  const isMatch = await user.matchPassword(password);

  if(!isMatch) {
    return next(new ErrorResponse(`Wrong password`, 401));
  }
  
  sendTokenResponse(user, 200, res);
});

/**
 * @description Get token from model,
 *              create cookie and send response.
 */
function sendTokenResponse(userInstance, statusCode, res) {
  const token = userInstance.getSignedJwtToken();
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if(process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
    });
}