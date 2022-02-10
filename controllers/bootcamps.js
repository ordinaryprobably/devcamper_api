/**
 * @description Get all bootcamps
 * @route       GET /api/v1/bootcamps
 * @access      Public
 */
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show all bootcamps' });
}

/**
 * @description Get a single bootcamp
 * @route       GET /api/v1/bootcamps:id
 * @access      Public
 */
 exports.getSingleBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Get bootcamp of id: ${req.params.id}` });
}

/**
 * @description Create a bootcamp
 * @route       POST /api/v1/bootcamps
 * @access      Private
 */
 exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Create new bootcamp' });
}

/**
 * @description Update a bootcamp
 * @route       PUT /api/v1/bootcamps/:id
 * @access      Private
 */
 exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Update new bootcamp' });
}

/**
 * @description Delete a bootcamp
 * @route       DELETE /api/v1/bootcamps/:id
 * @access      Private
 */
 exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Delete bootcamp of id: ${req.params.id}` });
}