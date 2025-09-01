const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const {
  uploadDocument,
  getLawyerDocuments,
  getClientDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentStats
} = require('../controllers/documentController');
const { protect, lawyer } = require('../middlewares/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-rar-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents, images, and archives are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Validation middleware
const validateDocumentUpload = [
  body('clientId')
    .notEmpty()
    .withMessage('Client ID is required')
    .isMongoId()
    .withMessage('Invalid client ID format'),
  
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('documentType')
    .optional()
    .isIn(['contract', 'brief', 'evidence', 'correspondence', 'legal_document', 'other'])
    .withMessage('Invalid document type'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const validateDocumentUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('documentType')
    .optional()
    .isIn(['contract', 'brief', 'evidence', 'correspondence', 'legal_document', 'other'])
    .withMessage('Invalid document type'),
  
  body('status')
    .optional()
    .isIn(['new', 'reviewed', 'needs_attention', 'approved', 'rejected'])
    .withMessage('Invalid status'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  body('reviewNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review notes must be less than 500 characters')
];

// All routes require authentication and lawyer role
router.use(protect, lawyer);

// Upload document
router.post('/upload', upload.single('file'), validateDocumentUpload, uploadDocument);

// Get all documents for lawyer
router.get('/lawyer', getLawyerDocuments);

// Get documents for specific client
router.get('/client/:clientId', getClientDocuments);

// Get document by ID
router.get('/:id', getDocumentById);

// Update document
router.put('/:id', validateDocumentUpdate, updateDocument);

// Delete document
router.delete('/:id', deleteDocument);

// Download document
router.get('/:id/download', downloadDocument);

// Get document statistics
router.get('/stats', getDocumentStats);

module.exports = router;