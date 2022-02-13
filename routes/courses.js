const express = require('express');
const { getCourses } = require('../controllers/courses');
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getCourses);

module.exports = router;

/**
 * const router = express.Router({ mergeParams: true });
 * 
 * this is for allowing ./bootcamp.js re-route to courses.js
 * when /api/v1/bootcamps/:bootcampId/courses' hits.
 */