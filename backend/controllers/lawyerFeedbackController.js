const LawyerFeedback = require('../models/LawyerFeedback');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create new lawyer feedback
// @route   POST /api/lawyer-feedback
// @access  Public (but logged in users get additional features)
const createLawyerFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      lawyerId, 
      rating, 
      title, 
      comment, 
      serviceType = 'consultation'
    } = req.body;

    // Require auth to submit feedback so we can use user identity
    const clientId = req.user ? req.user.id : null;
    if (!clientId) {
      return res.status(401).json({ success: false, message: 'Authentication required to submit a review' });
    }

    // Verify lawyer exists and is approved
    const lawyer = await User.findOne({ 
      _id: lawyerId, 
      role: 'lawyer', 
      status: 'approved' 
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found or not approved'
      });
    }

    // Get client info from DB
    const client = await User.findById(clientId).select('firstName lastName email');
    if (!client) {
      return res.status(400).json({ success: false, message: 'Invalid user' });
    }

    const clientFirst = (client.firstName || '').toString().trim();
    const clientLast = (client.lastName || '').toString().trim();
    const derivedName = `${clientFirst} ${clientLast}`.trim();
    const safeClientName = derivedName.length >= 2 ? derivedName : (clientFirst || clientLast || 'Client');
    const safeClientEmail = (client.email || '').toString().trim() || 'client@example.com';

    // Create feedback (non-anonymous, derived from user)
    const feedback = await LawyerFeedback.create({
      lawyerId,
      clientId,
      clientName: safeClientName,
      clientEmail: safeClientEmail,
      rating,
      title,
      comment,
      serviceType,
      isAnonymous: false,
      isApproved: true // Auto-approve all feedback for immediate display
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully and is now visible.',
      data: feedback
    });

  } catch (error) {
    console.error('Error creating lawyer feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

// @desc    Get all feedback for a specific lawyer (public approved only)
// @route   GET /api/lawyer-feedback/lawyer/:lawyerId
// @access  Public
const getLawyerFeedback = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Validate lawyerId is a valid ObjectId
    if (!lawyerId || lawyerId === 'undefined' || !require('mongoose').Types.ObjectId.isValid(lawyerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lawyer ID'
      });
    }

    // Verify lawyer exists
    const lawyer = await User.findOne({ 
      _id: lawyerId, 
      role: 'lawyer' 
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    // Get feedback with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Check if the request is from the lawyer themselves (authenticated)
    const isLawyerRequest = req.user && req.user.id === lawyerId;
    
    // If it's the lawyer's own request, show all feedback
    // If it's a public request, only show approved feedback  
    const query = { lawyerId };
    if (!isLawyerRequest) {
      query.isApproved = true;
    }

    const feedback = await LawyerFeedback.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('clientId', 'firstName lastName', null, { strictPopulate: false })
      .lean();

    // Get total count for pagination
    const total = await LawyerFeedback.countDocuments(query);

    // Get rating statistics
    const ratingStats = await LawyerFeedback.getAverageRating(lawyerId);

    res.json({
      success: true,
      data: {
        feedback,
        ratingStats, // Include rating stats in the response
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: skip + feedback.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching lawyer feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};

// @desc    Get feedback summary for a lawyer (for display on profile)
// @route   GET /api/lawyer-feedback/lawyer/:lawyerId/summary
// @access  Public
const getLawyerFeedbackSummary = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    // Validate lawyerId is a valid ObjectId
    if (!lawyerId || lawyerId === 'undefined' || !require('mongoose').Types.ObjectId.isValid(lawyerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lawyer ID'
      });
    }

    // Verify lawyer exists
    const lawyer = await User.findOne({ 
      _id: lawyerId, 
      role: 'lawyer' 
    });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    // Check if the request is from the lawyer themselves (authenticated)
    const isLawyerRequest = req.user && req.user.id === lawyerId;
    
    // Get rating statistics
    const ratingStats = await LawyerFeedback.getAverageRating(lawyerId);
    
    // Get recent reviews
    let recentReviews;
    if (isLawyerRequest) {
      // For lawyer's own request, show all reviews (approved and pending)
      recentReviews = await LawyerFeedback.find({ lawyerId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('clientId', 'firstName lastName')
        .lean();
    } else {
      // For public requests, only show approved reviews
      recentReviews = await LawyerFeedback.getRecentReviews(lawyerId, 3);
    }

    res.json({
      success: true,
      data: {
        ...ratingStats,
        recentReviews
      }
    });

  } catch (error) {
    console.error('Error fetching lawyer feedback summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback summary'
    });
  }
};

// @desc    Get all pending feedback (Admin only)
// @route   GET /api/lawyer-feedback/pending
// @access  Private/Admin
const getPendingFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedback = await LawyerFeedback.find({ isApproved: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('lawyerId', 'firstName lastName specialization')
      .populate('clientId', 'firstName lastName')
      .lean();

    const total = await LawyerFeedback.countDocuments({ isApproved: false });

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching pending feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending feedback'
    });
  }
};

// @desc    Approve or reject feedback
// @route   PUT /api/lawyer-feedback/:id/approve
// @access  Private/Admin
const approveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, rejectionReason } = req.body;

    const feedback = await LawyerFeedback.findByIdAndUpdate(
      id,
      { 
        isApproved,
        ...(rejectionReason && { rejectionReason })
      },
      { new: true }
    ).populate('lawyerId', 'firstName lastName email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: `Feedback ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: feedback
    });

  } catch (error) {
    console.error('Error approving feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status'
    });
  }
};

// @desc    Respond to feedback (Lawyer only)
// @route   PUT /api/lawyer-feedback/:id/respond
// @access  Private/Lawyer
const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const lawyerId = req.user.id;

    // Find feedback and verify it belongs to this lawyer
    const feedback = await LawyerFeedback.findOne({ 
      _id: id, 
      lawyerId, 
      isApproved: true 
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found or not accessible'
      });
    }

    // Add response
    feedback.response = {
      message,
      respondedAt: new Date(),
      respondedBy: lawyerId
    };

    await feedback.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response'
    });
  }
};

// @desc    Mark feedback as helpful
// @route   PUT /api/lawyer-feedback/:id/helpful
// @access  Public
const markFeedbackHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await LawyerFeedback.findByIdAndUpdate(
      id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: { helpfulVotes: feedback.helpfulVotes }
    });

  } catch (error) {
    console.error('Error marking feedback as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback'
    });
  }
};

module.exports = {
  createLawyerFeedback,
  getLawyerFeedback,
  getLawyerFeedbackSummary,
  getPendingFeedback,
  approveFeedback,
  respondToFeedback,
  markFeedbackHelpful
};