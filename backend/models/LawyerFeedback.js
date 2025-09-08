const mongoose = require('mongoose');

const lawyerFeedbackSchema = new mongoose.Schema({
  lawyerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Allow anonymous feedback
  },
  clientName: { 
    type: String, 
    required: function() {
      // Only required if not anonymous
      return !this.isAnonymous;
    },
    default: ''
  },
  clientEmail: { 
    type: String, 
    required: function() {
      // Only required if not anonymous
      return !this.isAnonymous;
    },
    default: ''
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  serviceType: { 
    type: String, 
    enum: ['consultation', 'document_review', 'legal_advice', 'representation', 'other'], 
    default: 'consultation' 
  },
  isAnonymous: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false }, // Require approval before showing publicly
  helpfulVotes: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  response: {
    message: { type: String },
    respondedAt: { type: Date },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
lawyerFeedbackSchema.index({ lawyerId: 1, isApproved: 1 });
lawyerFeedbackSchema.index({ lawyerId: 1, rating: -1 });
lawyerFeedbackSchema.index({ createdAt: -1 });

// Virtual to calculate if feedback is recent (within 30 days)
lawyerFeedbackSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.createdAt > thirtyDaysAgo;
});

// Static method to calculate lawyer's average rating
lawyerFeedbackSchema.statics.getAverageRating = async function(lawyerId) {
  const result = await this.aggregate([
    { 
      $match: { 
        lawyerId: new mongoose.Types.ObjectId(lawyerId), 
        // Include all feedback for lawyer's own view, but this method is also used for public stats
        // We'll handle the approval filter in the controller
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return { averageRating: 0, totalReviews: 0, ratingDistribution: [] };
  }

  const { averageRating, totalReviews, ratingDistribution } = result[0];
  
  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews,
    distribution
  };
};

// Static method to get recent reviews for a lawyer
lawyerFeedbackSchema.statics.getRecentReviews = async function(lawyerId, limit = 5) {
  return await this.find({ 
    lawyerId: new mongoose.Types.ObjectId(lawyerId), 
    isApproved: true 
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('clientId', 'firstName lastName')
  .lean();
};

// Static method to get all reviews for lawyer (including pending)
lawyerFeedbackSchema.statics.getAllReviewsForLawyer = async function(lawyerId, limit = 10) {
  return await this.find({ 
    lawyerId: new mongoose.Types.ObjectId(lawyerId)
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('clientId', 'firstName lastName')
  .lean();
};
module.exports = mongoose.model('LawyerFeedback', lawyerFeedbackSchema);