const express = require('express');
const { register, login, getMe, forgotPassword } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const courseRouter = require('./courses');
const router = express.Router();

/**
 * @route /api/v1/auth
 */
router.route('/register')
  .post(register);

router.route('/login')
  .post(login);

router.route('/me')
  .get(protect, getMe);

router.route('/forgotPassword')
  .post(forgotPassword);
module.exports = router;