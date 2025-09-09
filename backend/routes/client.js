// const express = require('express');
// const router = express.Router();
// const { body, param, query } = require('express-validator');
// const {
//   getLawyerClients,
//   addClient,
//   getClientDetails,
//   updateClient,
//   markClientComplete,
//   deleteClient,
//   archiveClient,
//   addClientNote,
//   getClientStats
// } = require('../controllers/clientController');
// const { protect, lawyer } = require('../middlewares/authMiddleware');

// // Validation middleware
// const validateAddClient = [
//   body('firstName')
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('First name must be between 2 and 50 characters'),
  
//   body('lastName')
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('Last name must be between 2 and 50 characters'),
  
//   body('email')
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Valid email is required'),
  
//   body('phone')
//     .trim()
//     .isLength({ min: 10, max: 20 })
//     .withMessage('Valid phone number is required'),
  
//   body('caseType')
//     .optional()
//     .isIn([
//       'family_law', 'corporate_law', 'criminal_law', 'civil_litigation',
//       'real_estate', 'immigration', 'personal_injury', 'employment',
//       'intellectual_property', 'tax_law', 'estate_planning', 'other'
//     ])
//     .withMessage('Invalid case type'),
  
//   body('caseTitle')
//     .optional()
//     .trim()
//     .isLength({ max: 200 })
//     .withMessage('Case title cannot exceed 200 characters'),
  
//   body('caseDescription')
//     .optional()
//     .trim()
//     .isLength({ max: 1000 })
//     .withMessage('Case description cannot exceed 1000 characters'),
  
//   body('notes')
//     .optional()
//     .trim()
//     .isLength({ max: 2000 })
//     .withMessage('Notes cannot exceed 2000 characters'),
  
//   body('preferredContact')
//     .optional()
//     .isIn(['email', 'phone', 'video_call', 'in_person'])
//     .withMessage('Invalid preferred contact method'),
  
//   body('hourlyRate')
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('Hourly rate must be a positive number'),
  
//   body('priority')
//     .optional()
//     .isIn(['low', 'medium', 'high', 'urgent'])
//     .withMessage('Invalid priority level')
// ];

// const validateUpdateClient = [
//   body('caseType')
//     .optional()
//     .isIn([
//       'family_law', 'corporate_law', 'criminal_law', 'civil_litigation',
//       'real_estate', 'immigration', 'personal_injury', 'employment',
//       'intellectual_property', 'tax_law', 'estate_planning', 'other'
//     ])
//     .withMessage('Invalid case type'),
  
//   body('status')
//     .optional()
//     .isIn(['active', 'pending', 'completed', 'inactive'])
//     .withMessage('Invalid status'),
  
//   body('priority')
//     .optional()
//     .isIn(['low', 'medium', 'high', 'urgent'])
//     .withMessage('Invalid priority level'),
  
//   body('caseTitle')
//     .optional()
//     .trim()
//     .isLength({ max: 200 })
//     .withMessage('Case title cannot exceed 200 characters'),
  
//   body('caseDescription')
//     .optional()
//     .trim()
//     .isLength({ max: 1000 })
//     .withMessage('Case description cannot exceed 1000 characters'),
  
//   body('notes')
//     .optional()
//     .trim()
//     .isLength({ max: 2000 })
//     .withMessage('Notes cannot exceed 2000 characters'),
  
//   body('hourlyRate')
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('Hourly rate must be a positive number'),
  
//   body('totalBilled')
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('Total billed must be a positive number'),
  
//   body('totalPaid')
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage('Total paid must be a positive number')
// ];

// const validatePagination = [
//   query('page')
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage('Page must be a positive integer'),
  
//   query('limit')
//     .optional()
//     .isInt({ min: 1, max: 100 })
//     .withMessage('Limit must be between 1 and 100')
// ];

// const validateMongoId = [
//   param('id')
//     .isMongoId()
//     .withMessage('Invalid client ID')
// ];

// // ============= LAWYER ROUTES =============

// // Get all clients for lawyer
// router.get('/lawyer',
//   protect,
//   lawyer,
//   validatePagination,
//   [
//     query('status')
//       .optional()
//       .isIn(['all', 'active', 'pending', 'completed', 'inactive'])
//       .withMessage('Invalid status filter'),
    
//     query('caseType')
//       .optional()
//       .isIn([
//         'all', 'family_law', 'corporate_law', 'criminal_law', 'civil_litigation',
//         'real_estate', 'immigration', 'personal_injury', 'employment',
//         'intellectual_property', 'tax_law', 'estate_planning', 'other'
//       ])
//       .withMessage('Invalid case type filter'),
    
//     query('sortBy')
//       .optional()
//       .isIn(['lastContactDate', 'createdAt', 'caseTitle', 'status', 'priority'])
//       .withMessage('Invalid sort field'),
    
//     query('sortOrder')
//       .optional()
//       .isIn(['asc', 'desc'])
//       .withMessage('Invalid sort order'),
    
//     query('isArchived')
//       .optional()
//       .isBoolean()
//       .withMessage('isArchived must be a boolean')
//   ],
//   getLawyerClients
// );

// // Add new client manually
// router.post('/lawyer/add',
//   protect,
//   lawyer,
//   validateAddClient,
//   addClient
// );

// // Get client statistics
// router.get('/lawyer/stats',
//   protect,
//   lawyer,
//   getClientStats
// );

// // ============= CLIENT SPECIFIC ROUTES =============

// // Get client details
// router.get('/:id',
//   protect,
//   lawyer,
//   validateMongoId,
//   getClientDetails
// );

// // Update client information
// router.put('/:id',
//   protect,
//   lawyer,
//   validateMongoId,
//   validateUpdateClient,
//   updateClient
// );

// // Mark client as completed
// router.put('/:id/complete',
//   protect,
//   lawyer,
//   validateMongoId,
//   [
//     body('notes')
//       .optional()
//       .trim()
//       .isLength({ max: 500 })
//       .withMessage('Completion notes cannot exceed 500 characters')
//   ],
//   markClientComplete
// );

// // Delete/Remove client relationship
// router.delete('/:id',
//   protect,
//   lawyer,
//   validateMongoId,
//   deleteClient
// );

// // Archive client
// router.put('/:id/archive',
//   protect,
//   lawyer,
//   validateMongoId,
//   archiveClient
// );

// // Add note to client
// router.post('/:id/notes',
//   protect,
//   lawyer,
//   validateMongoId,
//   [
//     body('note')
//       .trim()
//       .isLength({ min: 1, max: 500 })
//       .withMessage('Note must be between 1 and 500 characters')
//   ],
//   addClientNote
// );

// module.exports = router;


























const express = require('express');
const router = express.Router();

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

// Import models (with error handling)
let LawyerClient, User, Booking;

try {
  LawyerClient = require('../models/LawyerClient');
} catch (error) {
  console.warn('LawyerClient model not found');
}

try {
  User = require('../models/User');
} catch (error) {
  console.warn('User model not found');
}

try {
  Booking = require('../models/Booking');
} catch (error) {
  console.warn('Booking model not found');
}

// @desc Get all clients for a lawyer
// @route GET /api/clients/lawyer
// @access Private (Lawyer)
const getLawyerClients = async (req, res) => {
  try {
    if (!LawyerClient) {
      return res.status(500).json({
        success: false,
        message: 'LawyerClient model not available'
      });
    }

    const lawyerId = req.user.id;
    const { page = 1, limit = 20, status, search } = req.query;

    // Build query
    const query = { lawyerId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const clients = await LawyerClient.find(query)
      .populate('clientId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await LawyerClient.countDocuments(query);

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients'
    });
  }
};

// @desc Add a new client
// @route POST /api/clients/lawyer/add
// @access Private (Lawyer)
const addClient = async (req, res) => {
  try {
    if (!User || !LawyerClient) {
      return res.status(500).json({
        success: false,
        message: 'Required models not available'
      });
    }

    const lawyerId = req.user.id;
    const { firstName, lastName, email, phone, caseType = 'other' } = req.body;

    // Check if user exists
    let client = await User.findOne({ email });
    
    if (!client) {
      // Create new user
      client = await User.create({
        firstName,
        lastName,
        email,
        phone,
        role: 'user',
        password: 'temppass123',
        agree: true
      });
    }

    // Check if relationship exists
    const existing = await LawyerClient.findOne({
      lawyerId,
      clientId: client._id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Client relationship already exists'
      });
    }

    // Create relationship
    const relationship = await LawyerClient.create({
      lawyerId,
      clientId: client._id,
      caseType,
      status: 'active',
      addedBy: 'manual'
    });

    const populated = await LawyerClient.findById(relationship._id)
      .populate('clientId', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Client added successfully',
      data: populated
    });

  } catch (error) {
    console.error('Error adding client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add client'
    });
  }
};

// @desc Get client details
// @route GET /api/clients/:id
// @access Private (Lawyer)
const getClientDetails = async (req, res) => {
  try {
    if (!LawyerClient) {
      return res.status(500).json({
        success: false,
        message: 'LawyerClient model not available'
      });
    }

    const { id } = req.params;
    const lawyerId = req.user.id;

    const client = await LawyerClient.findOne({
      _id: id,
      lawyerId
    }).populate('clientId', 'firstName lastName email phone');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });

  } catch (error) {
    console.error('Error fetching client details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client details'
    });
  }
};

// @desc Update client
// @route PUT /api/clients/:id
// @access Private (Lawyer)
const updateClient = async (req, res) => {
  try {
    if (!LawyerClient) {
      return res.status(500).json({
        success: false,
        message: 'LawyerClient model not available'
      });
    }

    const { id } = req.params;
    const lawyerId = req.user.id;

    const client = await LawyerClient.findOneAndUpdate(
      { _id: id, lawyerId },
      req.body,
      { new: true }
    ).populate('clientId', 'firstName lastName email phone');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });

  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client'
    });
  }
};

// @desc Delete client relationship
// @route DELETE /api/clients/:id
// @access Private (Lawyer)
const deleteClient = async (req, res) => {
  try {
    if (!LawyerClient) {
      return res.status(500).json({
        success: false,
        message: 'LawyerClient model not available'
      });
    }

    const { id } = req.params;
    const lawyerId = req.user.id;

    const client = await LawyerClient.findOneAndDelete({ _id: id, lawyerId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client relationship removed successfully'
    });

  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove client'
    });
  }
};

// @desc Get client stats
// @route GET /api/clients/lawyer/stats
// @access Private (Lawyer)
const getClientStats = async (req, res) => {
  try {
    if (!LawyerClient) {
      return res.status(500).json({
        success: false,
        message: 'LawyerClient model not available'
      });
    }

    const lawyerId = req.user.id;

    const stats = {
      total: await LawyerClient.countDocuments({ lawyerId }),
      active: await LawyerClient.countDocuments({ lawyerId, status: 'active' }),
      pending: await LawyerClient.countDocuments({ lawyerId, status: 'pending' }),
      completed: await LawyerClient.countDocuments({ lawyerId, status: 'completed' })
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Routes - SIMPLE AND WORKING
router.get('/lawyer', auth, requireLawyer, getLawyerClients);
router.get('/lawyer/stats', auth, requireLawyer, getClientStats);
router.post('/lawyer/add', auth, requireLawyer, addClient);
router.get('/:id', auth, requireLawyer, getClientDetails);
router.put('/:id', auth, requireLawyer, updateClient);
router.delete('/:id', auth, requireLawyer, deleteClient);

module.exports = router;