const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // e.g., "09:00"
  endTime: { type: String, required: true },   // e.g., "17:00"
  isActive: { type: Boolean, default: true }
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
  day: { type: String, required: true }, // e.g., Monday
  isActive: { type: Boolean, default: false },
  timeSlots: { type: [timeSlotSchema], default: [] }
}, { _id: false });

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'lawyer', 'admin'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  specialization: { type: String },
  experience: { type: Number },
  location: { type: String },
  barNumber: { type: String },
  bio: { type: String },
  education: { type: [String], default: [] },
  certifications: { type: [String], default: [] },
  availability: { type: [dayScheduleSchema], default: [] },
  profileImage: { type: String },
  agree: { type: Boolean, required: true },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  otp: { type: String },
  otpExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 