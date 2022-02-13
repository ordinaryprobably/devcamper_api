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

  finalQuery = Bootcamp.find(JSON.parse(queryStr));

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
  const limit = parseInt(req.query.limit, 10) || 1;
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