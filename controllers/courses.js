const asyncHandler = require('../middleware/async');
const Course = require('../models/course');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @description Get all courses from db (that matches the query)
 * @route       GET /api/v1/courses
 * @route       GET /api/v1/bootcamps/:bootcampId/courses
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
});

/**
 * @description Get a course with matching ID
 * @route       GET /api/v1/courses
 * @access      Public
 */
exports.getSingleCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if(!course) {
    return next(new ErrorResponse(`Course not found with ID of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

/**
 * @description Save new course to DB 
 * @route       POST /api/v1/courses
 * @access      Private
 */
exports.createCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  })
});

/**
 * @description Update a course with new data
 * @route       PUT /api/v1/courses/:id
 * @access      Private
 */
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    return next(new ErrorResponse(`Course not found with ID of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

/**
 * @description Delete a course
 * @route       DELETE /api/v1/courses/:id
 * @access      Private
 */
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with ID of ${req.params.id}`, 404));
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});