// const express = require('express');
// const router = express.Router();
// const { body } = require('express-validator');
// const multer = require('multer');
// const path = require('path');
// const {
//   uploadDocument,
//   getLawyerDocuments,
//   getClientDocuments,
//   getDocumentById,
//   updateDocument,
//   deleteDocument,
//   downloadDocument,
//   getDocumentStats
// } = require('../controllers/documentController');
// const { protect, lawyer } = require('../middlewares/authMiddleware');

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/documents/');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const fileFilter = (req, file, cb) => {
//   // Allow common document types
//   const allowedTypes = [
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'application/vnd.ms-excel',
//     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     'text/plain',
//     'image/jpeg',
//     'image/png',
//     'image/gif',
//     'application/zip',
//     'application/x-rar-compressed'
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only documents, images, and archives are allowed.'), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   }
// });

// // Validation middleware
// const validateDocumentUpload = [
//   body('clientId')
//     .notEmpty()
//     .withMessage('Client ID is required')
//     .isMongoId()
//     .withMessage('Invalid client ID format'),
  
//   body('title')
//     .trim()
//     .isLength({ min: 1, max: 200 })
//     .withMessage('Title must be between 1 and 200 characters'),
  
//   body('description')
//     .optional()
//     .trim()
//     .isLength({ max: 1000 })
//     .withMessage('Description must be less than 1000 characters'),
  
//   body('documentType')
//     .optional()
//     .isIn(['contract', 'brief', 'evidence', 'correspondence', 'legal_document', 'other'])
//     .withMessage('Invalid document type'),
  
//   body('tags')
//     .optional()
//     .isArray()
//     .withMessage('Tags must be an array')
// ];

// const validateDocumentUpdate = [
//   body('title')
//     .optional()
//     .trim()
//     .isLength({ min: 1, max: 200 })
//     .withMessage('Title must be between 1 and 200 characters'),
  
//   body('description')
//     .optional()
//     .trim()
//     .isLength({ max: 1000 })
//     .withMessage('Description must be less than 1000 characters'),
  
//   body('documentType')
//     .optional()
//     .isIn(['contract', 'brief', 'evidence', 'correspondence', 'legal_document', 'other'])
//     .withMessage('Invalid document type'),
  
//   body('status')
//     .optional()
//     .isIn(['new', 'reviewed', 'needs_attention', 'approved', 'rejected'])
//     .withMessage('Invalid status'),
  
//   body('tags')
//     .optional()
//     .isArray()
//     .withMessage('Tags must be an array'),
  
//   body('reviewNotes')
//     .optional()
//     .trim()
//     .isLength({ max: 500 })
//     .withMessage('Review notes must be less than 500 characters')
// ];

// // All routes require authentication and lawyer role
// router.use(protect, lawyer);

// // Upload document
// router.post('/upload', upload.single('file'), validateDocumentUpload, uploadDocument);

// // Get all documents for lawyer
// router.get('/lawyer', getLawyerDocuments);

// // Get documents for specific client
// router.get('/client/:clientId', getClientDocuments);

// // Get document by ID
// router.get('/:id', getDocumentById);

// // Update document
// router.put('/:id', validateDocumentUpdate, updateDocument);

// // Delete document
// router.delete('/:id', deleteDocument);

// // Download document
// router.get('/:id/download', downloadDocument);

// // Get document statistics
// router.get('/stats', getDocumentStats);

// module.exports = router;







const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Simple middleware that works with any authMiddleware setup
const authMiddleware = require('../middlewares/authMiddleware');

// Create a working auth function
let auth;
if (typeof authMiddleware === 'function') {
  auth = authMiddleware;
} else if (authMiddleware.authMiddleware) {
  auth = authMiddleware.authMiddleware;
} else if (authMiddleware.auth) {
  auth = authMiddleware.auth;
} else {
  // Fallback simple auth
  auth = (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    next();
  };
}

// Simple role middleware
const requireLawyer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (req.user.role !== 'lawyer') {
    return res.status(403).json({ success: false, message: 'Lawyer access required' });
  }
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

// Import models (with error handling)
let Document, User, LawyerClient;

try {
  Document = require('../models/Document');
} catch (error) {
  console.warn('Document model not found');
}

try {
  User = require('../models/User');
} catch (error) {
  console.warn('User model not found');
}

try {
  LawyerClient = require('../models/LawyerClient');
} catch (error) {
  console.warn('LawyerClient model not found');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// @desc Upload a document
// @route POST /api/documents/upload
// @access Private (Lawyer)
const uploadDocument = async (req, res) => {
  try {
    if (!Document || !LawyerClient) {
      return res.status(500).json({
        success: false,
        message: 'Required models not available'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { clientId, title, description, documentType = 'other' } = req.body;
    const lawyerId = req.user.id;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: 'Client ID is required'
      });
    }

    // Check if lawyer-client relationship exists, create if not
    let relationship = await LawyerClient.findOne({
      lawyerId: lawyerId,
      clientId: clientId
    });

    if (!relationship) {
      // Auto-create the relationship
      const client = await User.findById(clientId);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      relationship = await LawyerClient.create({
        lawyerId: lawyerId,
        clientId: clientId,
        addedBy: 'auto',
        status: 'active',
        caseType: 'general',
        caseTitle: `Auto-created for document: ${title || req.file.originalname}`,
        caseStartDate: new Date(),
        lastContactDate: new Date()
      });

      console.log(`Auto-created lawyer-client relationship for ${client.email}`);
    }

    // Create document record
    const document = await Document.create({
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      documentType: documentType,
      lawyerId: lawyerId,
      clientId: clientId,
      uploadedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: {
          id: document._id,
          title: document.title,
          filename: document.filename,
          originalName: document.originalName,
          documentType: document.documentType,
          size: document.size,
          uploadedAt: document.uploadedAt
        },
        relationshipCreated: !relationship.createdAt || relationship.addedBy === 'auto'
      }
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Clean up uploaded file if document creation failed
    if (req.file) {
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
};

// @desc Get all documents for a lawyer
// @route GET /api/documents/lawyer
// @access Private (Lawyer)
const getLawyerDocuments = async (req, res) => {
  try {
    if (!Document) {
      return res.status(500).json({
        success: false,
        message: 'Document model not available'
      });
    }

    const lawyerId = req.user.id;
    const { page = 1, limit = 20, clientId, documentType, search } = req.query;

    // Build query
    const query = { lawyerId };
    
    if (clientId && clientId !== 'all') {
      query.clientId = clientId;
    }
    
    if (documentType && documentType !== 'all') {
      query.documentType = documentType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let documents = await Document.find(query)
      .populate('clientId', 'firstName lastName email')
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      documents = documents.filter(doc => {
        const title = (doc.title || '').toLowerCase();
        const clientName = doc.clientId ? 
          `${doc.clientId.firstName} ${doc.clientId.lastName}`.toLowerCase() : '';
        const originalName = (doc.originalName || '').toLowerCase();
        
        return title.includes(searchLower) || 
               clientName.includes(searchLower) || 
               originalName.includes(searchLower);
      });
    }

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
};

// @desc Get documents for a specific client
// @route GET /api/documents/client/:clientId
// @access Private (Lawyer)
const getClientDocuments = async (req, res) => {
  try {
    if (!Document || !LawyerClient) {
      return res.status(500).json({
        success: false,
        message: 'Required models not available'
      });
    }

    const { clientId } = req.params;
    const lawyerId = req.user.id;

    // Verify lawyer-client relationship exists or create it
    let relationship = await LawyerClient.findOne({
      lawyerId: lawyerId,
      clientId: clientId
    });

    if (!relationship) {
      // Check if there are documents for this client
      const existingDocuments = await Document.countDocuments({
        lawyerId: lawyerId,
        clientId: clientId
      });

      if (existingDocuments > 0) {
        // Auto-create relationship since documents exist
        const client = await User.findById(clientId);
        if (client) {
          relationship = await LawyerClient.create({
            lawyerId: lawyerId,
            clientId: clientId,
            addedBy: 'auto',
            status: 'active',
            caseType: 'general',
            caseTitle: `Auto-created case for ${client.firstName} ${client.lastName}`,
            caseStartDate: new Date(),
            lastContactDate: new Date()
          });

          console.log(`Auto-created relationship for existing documents: ${client.email}`);
        }
      }

      if (!relationship) {
        return res.status(404).json({
          success: false,
          message: 'Client relationship does not exist',
          suggestion: 'Please add this user as a client first'
        });
      }
    }

    // Get documents
    const documents = await Document.find({
      lawyerId: lawyerId,
      clientId: clientId
    })
      .populate('clientId', 'firstName lastName email')
      .sort({ uploadedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        documents,
        clientRelationship: relationship,
        autoCreated: relationship.addedBy === 'auto'
      }
    });

  } catch (error) {
    console.error('Error fetching client documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client documents'
    });
  }
};

// @desc Download a document
// @route GET /api/documents/download/:id
// @access Private
const downloadDocument = async (req, res) => {
  try {
    if (!Document) {
      return res.status(500).json({
        success: false,
        message: 'Document model not available'
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    // Find document and check permissions
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user has permission to download
    const canAccess = document.lawyerId.toString() === userId || 
                     document.clientId.toString() === userId;

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const fs = require('fs');
    
    // Check if file exists
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', document.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    
    // Stream file
    const fileStream = fs.createReadStream(document.path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
};

// @desc Delete a document
// @route DELETE /api/documents/:id
// @access Private (Lawyer)
const deleteDocument = async (req, res) => {
  try {
    if (!Document) {
      return res.status(500).json({
        success: false,
        message: 'Document model not available'
      });
    }

    const { id } = req.params;
    const lawyerId = req.user.id;

    const document = await Document.findOne({
      _id: id,
      lawyerId: lawyerId
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    const fs = require('fs');
    try {
      if (fs.existsSync(document.path)) {
        fs.unlinkSync(document.path);
      }
    } catch (fileError) {
      console.warn('Could not delete file from filesystem:', fileError);
    }

    // Delete from database
    await Document.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
};

// @desc Get document statistics
// @route GET /api/documents/stats
// @access Private (Lawyer)
const getDocumentStats = async (req, res) => {
  try {
    if (!Document) {
      return res.status(500).json({
        success: false,
        message: 'Document model not available'
      });
    }

    const lawyerId = req.user.id;

    const stats = {
      total: await Document.countDocuments({ lawyerId }),
      thisMonth: await Document.countDocuments({
        lawyerId,
        uploadedAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      byType: await Document.aggregate([
        { $match: { lawyerId: require('mongoose').Types.ObjectId(lawyerId) } },
        { $group: { _id: '$documentType', count: { $sum: 1 } } }
      ])
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document statistics'
    });
  }
};

// Routes - SIMPLE AND WORKING
router.post('/upload', auth, requireLawyer, upload.single('document'), uploadDocument);
router.get('/lawyer', auth, requireLawyer, getLawyerDocuments);
router.get('/client/:clientId', auth, requireLawyer, getClientDocuments);
router.get('/download/:id', auth, requireAuth, downloadDocument);
router.get('/stats', auth, requireLawyer, getDocumentStats);
router.delete('/:id', auth, requireLawyer, deleteDocument);

module.exports = router;