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
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

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
let Booking, User, LawyerClient;

try {
  Booking = require('../models/Booking');
} catch (error) {
  console.warn('Booking model not found');
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

// @desc Create a new appointment/booking
// @route POST /api/appointments
// @access Private
const createAppointment = async (req, res) => {
  try {
    if (!Booking) {
      return res.status(500).json({
        success: false,
        message: 'Booking system not available'
      });
    }

    const {
      lawyerId,
      date,
      start,
      end,
      durationMins = 30,
      appointmentType = 'consultation',
      notes,
      clientNotes,
      meetingType = 'video_call',
      meetingLink
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!lawyerId || !date || !start) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer ID, date, and start time are required'
      });
    }

    // Check if lawyer exists
    if (User) {
      const lawyer = await User.findById(lawyerId);
      if (!lawyer || lawyer.role !== 'lawyer') {
        return res.status(404).json({
          success: false,
          message: 'Lawyer not found'
        });
      }
    }

    // Check for existing appointment at the same time
    const existingAppointment = await Booking.findOne({
      lawyerId,
      date,
      start,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create the appointment
    const appointment = await Booking.create({
      lawyerId,
      userId,
      date,
      start,
      end,
      durationMins,
      appointmentType,
      notes: notes || '',
      clientNotes: clientNotes || '',
      meetingType,
      meetingLink: meetingLink || '',
      status: 'pending'
    });

    // Populate with user and lawyer details
    const populatedAppointment = await Booking.findById(appointment._id)
      .populate('userId', 'firstName lastName email phone')
      .populate('lawyerId', 'firstName lastName email specialization')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment'
    });
  }
};

// @desc Get appointments for a lawyer (for calendar display)
// @route GET /api/appointments/lawyer/:lawyerId
// @access Private
const getLawyerAppointments = async (req, res) => {
  try {
    if (!Booking) {
      return res.status(500).json({
        success: false,
        message: 'Booking system not available'
      });
    }

    const { lawyerId } = req.params;
    const { month, year, date, status } = req.query;

    // Build query
    let query = { lawyerId };

    // Filter by specific date if provided
    if (date) {
      query.date = date;
    } else if (month && year) {
      // Filter by month and year for calendar view
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      query.date = {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      };
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const appointments = await Booking.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort({ date: 1, start: 1 })
      .lean();

    // Format appointments for calendar
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment._id,
      title: `${appointment.appointmentType.replace('_', ' ')} - ${appointment.userId?.firstName} ${appointment.userId?.lastName}`,
      date: appointment.date,
      start: `${appointment.date}T${appointment.start}:00`,
      end: `${appointment.date}T${appointment.end}:00`,
      startTime: appointment.start,
      endTime: appointment.end,
      status: appointment.status,
      type: appointment.appointmentType,
      meetingType: appointment.meetingType,
      notes: appointment.notes,
      clientNotes: appointment.clientNotes,
      client: {
        id: appointment.userId?._id,
        name: `${appointment.userId?.firstName} ${appointment.userId?.lastName}`,
        email: appointment.userId?.email,
        phone: appointment.userId?.phone
      },
      duration: appointment.durationMins,
      durationFormatted: appointment.durationFormatted,
      timeRange: appointment.timeRange,
      createdAt: appointment.createdAt,
      backgroundColor: getStatusColor(appointment.status),
      borderColor: getStatusColor(appointment.status)
    }));

    res.json({
      success: true,
      data: {
        appointments: formattedAppointments,
        count: formattedAppointments.length,
        filters: { month, year, date, status }
      }
    });

  } catch (error) {
    console.error('Error fetching lawyer appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};

// @desc Get appointments for a user
// @route GET /api/appointments/user/me
// @access Private
const getUserAppointments = async (req, res) => {
  try {
    if (!Booking) {
      return res.status(500).json({
        success: false,
        message: 'Booking system not available'
      });
    }

    const userId = req.user.id;
    const { status, upcoming = 'false' } = req.query;

    let query = { userId };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query.date = { $gte: today };
    }

    const appointments = await Booking.find(query)
      .populate('lawyerId', 'firstName lastName email specialization experience')
      .sort({ date: 1, start: 1 })
      .lean();

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment._id,
      date: appointment.date,
      start: appointment.start,
      end: appointment.end,
      startTime: appointment.start,
      endTime: appointment.end,
      status: appointment.status,
      type: appointment.appointmentType,
      meetingType: appointment.meetingType,
      notes: appointment.notes,
      clientNotes: appointment.clientNotes,
      lawyerNotes: appointment.lawyerNotes,
      meetingLink: appointment.meetingLink,
      lawyer: {
        id: appointment.lawyerId?._id,
        name: `${appointment.lawyerId?.firstName} ${appointment.lawyerId?.lastName}`,
        email: appointment.lawyerId?.email,
        specialization: appointment.lawyerId?.specialization,
        experience: appointment.lawyerId?.experience
      },
      duration: appointment.durationMins,
      durationFormatted: appointment.durationFormatted,
      timeRange: appointment.timeRange,
      createdAt: appointment.createdAt
    }));

    res.json({
      success: true,
      data: {
        appointments: formattedAppointments,
        count: formattedAppointments.length
      }
    });

  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};

// @desc Get all appointments (for current user based on role)
// @route GET /api/appointments
// @access Private
const getAppointments = async (req, res) => {
  try {
    if (!Booking) {
      return res.status(500).json({
        success: false,
        message: 'Booking system not available'
      });
    }

    const { role, id: userId } = req.user;
    const { month, year, status } = req.query;

    let query = {};

    // Set query based on user role
    if (role === 'lawyer') {
      query.lawyerId = userId;
    } else {
      query.userId = userId;
    }

    // Add month/year filter for calendar
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      query.date = {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      };
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Booking.find(query)
      .populate('userId', 'firstName lastName email phone')
      .populate('lawyerId', 'firstName lastName email specialization')
      .sort({ date: 1, start: 1 })
      .lean();

    // Format for calendar display (FullCalendar format)
    const calendarEvents = appointments.map(appointment => ({
      id: appointment._id,
      title: role === 'lawyer' 
        ? `${appointment.appointmentType.replace('_', ' ')} - ${appointment.userId?.firstName} ${appointment.userId?.lastName}`
        : `${appointment.appointmentType.replace('_', ' ')} - ${appointment.lawyerId?.firstName} ${appointment.lawyerId?.lastName}`,
      start: `${appointment.date}T${appointment.start}:00`,
      end: `${appointment.date}T${appointment.end}:00`,
      backgroundColor: getStatusColor(appointment.status),
      borderColor: getStatusColor(appointment.status),
      textColor: '#ffffff',
      extendedProps: {
        appointmentId: appointment._id,
        status: appointment.status,
        type: appointment.appointmentType,
        meetingType: appointment.meetingType,
        duration: appointment.durationMins,
        notes: appointment.notes,
        clientNotes: appointment.clientNotes,
        lawyerNotes: appointment.lawyerNotes,
        meetingLink: appointment.meetingLink,
        client: role === 'lawyer' ? {
          id: appointment.userId?._id,
          name: `${appointment.userId?.firstName} ${appointment.userId?.lastName}`,
          email: appointment.userId?.email,
          phone: appointment.userId?.phone
        } : null,
        lawyer: role !== 'lawyer' ? {
          id: appointment.lawyerId?._id,
          name: `${appointment.lawyerId?.firstName} ${appointment.lawyerId?.lastName}`,
          email: appointment.lawyerId?.email,
          specialization: appointment.lawyerId?.specialization
        } : null
      }
    }));

    res.json({
      success: true,
      data: {
        events: calendarEvents,
        appointments: appointments,
        count: appointments.length,
        userRole: role
      }
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};

// @desc Update appointment status
// @route PUT /api/appointments/:id/status
// @access Private
const updateAppointmentStatus = async (req, res) => {
  try {
    if (!Booking) {
      return res.status(500).json({
        success: false,
        message: 'Booking system not available'
      });
    }

    const { id } = req.params;
    const { status, lawyerNotes, cancelReason } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const appointment = await Booking.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to update
    const canUpdate = (req.user.role === 'lawyer' && appointment.lawyerId.toString() === req.user.id) ||
                     (req.user.role === 'user' && appointment.userId.toString() === req.user.id) ||
                     req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Prepare update data
    const updateData = { status };
    
    if (lawyerNotes) {
      updateData.lawyerNotes = lawyerNotes;
    }
    
    // Handle status-specific updates
    if (status === 'confirmed') {
      updateData.confirmedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status === 'cancelled') {
      updateData.cancelReason = cancelReason || 'No reason provided';
      updateData.cancelledBy = req.user.id;
      updateData.cancelledAt = new Date();
    }

    const updatedAppointment = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'firstName lastName email')
     .populate('lawyerId', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status'
    });
  }
};

// @desc Get today's appointments for lawyer
// @route GET /api/appointments/today
// @access Private (Lawyer)
const getTodaysAppointments = async (req, res) => {
  try {
    if (!Booking) {
      return res.status(500).json({
        success: false,
        message: 'Booking system not available'
      });
    }

    const lawyerId = req.user.id;

    const appointments = await Booking.findTodaysAppointments(lawyerId);

    res.json({
      success: true,
      data: {
        appointments,
        count: appointments.length
      }
    });

  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s appointments'
    });
  }
};

// Helper function for status colors
function getStatusColor(status) {
  const colors = {
    'pending': '#fbbf24',    // yellow
    'confirmed': '#10b981',  // green
    'completed': '#6b7280',  // gray
    'cancelled': '#ef4444',  // red
    'no_show': '#f97316'     // orange
  };
  return colors[status] || '#6b7280';
}

// Routes - Updated to work with your Booking model
router.post('/', auth, requireAuth, createAppointment);
router.get('/', auth, requireAuth, getAppointments);
router.get('/lawyer/:lawyerId', auth, requireAuth, getLawyerAppointments);
router.get('/user/me', auth, requireAuth, getUserAppointments);
router.get('/today', auth, requireLawyer, getTodaysAppointments);
router.put('/:id/status', auth, requireAuth, updateAppointmentStatus);

module.exports = router;