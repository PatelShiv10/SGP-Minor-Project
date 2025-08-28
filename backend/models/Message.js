const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: String, enum: ['user', 'lawyer'], required: true },
  text: { type: String, required: true },
  readAt: { type: Date },
}, { timestamps: true });

messageSchema.index({ userId: 1, lawyerId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);