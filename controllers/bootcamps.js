const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @description Get all bootcamps
 * @route       GET /api/v1/bootcamps
 * @access      Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
})

/**
 * @description Get a single bootcamp
 * @route       GET /api/v1/bootcamps:id
 * @access      Public
 */
exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if(!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
})

/**
 * @description Create a bootcamp
 * @route       POST /api/v1/bootcamps
 * @access      Private
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  })
})

/**
 * @description Update a bootcamp
 * @route       PUT /api/v1/bootcamps/:id
 * @access      Private
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if(!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
})

/**
 * @description Delete a bootcamp
 * @route       DELETE /api/v1/bootcamps/:id
 * @access      Private
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if(!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: {} });
})