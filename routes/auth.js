const express = require('express');
const { register, login } = require('../controllers/auth');
const courseRouter = require('./courses');
const router = express.Router();

/**
 * @route /api/v1/auth
 */
router.route('/register')
  .post(register);

router.route('/login')
  .post(login);

module.exports = router;