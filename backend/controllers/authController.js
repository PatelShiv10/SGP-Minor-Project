const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateNumericOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.signupUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, agree } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ errors: ['Email already exists'] });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateNumericOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    const user = new User({
      role: 'user',
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      agree: true,
      isVerified: false,
      otp,
      otpExpires
    });
    await user.save();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your LawMate OTP Code',
      html: `<div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border-radius:8px;background:#f9f9f9;border:1px solid #eee;">
        <h2 style="color:#008080;">Welcome to LawMate!</h2>
        <p>Hi <b>${firstName}</b>,</p>
        <p>Thank you for signing up. Please use the following OTP to verify your email address:</p>
        <div style="font-size:2rem;font-weight:bold;letter-spacing:8px;margin:16px 0;color:#008080;">${otp}</div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p style="margin-top:24px;color:#888;">&mdash; LawMate Team</p>
      </div>`
    });
    res.status(201).json({ message: 'Signup successful! OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ['Server error'] });
  }
};

exports.signupLawyer = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, specialization, experience, location, barNumber, bio, agree } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ errors: ['Email already exists'] });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateNumericOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    const lawyer = new User({
      role: 'lawyer',
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      specialization,
      experience,
      location,
      barNumber,
      bio,
      agree: true,
      isVerified: false,
      status: 'pending', // Set initial status as pending
      otp,
      otpExpires
    });
    await lawyer.save();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: lawyer.email,
      subject: 'Your LawMate OTP Code',
      html: `<div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border-radius:8px;background:#f9f9f9;border:1px solid #eee;">
        <h2 style="color:#008080;">Welcome to LawMate!</h2>
        <p>Hi <b>${firstName}</b>,</p>
        <p>Thank you for signing up. Please use the following OTP to verify your email address:</p>
        <div style="font-size:2rem;font-weight:bold;letter-spacing:8px;margin:16px 0;color:#008080;">${otp}</div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p style="margin-top:24px;color:#888;">&mdash; LawMate Team</p>
      </div>`
    });
    res.status(201).json({ message: 'Signup successful! OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ['Server error'] });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ errors: ['User not found'] });
  if (user.isVerified) return res.status(400).json({ errors: ['Already verified'] });
  if (user.otp !== String(otp) || user.otpExpires < new Date()) {
    return res.status(400).json({ errors: ['Invalid or expired OTP'] });
  }
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  res.json({ message: 'Email verified successfully' });
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }
  
  if (!user.isVerified) {
    return res.status(403).json({ message: 'Please verify your email before logging in' });
  }
  
  // Check if user is trying to login with the correct role
  if (user.role !== role) {
    return res.status(403).json({ message: `Invalid login attempt. Please login as ${user.role}` });
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }
  
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  res.json({ 
    message: 'Login successful',
    token, 
    user: { 
      id: user._id, 
      email: user.email, 
      role: user.role, 
      firstName: user.firstName, 
      lastName: user.lastName 
    } 
  });
};

exports.loginWithOtp = async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role are required' });
  }
  const user = await User.findOne({ email, role });
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }
  if (!user.isVerified) {
    return res.status(401).json({ message: 'OTP not verified' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: 'Login successful', token, user: {
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  }});
}; 