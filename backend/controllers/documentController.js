const Document = require('../models/Document');
const LawyerClient = require('../models/LawyerClient');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
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
    'image/webp',
    'application/zip',
    'application/x-rar-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and archives are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// @desc    Upload document for a client
// @route   POST /api/documents/upload
// @access  Private/Lawyer
const uploadDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { clientId, title, description, category, priority, tags } = req.body;
    const lawyerId = req.user.id;

    // Verify lawyer-client relationship exists
    const lawyerClient = await LawyerClient.findOne({
      lawyerId,
      clientId,
      isArchived: false
    });

    if (!lawyerClient) {
      return res.status(404).json({
        success: false,
        message: 'Client relationship not found'
      });
    }

    // Handle file upload
    upload.single('document')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      try {
        // Create document record
        const document = await Document.create({
          lawyerId,
          clientId,
          lawyerClientId: lawyerClient._id,
          title,
          description,
          fileName: req.file.filename,
          originalFileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          category: category || 'other',
          priority: priority || 'medium',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          uploadedBy: lawyerId
        });

        // Populate client information
        await document.populate('clientId', 'firstName lastName email');

        res.status(201).json({
          success: true,
          message: 'Document uploaded successfully',
          data: document
        });
      } catch (error) {
        // Clean up uploaded file if document creation fails
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to delete uploaded file:', unlinkError);
        }

        throw error;
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
};

// @desc    Get documents for a lawyer (with optional client filter)
// @route   GET /api/documents
// @access  Private/Lawyer
const getDocuments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      clientId, 
      category, 
      status, 
      priority, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const lawyerId = req.user.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { lawyerId, isDeleted: false };
    if (clientId) query.clientId = clientId;
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const documents = await Document.find(query)
      .populate('clientId', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Document.countDocuments(query);

    // Get statistics
    const stats = await Document.getDocumentStats(lawyerId, clientId);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: skip + documents.length < total,
          hasPrev: parseInt(page) > 1
        },
        stats
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

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private/Lawyer
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyerId = req.user.id;

    const document = await Document.findOne({
      _id: id,
      lawyerId,
      isDeleted: false
    })
    .populate('clientId', 'firstName lastName email')
    .populate('uploadedBy', 'firstName lastName')
    .populate('reviewedBy', 'firstName lastName');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document'
    });
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private/Lawyer
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyerId = req.user.id;

    const document = await Document.findOne({
      _id: id,
      lawyerId,
      isDeleted: false
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if file exists
    try {
      await fs.access(document.filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      });
    }

    // Update download statistics
    document.downloadCount += 1;
    document.lastDownloadedAt = new Date();
    document.lastDownloadedBy = lawyerId;
    await document.save();

    // Set headers for download
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
    res.setHeader('Content-Length', document.fileSize);

    // Stream the file
    const fileStream = require('fs').createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private/Lawyer
const updateDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const lawyerId = req.user.id;
    const { title, description, category, priority, tags, status, reviewNotes } = req.body;

    const document = await Document.findOne({
      _id: id,
      lawyerId,
      isDeleted: false
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update fields
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (category) document.category = category;
    if (priority) document.priority = priority;
    if (tags) document.tags = tags.split(',').map(tag => tag.trim());
    if (status) document.status = status;
    if (reviewNotes !== undefined) document.reviewNotes = reviewNotes;

    // Update review information if status is being changed to reviewed
    if (status === 'reviewed' && document.status !== 'reviewed') {
      document.reviewedBy = lawyerId;
      document.reviewedAt = new Date();
    }

    await document.save();

    await document.populate('clientId', 'firstName lastName email');
    await document.populate('uploadedBy', 'firstName lastName');
    await document.populate('reviewedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document'
    });
  }
};

// @desc    Delete document (soft delete)
// @route   DELETE /api/documents/:id
// @access  Private/Lawyer
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyerId = req.user.id;

    const document = await Document.findOne({
      _id: id,
      lawyerId,
      isDeleted: false
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Soft delete
    document.isDeleted = true;
    await document.save();

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

// @desc    Get document statistics
// @route   GET /api/documents/stats
// @access  Private/Lawyer
const getDocumentStats = async (req, res) => {
  try {
    const { clientId } = req.query;
    const lawyerId = req.user.id;

    const stats = await Document.getDocumentStats(lawyerId, clientId);

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

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats
};