const asyncHandler = require('../middleware/async');
const Course = require('../models/course');

/**
 * @description Get all courses from db (that matches the query)
 * @route       /api/v1/courses
 * @route       /api/v1/bootcamps/:bootcampId/courses
 * @access      Public
 */
exports.getCourses = asyncHandler(async (req, res, next) => {
  let finalQuery;

  if(req.params.bootcampId) {
    finalQuery = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    finalQuery = Course.find().populate({ path: 'bootcamp', select: 'name description'});
  }

  const courses = await finalQuery;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  })
})