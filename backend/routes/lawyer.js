// const express = require('express');
// const router = express.Router();
// const { 
//   getAllLawyers, 
//   getApprovedLawyers, 
//   updateLawyerStatus, 
//   deleteLawyer, 
//   getLawyerStats,
//   getMyProfile,
//   updateMyProfile,
//   updateMyAvailability,
//   getMyAvailability,
//   getPublicLawyerProfile,
//   getMyNotifications
// } = require('../controllers/lawyerController');
// const { protect, admin } = require('../middlewares/authMiddleware');

// // Public routes
// router.get('/approved', getApprovedLawyers);
// router.get('/:id/public', getPublicLawyerProfile);

// // Protected routes for lawyers
// router.get('/me', protect, getMyProfile);
// router.put('/me', protect, updateMyProfile);
// router.get('/me/notifications', protect, getMyNotifications);
// router.get('/me/availability', protect, getMyAvailability);
// router.put('/me/availability', protect, updateMyAvailability);

// // Protected routes (admin only)
// router.get('/all', protect, admin, getAllLawyers);
// router.get('/stats', protect, admin, getLawyerStats);
// router.put('/:lawyerId/status', protect, admin, updateLawyerStatus);
// router.delete('/:lawyerId', protect, admin, deleteLawyer);

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
let User, LawyerClient, Document, Booking;

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

try {
  Document = require('../models/Document');
} catch (error) {
  console.warn('Document model not found');
}

try {
  Booking = require('../models/Booking');
} catch (error) {
  console.warn('Booking model not found');
}

// @desc Get lawyer profile
// @route GET /api/lawyers/me
// @access Private (Lawyer)
const getLawyerProfile = async (req, res) => {
  try {
    if (!User) {
      return res.status(500).json({
        success: false,
        message: 'User model not available'
      });
    }

    const lawyer = await User.findById(req.user.id)
      .select('-password -otp -passwordResetToken')
      .lean();

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer profile not found'
      });
    }

    res.json({
      success: true,
      data: lawyer
    });

  } catch (error) {
    console.error('Error fetching lawyer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyer profile'
    });
  }
};

// @desc Get lawyer notifications
// @route GET /api/lawyers/me/notifications
// @access Private (Lawyer)
const getLawyerNotifications = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const { clear = 'false', limit = 20 } = req.query;

    // Mock notifications for now - replace with actual notification system
    const notifications = [
      {
        id: '1',
        type: 'new_client',
        title: 'New Client Request',
        message: 'You have a new client consultation request',
        timestamp: new Date(),
        read: false,
        data: { clientId: 'client_123' }
      },
      {
        id: '2', 
        type: 'document_uploaded',
        title: 'Document Uploaded',
        message: 'A client has uploaded a new document',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        read: false,
        data: { documentId: 'doc_456' }
      },
      {
        id: '3',
        type: 'appointment_reminder',
        title: 'Upcoming Appointment',
        message: 'You have an appointment in 30 minutes',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        read: true,
        data: { appointmentId: 'apt_789' }
      }
    ];

    // If clear=true, mark notifications as read (implement your logic here)
    if (clear === 'true') {
      // In a real app, you would update the notifications in the database
      notifications.forEach(notification => {
        notification.read = true;
      });
    }

    // Filter and limit notifications
    const unreadCount = notifications.filter(n => !n.read).length;
    const limitedNotifications = notifications.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        notifications: limitedNotifications,
        unreadCount: unreadCount,
        total: notifications.length,
        cleared: clear === 'true'
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// @desc Update lawyer profile
// @route PUT /api/lawyers/me
// @access Private (Lawyer)
const updateLawyerProfile = async (req, res) => {
  try {
    if (!User) {
      return res.status(500).json({
        success: false,
        message: 'User model not available'
      });
    }

    const lawyerId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.role;
    delete updateData.email; // Email changes should go through verification
    delete updateData.isVerified;
    delete updateData.status;

    const updatedLawyer = await User.findByIdAndUpdate(
      lawyerId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -otp -passwordResetToken');

    if (!updatedLawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedLawyer
    });

  } catch (error) {
    console.error('Error updating lawyer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// @desc Get lawyer dashboard stats
// @route GET /api/lawyers/me/dashboard
// @access Private (Lawyer)
const getLawyerDashboard = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    
    const stats = {
      clients: {
        total: 0,
        active: 0,
        pending: 0,
        completed: 0
      },
      documents: {
        total: 0,
        thisMonth: 0,
        pending: 0
      },
      appointments: {
        today: 0,
        thisWeek: 0,
        upcoming: 0
      },
      notifications: {
        unread: 3 // Mock data
      }
    };

    // Get client stats if LawyerClient model exists
    if (LawyerClient) {
      try {
        stats.clients.total = await LawyerClient.countDocuments({ lawyerId });
        stats.clients.active = await LawyerClient.countDocuments({ lawyerId, status: 'active' });
        stats.clients.pending = await LawyerClient.countDocuments({ lawyerId, status: 'pending' });
        stats.clients.completed = await LawyerClient.countDocuments({ lawyerId, status: 'completed' });
      } catch (error) {
        console.warn('Error fetching client stats:', error);
      }
    }

    // Get document stats if Document model exists
    if (Document) {
      try {
        stats.documents.total = await Document.countDocuments({ lawyerId });
        
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        stats.documents.thisMonth = await Document.countDocuments({
          lawyerId,
          createdAt: { $gte: thisMonth }
        });
      } catch (error) {
        console.warn('Error fetching document stats:', error);
      }
    }

    // Get appointment stats if Booking model exists
    if (Booking) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        stats.appointments.today = await Booking.countDocuments({
          lawyerId,
          date: {
            $gte: today.toISOString().split('T')[0],
            $lt: tomorrow.toISOString().split('T')[0]
          }
        });

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        stats.appointments.thisWeek = await Booking.countDocuments({
          lawyerId,
          date: {
            $gte: weekStart.toISOString().split('T')[0],
            $lt: weekEnd.toISOString().split('T')[0]
          }
        });

        stats.appointments.upcoming = await Booking.countDocuments({
          lawyerId,
          date: { $gte: today.toISOString().split('T')[0] },
          status: { $in: ['pending', 'confirmed'] }
        });
      } catch (error) {
        console.warn('Error fetching appointment stats:', error);
      }
    }

    res.json({
      success: true,
      data: {
        stats,
        lawyer: {
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
          specialization: req.user.specialization,
          experience: req.user.experience
        },
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching lawyer dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// @desc Mark notification as read
// @route PUT /api/lawyers/me/notifications/:id/read
// @access Private (Lawyer)
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock implementation - replace with actual notification system
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notificationId: id,
        read: true,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// @desc Get lawyer's recent activity
// @route GET /api/lawyers/me/activity
// @access Private (Lawyer)
const getLawyerActivity = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const { limit = 10 } = req.query;

    // Mock recent activity - replace with actual activity tracking
    const activities = [
      {
        id: '1',
        type: 'document_uploaded',
        description: 'Document uploaded by client John Doe',
        timestamp: new Date(),
        data: { clientName: 'John Doe', documentName: 'Contract.pdf' }
      },
      {
        id: '2',
        type: 'client_added',
        description: 'New client Jane Smith added',
        timestamp: new Date(Date.now() - 3600000),
        data: { clientName: 'Jane Smith' }
      },
      {
        id: '3',
        type: 'appointment_scheduled',
        description: 'Appointment scheduled with Mike Johnson',
        timestamp: new Date(Date.now() - 7200000),
        data: { clientName: 'Mike Johnson', appointmentDate: '2025-09-10' }
      }
    ];

    const limitedActivities = activities.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        activities: limitedActivities,
        total: activities.length
      }
    });

  } catch (error) {
    console.error('Error fetching lawyer activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity'
    });
  }
};

// Routes
router.get('/me', auth, requireLawyer, getLawyerProfile);
router.get('/me/notifications', auth, requireLawyer, getLawyerNotifications);
router.put('/me', auth, requireLawyer, updateLawyerProfile);
router.get('/me/dashboard', auth, requireLawyer, getLawyerDashboard);
router.put('/me/notifications/:id/read', auth, requireLawyer, markNotificationRead);
router.get('/me/activity', auth, requireLawyer, getLawyerActivity);

module.exports = router;