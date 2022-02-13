const express = require('express');
const { getCourses, getSingleCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/courses');
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getCourses)
  .post(createCourse);

router.route('/:id')
  .get(getSingleCourse)
  .put(updateCourse)
  .delete(deleteCourse);

module.exports = router;

/**
 * const router = express.Router({ mergeParams: true });
 * 
 * this is for allowing ./bootcamp.js re-route to courses.js
 * when /api/v1/bootcamps/:bootcampId/courses' hits.
 */