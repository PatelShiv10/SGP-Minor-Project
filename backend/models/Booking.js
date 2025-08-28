const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD in lawyer's local or agreed timezone
  start: { type: String, required: true }, // HH:mm 24h
  durationMins: { type: Number, default: 30 },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });

bookingSchema.index({ lawyerId: 1, date: 1, start: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);