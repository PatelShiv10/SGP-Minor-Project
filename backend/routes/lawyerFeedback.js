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
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  
  body('serviceType')
    .optional()
    .isIn(['consultation', 'document_review', 'legal_advice', 'representation', 'other'])
    .withMessage('Invalid service type'),
  
  body('clientName')
    .if(body('isAnonymous').not().equals('true'))
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Client name must be between 2 and 50 characters'),
  
  body('clientEmail')
    .if(body('isAnonymous').not().equals('true'))
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean')
];

// Validation for response
const validateResponse = [
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Response message must be between 10 and 500 characters')
];

// Public routes
// Create new feedback (public but optional auth for better UX)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // If token is invalid, continue without auth
    }
  }
  next();
};

router.post('/', optionalAuth, validateFeedback, createLawyerFeedback);

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