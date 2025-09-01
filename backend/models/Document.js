const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
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
  lawyerClientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LawyerClient',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  fileName: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'contract', 'legal_brief', 'evidence', 'correspondence', 
      'court_document', 'financial', 'medical', 'police_report',
      'witness_statement', 'expert_report', 'other'
    ],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'reviewed', 'approved', 'rejected', 'archived'],
    default: 'pending_review'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    maxlength: 1000
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadedAt: {
    type: Date
  },
  lastDownloadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ lawyerId: 1, clientId: 1 });
documentSchema.index({ lawyerClientId: 1, createdAt: -1 });
documentSchema.index({ status: 1, priority: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ tags: 1 });

// Virtual for formatted file size
documentSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for file extension
documentSchema.virtual('fileExtension').get(function() {
  return this.originalFileName.split('.').pop().toLowerCase();
});

// Virtual for isImage
documentSchema.virtual('isImage').get(function() {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  return imageTypes.includes(this.mimeType);
});

// Virtual for isPDF
documentSchema.virtual('isPDF').get(function() {
  return this.mimeType === 'application/pdf';
});

// Pre-save middleware to update review timestamp
documentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'reviewed' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  next();
});

// Static method to get document statistics
documentSchema.statics.getDocumentStats = async function(lawyerId, clientId = null) {
  const matchStage = { lawyerId, isDeleted: false };
  if (clientId) {
    matchStage.clientId = clientId;
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        byStatus: {
          $push: '$status'
        },
        byCategory: {
          $push: '$category'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalDocuments: 0,
      totalSize: 0,
      byStatus: {},
      byCategory: {}
    };
  }

  const stat = stats[0];
  const statusCount = stat.byStatus.reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const categoryCount = stat.byCategory.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return {
    totalDocuments: stat.totalDocuments,
    totalSize: stat.totalSize,
    byStatus: statusCount,
    byCategory: categoryCount
  };
};

module.exports = mongoose.model('Document', documentSchema);