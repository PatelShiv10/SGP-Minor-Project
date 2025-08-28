const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  getLawyerAppointments,
  getTodaysAppointments,
  getUpcomingAppointments,
  getCalendarAppointments,
  getDashboardStats,
  getAppointmentDetails,
  updateAppointmentStatus,
  updateAppointmentNotes,
  rescheduleAppointment
} = require('../controllers/appointmentController');
const { protect, lawyer } = require('../middlewares/authMiddleware');

// Validation middleware
const validateAppointmentStatus = [
  body('status')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .withMessage('Invalid status'),
  body('reason')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const validateReschedule = [
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('start')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:mm format'),
  body('durationMins')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes')
];

const validateDateRange = [
  query('startDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Start date must be in YYYY-MM-DD format'),
  query('endDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('End date must be in YYYY-MM-DD format')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// ============= LAWYER ROUTES =============

// Get all appointments for lawyer
router.get('/lawyer', 
  protect, 
  lawyer, 
  validateDateRange,
  validatePagination,
  getLawyerAppointments
);

// Get today's appointments for lawyer
router.get('/lawyer/today', 
  protect, 
  lawyer, 
  getTodaysAppointments
);

// Get upcoming appointments for lawyer
router.get('/lawyer/upcoming', 
  protect, 
  lawyer, 
  getUpcomingAppointments
);

// Get calendar view appointments for lawyer
router.get('/lawyer/calendar', 
  protect, 
  lawyer,
  [
    query('startDate')
      .notEmpty()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Start date is required in YYYY-MM-DD format'),
    query('endDate')
      .notEmpty()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('End date is required in YYYY-MM-DD format')
  ],
  getCalendarAppointments
);

// Get dashboard statistics for lawyer
router.get('/lawyer/stats', 
  protect, 
  lawyer, 
  getDashboardStats
);

// ============= SHARED ROUTES =============

// Get appointment details (lawyer or client)
router.get('/:id', 
  protect,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID')
  ],
  getAppointmentDetails
);

// ============= LAWYER-ONLY ACTIONS =============

// Update appointment status (lawyer only)
router.put('/:id/status', 
  protect, 
  lawyer,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID'),
    ...validateAppointmentStatus
  ],
  updateAppointmentStatus
);

// Update appointment notes (lawyer only)
router.put('/:id/notes', 
  protect, 
  lawyer,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID'),
    body('lawyerNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Notes cannot exceed 1000 characters')
  ],
  updateAppointmentNotes
);

// Reschedule appointment (lawyer or client)
router.put('/:id/reschedule', 
  protect,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid appointment ID'),
    ...validateReschedule
  ],
  rescheduleAppointment
);

module.exports = router;