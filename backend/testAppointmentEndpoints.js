// Test script to validate appointment functionality without database
const express = require('express');
const cors = require('cors');

// Mock data for testing
const mockAppointments = [
  {
    _id: '1',
    lawyerId: 'lawyer1',
    userId: {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@email.com',
      phone: '+1-555-0101'
    },
    date: new Date().toISOString().split('T')[0], // Today
    start: '10:00',
    end: '11:00',
    durationMins: 60,
    appointmentType: 'consultation',
    status: 'confirmed',
    meetingType: 'video_call',
    clientNotes: 'Looking forward to our meeting',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    lawyerId: 'lawyer1',
    userId: {
      _id: 'user2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@email.com',
      phone: '+1-555-0102'
    },
    date: new Date().toISOString().split('T')[0], // Today
    start: '14:00',
    end: '15:00',
    durationMins: 60,
    appointmentType: 'follow_up',
    status: 'pending',
    meetingType: 'phone_call',
    clientNotes: 'Follow-up on previous consultation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    lawyerId: 'lawyer1',
    userId: {
      _id: 'user3',
      firstName: 'Mike',
      lastName: 'Wilson',
      email: 'mike@email.com',
      phone: '+1-555-0103'
    },
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    start: '09:00',
    end: '10:30',
    durationMins: 90,
    appointmentType: 'document_review',
    status: 'confirmed',
    meetingType: 'in_person',
    clientNotes: 'Need help with contract review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const app = express();
app.use(cors());
app.use(express.json());

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 'lawyer1', role: 'lawyer' };
  next();
};

// Mock appointment endpoints for testing
app.get('/api/appointments/lawyer/stats', mockAuth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = mockAppointments.filter(apt => apt.date === today && ['pending', 'confirmed'].includes(apt.status));
  
  res.json({
    success: true,
    data: {
      todaysAppointments: todaysAppointments.length,
      thisMonthAppointments: mockAppointments.filter(apt => apt.status !== 'cancelled').length,
      pendingAppointments: mockAppointments.filter(apt => apt.status === 'pending').length,
      completedAppointments: mockAppointments.filter(apt => apt.status === 'completed').length,
      recentActivity: [
        {
          id: '1',
          message: 'New appointment booked by John Smith',
          time: new Date().toISOString(),
          type: 'booking'
        }
      ]
    }
  });
});

app.get('/api/appointments/lawyer/today', mockAuth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = mockAppointments.filter(apt => 
    apt.date === today && ['pending', 'confirmed'].includes(apt.status)
  );
  
  res.json({
    success: true,
    data: todaysAppointments
  });
});

app.get('/api/appointments/lawyer/upcoming', mockAuth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = mockAppointments.filter(apt => 
    apt.date >= today && ['pending', 'confirmed'].includes(apt.status)
  ).slice(0, parseInt(req.query.limit) || 10);
  
  res.json({
    success: true,
    data: upcomingAppointments
  });
});

app.get('/api/appointments/lawyer', mockAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      appointments: mockAppointments,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockAppointments.length,
        hasNext: false,
        hasPrev: false
      },
      stats: {
        pending: mockAppointments.filter(apt => apt.status === 'pending').length,
        confirmed: mockAppointments.filter(apt => apt.status === 'confirmed').length,
        completed: mockAppointments.filter(apt => apt.status === 'completed').length,
        cancelled: mockAppointments.filter(apt => apt.status === 'cancelled').length
      }
    }
  });
});

app.get('/api/appointments/lawyer/calendar', mockAuth, (req, res) => {
  const calendarEvents = mockAppointments.map(appointment => ({
    id: appointment._id,
    title: `${appointment.appointmentType} - ${appointment.userId.firstName} ${appointment.userId.lastName}`,
    start: `${appointment.date}T${appointment.start}`,
    end: `${appointment.date}T${appointment.end}`,
    status: appointment.status,
    client: {
      name: `${appointment.userId.firstName} ${appointment.userId.lastName}`,
      email: appointment.userId.email,
      phone: appointment.userId.phone
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
});

app.put('/api/appointments/:id/status', mockAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const appointment = mockAppointments.find(apt => apt._id === id);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }
  
  appointment.status = status;
  appointment.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: `Appointment ${status} successfully`,
    data: appointment
  });
});

const PORT = 5001; // Use different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`✅ Mock appointment server running on port ${PORT}`);
  console.log(`🧪 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/appointments/lawyer/stats`);
  console.log(`   GET  http://localhost:${PORT}/api/appointments/lawyer/today`);
  console.log(`   GET  http://localhost:${PORT}/api/appointments/lawyer/upcoming`);
  console.log(`   GET  http://localhost:${PORT}/api/appointments/lawyer`);
  console.log(`   GET  http://localhost:${PORT}/api/appointments/lawyer/calendar`);
});