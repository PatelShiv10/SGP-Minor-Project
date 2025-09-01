const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats
} = require('../controllers/documentController');
const { protect, lawyer } = require('../middlewares/authMiddleware');

// Validation middleware
const validateUploadDocument = [
  body('clientId')
    .notEmpty()
    .withMessage('Client ID is required')
    .isMongoId()
    .withMessage('Invalid client ID format'),
  
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('category')
    .optional()
    .isIn([
      'contract', 'legal_brief', 'evidence', 'correspondence', 
      'court_document', 'financial', 'medical', 'police_report',
      'witness_statement', 'expert_report', 'other'
    ])
    .withMessage('Invalid document category'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string')
];

const validateUpdateDocument = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('category')
    .optional()
    .isIn([
      'contract', 'legal_brief', 'evidence', 'correspondence', 
      'court_document', 'financial', 'medical', 'police_report',
      'witness_statement', 'expert_report', 'other'
    ])
    .withMessage('Invalid document category'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('status')
    .optional()
    .isIn(['draft', 'pending_review', 'reviewed', 'approved', 'rejected', 'archived'])
    .withMessage('Invalid document status'),
  
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string'),
  
  body('reviewNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review notes cannot exceed 1000 characters')
];

// Upload document
router.post('/upload', protect, lawyer, validateUploadDocument, uploadDocument);

// Get documents with filters
router.get('/', protect, lawyer, getDocuments);

// Get document statistics
router.get('/stats', protect, lawyer, getDocumentStats);

// Get specific document
router.get('/:id', protect, lawyer, getDocumentById);

// Download document
router.get('/:id/download', protect, lawyer, downloadDocument);

// Update document
router.put('/:id', protect, lawyer, validateUpdateDocument, updateDocument);

// Delete document
router.delete('/:id', protect, lawyer, deleteDocument);

module.exports = router;