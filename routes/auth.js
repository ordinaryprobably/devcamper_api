const express = require('express');
const { register } = require('../controllers/auth');
const courseRouter = require('./courses');
const router = express.Router();

/**
 * @route /api/v1/auth
 */
router.route('/register')
  .post(register)

module.exports = router;