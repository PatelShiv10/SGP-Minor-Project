const User = require('../models/User');
const Booking = require('../models/Booking');

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHmm(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function expandDaySlots(daySchedule, stepMins = 30) {
  if (!daySchedule?.isActive) return [];
  const slots = [];
  for (const s of daySchedule.timeSlots || []) {
    if (!s.isActive) continue;
    const start = toMinutes(s.startTime);
    const end = toMinutes(s.endTime);
    for (let t = start; t + stepMins <= end; t += stepMins) {
      slots.push(toHHmm(t));
    }
  }
  return slots;
}

exports.getExpandedSlots = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { start, end } = req.query; // YYYY-MM-DD
    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'start and end are required (YYYY-MM-DD)' });
    }

    const lawyer = await User.findById(lawyerId).select('availability role isVerified');
    if (!lawyer || lawyer.role !== 'lawyer' || !lawyer.isVerified) {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date range' });
    }

    const results = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = dayNames[d.getDay()];
      const daySchedule = (lawyer.availability || []).find(x => x.day === dayName);
      let slots = expandDaySlots(daySchedule, 30);

      if (slots.length > 0) {
        // Exclude already booked slots
        const bookings = await Booking.find({ 
          lawyerId, 
          date: dateStr, 
          status: { $in: ['pending', 'confirmed'] } 
        }).select('start');
        const bookedSet = new Set(bookings.map(b => b.start));
        slots = slots.filter(s => !bookedSet.has(s));
      }

      results.push({ date: dateStr, slots });
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error getting expanded slots:', error);
    res.status(500).json({ success: false, message: 'Failed to get slots' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { lawyerId, date, start, durationMins = 30 } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!lawyerId || !date || !start) {
      return res.status(400).json({ success: false, message: 'lawyerId, date, start are required' });
    }

    const lawyer = await User.findById(lawyerId).select('availability role isVerified');
    if (!lawyer || lawyer.role !== 'lawyer' || !lawyer.isVerified) {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    // Validate start is in expanded slots for the date
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const d = new Date(date + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return res.status(400).json({ success: false, message: 'Invalid date' });
    const dayName = dayNames[d.getDay()];
    const daySchedule = (lawyer.availability || []).find(x => x.day === dayName);
    const validSlots = new Set(expandDaySlots(daySchedule, 30));
    if (!validSlots.has(start)) {
      return res.status(400).json({ success: false, message: 'Selected time is not available' });
    }

    // Try to create booking (unique index prevents double-booking)
    const booking = await Booking.create({ 
      lawyerId, 
      userId, 
      date, 
      start, 
      durationMins, 
      status: 'pending',
      appointmentType: req.body.appointmentType || 'consultation',
      meetingType: req.body.meetingType || 'video_call',
      clientNotes: req.body.notes || ''
    });
    res.status(201).json({ success: true, message: 'Booking confirmed', data: booking });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This slot has just been booked by someone else' });
    }
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};