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

  sendTokenWithResponse(user, 200, res);
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
  
  sendTokenWithResponse(user, 200, res);
});

/**
 * @description Get current logged in user
 * @route       GET /api/v1/auth/me
 * @access      Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  })
})

/**
 * @description Forgot password
 * @route       POST /api/v1/auth/forgotpassword
 * @access      Public
 */
 exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if(!user) {
    return next(new ErrorResponse(`There is no user with ${req.body.email}`, 404))
  }

  const resetToken = user.getResetPasswordToken();
console.log(resetToken)
  res.status(200).json({
    success: true,
    data: user
  })
})


/**
 * @description Get token from model,
 *              create cookie and send response.
 */
function sendTokenWithResponse(userInstance, statusCode, res) {
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