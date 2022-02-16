const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

/**
 * @description Get all bootcamps
 * @route       GET /api/v1/bootcamps
 * @access      Public
 */
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
})

/**
 * @description Get a single bootcamp
 * @route       GET /api/v1/bootcamps/:id
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
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if(publishedBootcamp && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User [${req.user.id}] has already published a bootcamp.`, 400));
  }

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
  let bootcamp = await Bootcamp.findById(req.params.id);

  if(!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
  }
  if((bootcamp.user.toString() !== req.user.id) && (req.user.role !== 'admin')) {
    return next(new ErrorResponse(`User [${req.params.id}] is not authorized to update this bootcamp.`, 401));
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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
  const bootcamp = await Bootcamp.findById(req.params.id);

  if(!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
  }
  if((bootcamp.user.toString() !== req.user.id) && (req.user.role !== 'admin')) {
    return next(new ErrorResponse(`User [${req.params.id}] is not authorized to delete this bootcamp.`, 401));
  }

  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
})

/**
 * @description Get bootcamps within a radius
 * @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
 * @access      Private
 * @reference   https://docs.mongodb.com/manual/reference/operator/query/centerSphere/
 */
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get latititude and longitude from given zipcode.
  const loc = await geocoder.geocode(zipcode);
  const latitude = loc[0].latitude;
  const longitude = loc[0].longitude;

  // Calculate the radius
  // radius = Divide the distance by the radius of Earth.
  // Earth radius = 6,373 km
  const radius = distance / 6373
  
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [ [ longitude, latitude ], radius ] }
    }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  })
})

/**
 * @description Upload photo for bootcamp
 * @route       PUT /api/v1/bootcamps/:id/photo
 * @access      Private
 */
 exports.uploadPhotoBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if(!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
  }
  if((bootcamp.user.toString() !== req.user.id) && (req.user.role !== 'admin')) {
    return next(new ErrorResponse(`User [${req.params.id}] is not authorized to delete this bootcamp.`, 401));
  }

  if(!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  if(!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please only upload an image file`, 400));
  }

  if(file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if(err) {
      console.error(err);
      return next(new ErrorResponse(`There was a problem while uploading the file`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({ success: true, data: file.name });
  });
})