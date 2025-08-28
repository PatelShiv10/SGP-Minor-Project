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
      serviceType = 'consultation',
      isAnonymous = false,
      clientName,
      clientEmail 
    } = req.body;

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

    // Check if user is logged in
    const clientId = req.user ? req.user.id : null;
    
    // If logged in, use their info unless anonymous
    let finalClientName = clientName;
    let finalClientEmail = clientEmail;
    
    if (clientId && !isAnonymous) {
      const client = await User.findById(clientId);
      if (client) {
        finalClientName = `${client.firstName} ${client.lastName}`;
        finalClientEmail = client.email;
      }
    }

    // Create feedback
    const feedback = await LawyerFeedback.create({
      lawyerId,
      clientId: isAnonymous ? null : clientId,
      clientName: finalClientName,
      clientEmail: finalClientEmail,
      rating,
      title,
      comment,
      serviceType,
      isAnonymous,
      isApproved: false // Requires manual approval
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. It will be reviewed before being published.',
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

    const feedback = await LawyerFeedback.find({ 
      lawyerId, 
      isApproved: true 
    })
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('clientId', 'firstName lastName', null, { strictPopulate: false })
    .lean();

    // Get total count for pagination
    const total = await LawyerFeedback.countDocuments({ 
      lawyerId, 
      isApproved: true 
    });

    // Get rating statistics
    const ratingStats = await LawyerFeedback.getAverageRating(lawyerId);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: skip + feedback.length < total,
          hasPrev: parseInt(page) > 1
        },
        ratingStats
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

    // Get rating statistics
    const ratingStats = await LawyerFeedback.getAverageRating(lawyerId);
    
    // Get recent reviews
    const recentReviews = await LawyerFeedback.getRecentReviews(lawyerId, 3);

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