const express = require('express');
const router = express.Router();
const { getExpandedSlots, createBooking } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/lawyers/:lawyerId/slots', getExpandedSlots);
router.post('/', protect, createBooking);

module.exports = router;