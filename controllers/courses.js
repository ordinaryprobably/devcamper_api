const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @description Get all courses from db (that matches the query)
 * @route       GET /api/v1/courses
 * @route       GET /api/v1/bootcamps/:bootcampId/courses
 * @access      Public
 */
exports.getCourses = asyncHandler(async (req, res, next) => {
  if(req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({ success: true, count: courses.length, data: courses});
  } else {
    res.status(200).json(res.advancedResults);
  }
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
 * @route       POST /api/v1/bootcamps/:bootcampId/courses
 * @access      Private
 */
exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if(!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
  }
  if((bootcamp.user.toString() !== req.user.id) && (req.user.role !== 'admin')) {
    return next(new ErrorResponse(`User [${req.user.id}] is not authorized to add a course to bootcamp [${bootcamp._id}].`, 401));
  }
  
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
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with ID of ${req.params.id}`, 404));
  }
  if((course.user.toString() !== req.user.id) && (req.user.role !== 'admin')) {
    return next(new ErrorResponse(`User [${req.user.id}] is not authorized to update a course to bootcamp [${course._id}].`, 401));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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
  if((course.user.toString() !== req.user.id) && (req.user.role !== 'admin')) {
    return next(new ErrorResponse(`User [${req.user.id}] is not authorized to delete a course to bootcamp [${course._id}].`, 401));
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});