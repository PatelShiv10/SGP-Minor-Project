const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createLawyerFeedback,
  getLawyerFeedback,
  getLawyerFeedbackSummary,
  getPendingFeedback,
  approveFeedback,
  respondToFeedback,
  markFeedbackHelpful
} = require('../controllers/lawyerFeedbackController');
const { protect, admin, lawyer } = require('../middlewares/authMiddleware');

// Validation middleware for creating feedback
const validateFeedback = [
  body('lawyerId')
    .notEmpty()
    .withMessage('Lawyer ID is required')
    .isMongoId()
    .withMessage('Invalid lawyer ID format'),
  
  body('rating')
    .toInt()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('comment')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Comment must be between 5 and 1000 characters'),
  
  body('serviceType')
    .optional()
    .isIn(['consultation', 'document_review', 'legal_advice', 'representation', 'other'])
    .withMessage('Invalid service type')
];

// Validation for response
const validateResponse = [
  body('message')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Response message must be between 5 and 500 characters')
];

// Create new feedback requires auth to bind to user
router.post('/', protect, validateFeedback, createLawyerFeedback);

// Get feedback for a specific lawyer (public)
router.get('/lawyer/:lawyerId', getLawyerFeedback);

// Get feedback summary for a lawyer (public)
router.get('/lawyer/:lawyerId/summary', getLawyerFeedbackSummary);

// Mark feedback as helpful (public)
router.put('/:id/helpful', markFeedbackHelpful);

// Protected routes - Lawyer only
router.put('/:id/respond', protect, lawyer, validateResponse, respondToFeedback);

// Protected routes - Admin only
router.get('/pending', protect, admin, getPendingFeedback);
router.put('/:id/approve', protect, admin, approveFeedback);

module.exports = router;