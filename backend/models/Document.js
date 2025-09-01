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
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
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
  documentType: { 
    type: String, 
    enum: ['contract', 'brief', 'evidence', 'correspondence', 'legal_document', 'other'],
    default: 'other'
  },
  status: { 
    type: String, 
    enum: ['new', 'reviewed', 'needs_attention', 'approved', 'rejected'],
    default: 'new'
  },
  tags: [{ 
    type: String, 
    trim: true 
  }],
  isPublic: { 
    type: Boolean, 
    default: false 
  },
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
    type: String 
  },
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  lastAccessed: { 
    type: Date 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
documentSchema.index({ lawyerId: 1, clientId: 1 });
documentSchema.index({ lawyerId: 1, status: 1 });
documentSchema.index({ lawyerId: 1, documentType: 1 });
documentSchema.index({ createdAt: -1 });

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

// Static method to get document statistics for a lawyer
documentSchema.statics.getLawyerDocumentStats = async function(lawyerId) {
  const stats = await this.aggregate([
    { $match: { lawyerId: new mongoose.Types.ObjectId(lawyerId) } },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        byStatus: {
          $push: '$status'
        },
        byType: {
          $push: '$documentType'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalDocuments: 0,
      totalSize: 0,
      statusDistribution: {},
      typeDistribution: {}
    };
  }

  const { totalDocuments, totalSize, byStatus, byType } = stats[0];
  
  // Calculate status distribution
  const statusDistribution = {};
  byStatus.forEach(status => {
    statusDistribution[status] = (statusDistribution[status] || 0) + 1;
  });

  // Calculate type distribution
  const typeDistribution = {};
  byType.forEach(type => {
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });

  return {
    totalDocuments,
    totalSize,
    statusDistribution,
    typeDistribution
  };
};

// Static method to get client document statistics
documentSchema.statics.getClientDocumentStats = async function(lawyerId, clientId) {
  const stats = await this.aggregate([
    { 
      $match: { 
        lawyerId: new mongoose.Types.ObjectId(lawyerId),
        clientId: new mongoose.Types.ObjectId(clientId)
      } 
    },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        byStatus: {
          $push: '$status'
        },
        byType: {
          $push: '$documentType'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalDocuments: 0,
      totalSize: 0,
      statusDistribution: {},
      typeDistribution: {}
    };
  }

  const { totalDocuments, totalSize, byStatus, byType } = stats[0];
  
  // Calculate status distribution
  const statusDistribution = {};
  byStatus.forEach(status => {
    statusDistribution[status] = (statusDistribution[status] || 0) + 1;
  });

  // Calculate type distribution
  const typeDistribution = {};
  byType.forEach(type => {
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });

  return {
    totalDocuments,
    totalSize,
    statusDistribution,
    typeDistribution
  };
};

module.exports = mongoose.model('Document', documentSchema);