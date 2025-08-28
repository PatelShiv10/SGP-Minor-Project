const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String, required: true },
  userName: { type: String },
  type: { type: String, enum: ['bug', 'suggestion', 'general'], default: 'general' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);