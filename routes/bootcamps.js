const express = require('express');
const courseRouter = require('./courses');
const router = express.Router();
const { 
  getBootcamps, 
  getSingleBootcamp, 
  createBootcamp, 
  updateBootcamp, 
  deleteBootcamp,
  getBootcampsInRadius,
} = require('../controllers/bootcamps');

/**
 * @description When '/api/v1/bootcamps/:bootcampId/courses' hits, 
 *              use the router function in ./courses.js 
 */
router.use('/:bootcampId/courses', courseRouter);

/**
 * @route /api/v1/bootcamps
 */
router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);
  
router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

router 
  .route('/:id')
  .get(getSingleBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;

// router.get('/', (req, res) => {
//   res.status(200).json({ success: true, msg: 'Show all bootcamps' });
// });
// router.get('/:id', (req, res) => {
//   res.status(200).json({ success: true, msg: `Get bootcamp of id: ${req.params.id}` });
// });
// router.post('/', (req, res) => {
//   res.status(200).json({ success: true, msg: 'Create new bootcamp' });
// });
// router.put('/:id', (req, res) => {
//   res.status(200).json({ success: true, msg: `Update bootcamp of id: ${req.params.id}` });
// });
// router.delete('/:id', (req, res) => {
//   res.status(200).json({ success: true, msg: `Delete bootcamp of id: ${req.params.id}` });
// });