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
  uploadPhotoBootcamp,
} = require('../controllers/bootcamps');

/**
 * @description /bootcamps/:bootcampId/courses 로 들어오는 요청은
 *              courseRouter 의 함수를 사용하겠다는 의미다. 
 */
router.use('/:bootcampId/courses', courseRouter);

/**
 * @route /api/v1/bootcamps
 */
router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius);
  
router
  .route('/:id/photo')
  .put(uploadPhotoBootcamp);

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