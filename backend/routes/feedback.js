const express = require('express');
const router = express.Router();
const { createFeedback, listFeedback, updateFeedback } = require('../controllers/feedbackController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public or authenticated users can create
router.post('/', protect, createFeedback);
router.post('/public', createFeedback);

// Admin endpoints
router.get('/', protect, admin, listFeedback);
router.put('/:id', protect, admin, updateFeedback);

module.exports = router;