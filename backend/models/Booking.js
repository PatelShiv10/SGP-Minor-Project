const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  lawyerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  date: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  start: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:mm format'
    }
  },
  end: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:mm format'
    }
  },
  durationMins: { 
    type: Number, 
    default: 30,
    min: 15,
    max: 480 // 8 hours max
  },
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow_up', 'document_review', 'legal_advice', 'court_preparation', 'other'],
    default: 'consultation'
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'], 
    default: 'pending',
    index: true
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  clientNotes: {
    type: String,
    maxlength: 500
  },
  lawyerNotes: {
    type: String,
    maxlength: 1000
  },
  meetingType: {
    type: String,
    enum: ['in_person', 'video_call', 'phone_call'],
    default: 'video_call'
  },
  meetingLink: {
    type: String
  },
  cancelReason: {
    type: String,
    maxlength: 500
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  confirmedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
bookingSchema.index({ lawyerId: 1, date: 1, start: 1 }, { unique: true });
bookingSchema.index({ userId: 1, date: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ lawyerId: 1, status: 1, date: 1 });

// Virtual for full date-time
bookingSchema.virtual('startDateTime').get(function() {
  return new Date(`${this.date}T${this.start}:00`);
});

bookingSchema.virtual('endDateTime').get(function() {
  return new Date(`${this.date}T${this.end}:00`);
});

// Virtual for duration in readable format
bookingSchema.virtual('durationFormatted').get(function() {
  const hours = Math.floor(this.durationMins / 60);
  const mins = this.durationMins % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
});

// Virtual for time range
bookingSchema.virtual('timeRange').get(function() {
  return `${this.start} - ${this.end}`;
});

// Static methods
bookingSchema.statics.findByDateRange = function(lawyerId, startDate, endDate, status = null) {
  const query = {
    lawyerId,
    date: { $gte: startDate, $lte: endDate }
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email phone')
    .sort({ date: 1, start: 1 });
};

bookingSchema.statics.findTodaysAppointments = function(lawyerId) {
  const today = new Date().toISOString().split('T')[0];
  return this.find({
    lawyerId,
    date: today,
    status: { $in: ['pending', 'confirmed'] }
  })
    .populate('userId', 'firstName lastName email phone')
    .sort({ start: 1 });
};

bookingSchema.statics.findUpcomingAppointments = function(lawyerId, limit = 10) {
  const today = new Date().toISOString().split('T')[0];
  return this.find({
    lawyerId,
    date: { $gte: today },
    status: { $in: ['pending', 'confirmed'] }
  })
    .populate('userId', 'firstName lastName email phone')
    .sort({ date: 1, start: 1 })
    .limit(limit);
};

// Instance methods
bookingSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancelReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  return this.save();
};

bookingSchema.methods.confirm = function() {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  return this.save();
};

bookingSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

bookingSchema.methods.isToday = function() {
  const today = new Date().toISOString().split('T')[0];
  return this.date === today;
};

bookingSchema.methods.isPast = function() {
  const now = new Date();
  const appointmentDateTime = new Date(`${this.date}T${this.end}:00`);
  return appointmentDateTime < now;
};

bookingSchema.methods.isUpcoming = function() {
  const now = new Date();
  const appointmentDateTime = new Date(`${this.date}T${this.start}:00`);
  return appointmentDateTime > now;
};

// Pre-save middleware to calculate end time
bookingSchema.pre('save', function(next) {
  // Always calculate end time if start and duration are available
  if (this.start && this.durationMins) {
    const [hours, minutes] = this.start.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + this.durationMins;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    this.end = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }
  
  // If end is provided but doesn't match calculated duration, recalculate
  if (this.start && this.end && this.durationMins) {
    const [startHours, startMins] = this.start.split(':').map(Number);
    const [endHours, endMins] = this.end.split(':').map(Number);
    const startTotal = startHours * 60 + startMins;
    const endTotal = endHours * 60 + endMins;
    const calculatedDuration = endTotal - startTotal;
    
    if (calculatedDuration !== this.durationMins) {
      this.durationMins = calculatedDuration;
    }
  }
  
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);