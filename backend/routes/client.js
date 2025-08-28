const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  getLawyerClients,
  addClient,
  getClientDetails,
  updateClient,
  markClientComplete,
  deleteClient,
  archiveClient,
  addClientNote,
  getClientStats
} = require('../controllers/clientController');
const { protect, lawyer } = require('../middlewares/authMiddleware');

// Validation middleware
const validateAddClient = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('phone')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Valid phone number is required'),
  
  body('caseType')
    .optional()
    .isIn([
      'family_law', 'corporate_law', 'criminal_law', 'civil_litigation',
      'real_estate', 'immigration', 'personal_injury', 'employment',
      'intellectual_property', 'tax_law', 'estate_planning', 'other'
    ])
    .withMessage('Invalid case type'),
  
  body('caseTitle')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Case title cannot exceed 200 characters'),
  
  body('caseDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Case description cannot exceed 1000 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
  
  body('preferredContact')
    .optional()
    .isIn(['email', 'phone', 'video_call', 'in_person'])
    .withMessage('Invalid preferred contact method'),
  
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
];

const validateUpdateClient = [
  body('caseType')
    .optional()
    .isIn([
      'family_law', 'corporate_law', 'criminal_law', 'civil_litigation',
      'real_estate', 'immigration', 'personal_injury', 'employment',
      'intellectual_property', 'tax_law', 'estate_planning', 'other'
    ])
    .withMessage('Invalid case type'),
  
  body('status')
    .optional()
    .isIn(['active', 'pending', 'completed', 'inactive'])
    .withMessage('Invalid status'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('caseTitle')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Case title cannot exceed 200 characters'),
  
  body('caseDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Case description cannot exceed 1000 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
  
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  
  body('totalBilled')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total billed must be a positive number'),
  
  body('totalPaid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total paid must be a positive number')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid client ID')
];

// ============= LAWYER ROUTES =============

// Get all clients for lawyer
router.get('/lawyer',
  protect,
  lawyer,
  validatePagination,
  [
    query('status')
      .optional()
      .isIn(['all', 'active', 'pending', 'completed', 'inactive'])
      .withMessage('Invalid status filter'),
    
    query('caseType')
      .optional()
      .isIn([
        'all', 'family_law', 'corporate_law', 'criminal_law', 'civil_litigation',
        'real_estate', 'immigration', 'personal_injury', 'employment',
        'intellectual_property', 'tax_law', 'estate_planning', 'other'
      ])
      .withMessage('Invalid case type filter'),
    
    query('sortBy')
      .optional()
      .isIn(['lastContactDate', 'createdAt', 'caseTitle', 'status', 'priority'])
      .withMessage('Invalid sort field'),
    
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Invalid sort order'),
    
    query('isArchived')
      .optional()
      .isBoolean()
      .withMessage('isArchived must be a boolean')
  ],
  getLawyerClients
);

// Add new client manually
router.post('/lawyer/add',
  protect,
  lawyer,
  validateAddClient,
  addClient
);

// Get client statistics
router.get('/lawyer/stats',
  protect,
  lawyer,
  getClientStats
);

// ============= CLIENT SPECIFIC ROUTES =============

// Get client details
router.get('/:id',
  protect,
  lawyer,
  validateMongoId,
  getClientDetails
);

// Update client information
router.put('/:id',
  protect,
  lawyer,
  validateMongoId,
  validateUpdateClient,
  updateClient
);

// Mark client as completed
router.put('/:id/complete',
  protect,
  lawyer,
  validateMongoId,
  [
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Completion notes cannot exceed 500 characters')
  ],
  markClientComplete
);

// Delete/Remove client relationship
router.delete('/:id',
  protect,
  lawyer,
  validateMongoId,
  deleteClient
);

// Archive client
router.put('/:id/archive',
  protect,
  lawyer,
  validateMongoId,
  archiveClient
);

// Add note to client
router.post('/:id/notes',
  protect,
  lawyer,
  validateMongoId,
  [
    body('note')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Note must be between 1 and 500 characters')
  ],
  addClientNote
);

module.exports = router;