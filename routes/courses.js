const express = require('express');
const router = express.Router({ mergeParams: true });
const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');
const { getCourses, getSingleCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const { protect } = require('../middleware/auth');

/**
 * @route /api/v1/courses
 * @route /api/v1/bootcamp/:bootcampId/courses
 */
router.route('/')
  .get(advancedResults(Course, { path: 'bootcamp', select: 'name description'}) ,getCourses)
  .post(protect, createCourse);

router.route('/:id')
  .get(getSingleCourse)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

module.exports = router;

/**
 * const router = express.Router({ mergeParams: true });
 * 
 * this is for allowing ./bootcamp.js re-route to courses.js
 * when /api/v1/bootcamps/:bootcampId/courses' hits.
 */