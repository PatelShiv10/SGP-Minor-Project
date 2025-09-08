const Booking = require('../models/Booking');
const User = require('../models/User');
const LawyerFeedback = require('../models/LawyerFeedback');
const LawyerClient = require('../models/LawyerClient');
const { validationResult } = require('express-validator');

// @desc    Get all appointments for a lawyer
// @route   GET /api/appointments/lawyer
// @access  Private (Lawyer)
const getLawyerAppointments = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      startDate, 
      endDate, 
      sortBy = 'date', 
      sortOrder = 'asc' 
    } = req.query;

    // Build query
    const query = { lawyerId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // If sorting by date, also sort by start time
    if (sortBy === 'date') {
      sortObj.start = 1;
    }

    const appointments = await Booking.find(query)
      .populate('userId', 'firstName lastName email phone')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Booking.countDocuments(query);

    // Get statistics
    const stats = await Booking.aggregate([
      { $match: { lawyerId: req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {};
    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: skip + appointments.length < total,
          hasPrev: parseInt(page) > 1
        },
        stats: statusCounts
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

// @desc    Get today's appointments for a lawyer
// @route   GET /api/appointments/lawyer/today
// @access  Private (Lawyer)
const getTodaysAppointments = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const appointments = await Booking.findTodaysAppointments(lawyerId);

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s appointments'
    });
  }
};

// @desc    Get upcoming appointments for a lawyer
// @route   GET /api/appointments/lawyer/upcoming
// @access  Private (Lawyer)
const getUpcomingAppointments = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const { limit = 10 } = req.query;
    
    const appointments = await Booking.findUpcomingAppointments(lawyerId, parseInt(limit));

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming appointments'
    });
  }
};

// @desc    Get appointments by date range for calendar view
// @route   GET /api/appointments/lawyer/calendar
// @access  Private (Lawyer)
const getCalendarAppointments = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const { startDate, endDate, status } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const appointments = await Booking.findByDateRange(lawyerId, startDate, endDate, status);

    // Format for calendar
    const calendarEvents = appointments.map(appointment => ({
      id: appointment._id,
      title: `${appointment.appointmentType} - ${appointment.userId?.firstName} ${appointment.userId?.lastName}`,
      start: `${appointment.date}T${appointment.start}`,
      end: `${appointment.date}T${appointment.end}`,
      status: appointment.status,
      client: {
        name: `${appointment.userId?.firstName} ${appointment.userId?.lastName}`,
        email: appointment.userId?.email,
        phone: appointment.userId?.phone
      },
      type: appointment.appointmentType,
      meetingType: appointment.meetingType,
      notes: appointment.notes,
      clientNotes: appointment.clientNotes
    }));

    res.json({
      success: true,
      data: calendarEvents
    });

  } catch (error) {
    console.error('Error fetching calendar appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar appointments'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/appointments/lawyer/stats
// @access  Private (Lawyer)
const getDashboardStats = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Today's appointments count
    const todaysCount = await Booking.countDocuments({
      lawyerId,
      date: today,
      status: { $in: ['pending', 'confirmed'] }
    });

    // This month's appointments count
    const thisMonthCount = await Booking.countDocuments({
      lawyerId,
      date: { $regex: `^${thisMonth}` },
      status: { $ne: 'cancelled' }
    });

    // Pending appointments count
    const pendingCount = await Booking.countDocuments({
      lawyerId,
      status: 'pending',
      date: { $gte: today }
    });

    // Total completed appointments
    const completedCount = await Booking.countDocuments({
      lawyerId,
      status: 'completed'
    });

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = await Booking.find({
      lawyerId,
      createdAt: { $gte: weekAgo }
    })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const activities = recentActivity.map(appointment => ({
      id: appointment._id,
      message: `New appointment booked by ${appointment.userId?.firstName} ${appointment.userId?.lastName}`,
      time: appointment.createdAt,
      type: 'booking'
    }));

    // Recent reviews (show immediately, regardless of approval)
    let recentReviews = [];
    try {
      recentReviews = await LawyerFeedback.find({ lawyerId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('rating comment clientName createdAt isApproved response')
        .lean();
    } catch (e) {
      // non-fatal
      recentReviews = [];
    }

    res.json({
      success: true,
      data: {
        todaysAppointments: todaysCount,
        thisMonthAppointments: thisMonthCount,
        pendingAppointments: pendingCount,
        completedAppointments: completedCount,
        recentActivity: activities,
        recentReviews
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private (Lawyer or Client)
const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build query based on user role
    let query = { _id: id };
    if (userRole === 'lawyer') {
      query.lawyerId = userId;
    } else {
      query.userId = userId;
    }

    const appointment = await Booking.findOne(query)
      .populate('lawyerId', 'firstName lastName email specialization')
      .populate('userId', 'firstName lastName email phone')
      .lean();

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or access denied'
      });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment details'
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Lawyer)
const updateAppointmentStatus = async (req, res) => {
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
    const { status, reason, notes } = req.body;
    const lawyerId = req.user.id;

    const appointment = await Booking.findOne({ 
      _id: id, 
      lawyerId 
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update based on status
    if (status === 'confirmed') {
      await appointment.confirm();
      
      // Auto-add client when appointment is confirmed
      try {
        await LawyerClient.addClientFromAppointment(lawyerId, appointment.userId, {
          appointmentType: appointment.appointmentType,
          date: appointment.date,
          start: appointment.start
        });
      } catch (error) {
        console.error('Failed to add client relationship on confirmation:', error);
      }
    } else if (status === 'cancelled') {
      await appointment.cancel(reason, lawyerId);
    } else if (status === 'completed') {
      await appointment.complete();
    } else {
      appointment.status = status;
      await appointment.save();
    }

    // Add lawyer notes if provided
    if (notes) {
      appointment.lawyerNotes = notes;
      await appointment.save();
    }

    // Populate and return updated appointment
    const updatedAppointment = await Booking.findById(id)
      .populate('userId', 'firstName lastName email phone')
      .lean();

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
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

// @desc    Add notes to appointment
// @route   PUT /api/appointments/:id/notes
// @access  Private (Lawyer)
const updateAppointmentNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { lawyerNotes } = req.body;
    const lawyerId = req.user.id;

    const appointment = await Booking.findOneAndUpdate(
      { _id: id, lawyerId },
      { lawyerNotes },
      { new: true }
    ).populate('userId', 'firstName lastName email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Notes updated successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Error updating appointment notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notes'
    });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (Lawyer or Client)
const rescheduleAppointment = async (req, res) => {
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
    const { date, start, durationMins } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find appointment
    let query = { _id: id };
    if (userRole === 'lawyer') {
      query.lawyerId = userId;
    } else {
      query.userId = userId;
    }

    const appointment = await Booking.findOne(query);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if the new slot is available
    const conflictingAppointment = await Booking.findOne({
      lawyerId: appointment.lawyerId,
      date,
      start,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: id }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'The selected time slot is not available'
      });
    }

    // Update appointment
    appointment.date = date;
    appointment.start = start;
    if (durationMins) {
      appointment.durationMins = durationMins;
    }
    appointment.status = 'pending'; // Reset to pending after reschedule

    await appointment.save();

    const updatedAppointment = await Booking.findById(id)
      .populate('lawyerId', 'firstName lastName')
      .populate('userId', 'firstName lastName email phone')
      .lean();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule appointment'
    });
  }
};

module.exports = {
  getLawyerAppointments,
  getTodaysAppointments,
  getUpcomingAppointments,
  getCalendarAppointments,
  getDashboardStats,
  getAppointmentDetails,
  updateAppointmentStatus,
  updateAppointmentNotes,
  rescheduleAppointment
};