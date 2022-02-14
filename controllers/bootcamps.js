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
  const removeFields = ['select', 'sort', 'page', 'limit'];
  const initialQuery = { ...req.query };
  let finalQuery;
  
  removeFields.forEach(field => delete initialQuery[field]);
  
  const queryStr = 
    JSON.stringify(initialQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  finalQuery = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  if(req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    finalQuery = finalQuery.select(fields);
  }
  if(req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    finalQuery = finalQuery.sort(sortBy);
  } else {
    finalQuery = finalQuery.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  finalQuery = finalQuery.skip(startIndex).limit(limit);

  const bootcamps = await finalQuery;

  const pagination = {};

  if(endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    }
  }
  if(startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    }
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination: pagination,
    data: bootcamps,
  });
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
  const bootcamp = await Bootcamp.findById(req.params.id);

  if(!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404));
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