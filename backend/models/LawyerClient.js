const mongoose = require('mongoose');

const lawyerClientSchema = new mongoose.Schema({
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Relationship metadata
  addedBy: {
    type: String,
    enum: ['manual', 'appointment', 'booking', 'referral'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'completed', 'inactive'],
    default: 'active',
    index: true
  },
  caseType: {
    type: String,
    enum: [
      'family_law', 'corporate_law', 'criminal_law', 'civil_litigation',
      'real_estate', 'immigration', 'personal_injury', 'employment',
      'intellectual_property', 'tax_law', 'estate_planning', 'other'
    ],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Case information
  caseTitle: {
    type: String,
    maxlength: 200
  },
  caseDescription: {
    type: String,
    maxlength: 1000
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  // Communication preferences
  preferredContact: {
    type: String,
    enum: ['email', 'phone', 'video_call', 'in_person'],
    default: 'email'
  },
  communicationNotes: {
    type: String,
    maxlength: 500
  },
  // Billing information
  hourlyRate: {
    type: Number,
    min: 0
  },
  totalBilled: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  // Important dates
  caseStartDate: {
    type: Date
  },
  caseEndDate: {
    type: Date
  },
  lastContactDate: {
    type: Date,
    default: Date.now
  },
  nextFollowUpDate: {
    type: Date
  },
  // Flags
  isArchived: {
    type: Boolean,
    default: false
  },
  requiresFollowUp: {
    type: Boolean,
    default: false
  },
  hasUnreadMessages: {
    type: Boolean,
    default: false
  },
  // Referral information
  referredBy: {
    type: String,
    maxlength: 100
  },
  referralNotes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure unique lawyer-client relationships
lawyerClientSchema.index({ lawyerId: 1, clientId: 1 }, { unique: true });

// Additional indexes for efficient queries
lawyerClientSchema.index({ lawyerId: 1, status: 1 });
lawyerClientSchema.index({ lawyerId: 1, caseType: 1 });
lawyerClientSchema.index({ lawyerId: 1, lastContactDate: -1 });
lawyerClientSchema.index({ lawyerId: 1, nextFollowUpDate: 1 });
lawyerClientSchema.index({ lawyerId: 1, isArchived: 1, status: 1 });

// Virtual for outstanding balance
lawyerClientSchema.virtual('outstandingBalance').get(function() {
  return this.totalBilled - this.totalPaid;
});

// Virtual for case duration
lawyerClientSchema.virtual('caseDuration').get(function() {
  if (!this.caseStartDate) return null;
  
  const endDate = this.caseEndDate || new Date();
  const diffTime = Math.abs(endDate - this.caseStartDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
  }
});

// Virtual for formatted case type
lawyerClientSchema.virtual('caseTypeFormatted').get(function() {
  const types = {
    family_law: 'Family Law',
    corporate_law: 'Corporate Law',
    criminal_law: 'Criminal Law',
    civil_litigation: 'Civil Litigation',
    real_estate: 'Real Estate',
    immigration: 'Immigration',
    personal_injury: 'Personal Injury',
    employment: 'Employment Law',
    intellectual_property: 'Intellectual Property',
    tax_law: 'Tax Law',
    estate_planning: 'Estate Planning',
    other: 'Other'
  };
  return types[this.caseType] || this.caseType;
});

// Static methods
lawyerClientSchema.statics.findByLawyer = function(lawyerId, options = {}) {
  const {
    status,
    caseType,
    isArchived = false,
    sortBy = 'lastContactDate',
    sortOrder = 'desc',
    limit,
    skip
  } = options;

  const query = { lawyerId, isArchived };
  
  if (status) query.status = status;
  if (caseType) query.caseType = caseType;

  let mongoQuery = this.find(query)
    .populate('clientId', 'firstName lastName email phone profileImage')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

  if (skip) mongoQuery = mongoQuery.skip(skip);
  if (limit) mongoQuery = mongoQuery.limit(limit);

  return mongoQuery;
};

lawyerClientSchema.statics.getClientStats = async function(lawyerId) {
  const stats = await this.aggregate([
    { $match: { lawyerId: new mongoose.Types.ObjectId(lawyerId), isArchived: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    active: 0,
    pending: 0,
    completed: 0,
    inactive: 0,
    total: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

lawyerClientSchema.statics.addClientFromAppointment = async function(lawyerId, clientId, appointmentData) {
  try {
    // Check if relationship already exists
    const existing = await this.findOne({ lawyerId, clientId });
    if (existing) {
      // Update last contact date if relationship exists
      existing.lastContactDate = new Date();
      if (existing.status === 'inactive') {
        existing.status = 'active';
      }
      return await existing.save();
    }

    // Create new client relationship
    const clientRelation = await this.create({
      lawyerId,
      clientId,
      addedBy: 'appointment',
      status: 'active',
      caseType: appointmentData.appointmentType === 'consultation' ? 'other' : 'other',
      caseTitle: `Case initiated from ${appointmentData.appointmentType}`,
      notes: `Client added automatically from appointment on ${appointmentData.date}`,
      lastContactDate: new Date(),
      caseStartDate: new Date()
    });

    return clientRelation;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - relationship already exists
      return await this.findOne({ lawyerId, clientId });
    }
    throw error;
  }
};

// Instance methods
lawyerClientSchema.methods.updateContactDate = function() {
  this.lastContactDate = new Date();
  return this.save();
};

lawyerClientSchema.methods.markComplete = function(notes) {
  this.status = 'completed';
  this.caseEndDate = new Date();
  if (notes) {
    this.notes = this.notes ? `${this.notes}\n\n[Completion] ${notes}` : `[Completion] ${notes}`;
  }
  return this.save();
};

lawyerClientSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

lawyerClientSchema.methods.addNote = function(note) {
  const timestamp = new Date().toISOString().split('T')[0];
  const noteWithTimestamp = `[${timestamp}] ${note}`;
  this.notes = this.notes ? `${this.notes}\n\n${noteWithTimestamp}` : noteWithTimestamp;
  return this.save();
};

module.exports = mongoose.model('LawyerClient', lawyerClientSchema);