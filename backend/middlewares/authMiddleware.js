const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

exports.admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.lawyer = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'lawyer') {
      return res.status(403).json({ message: 'Access denied. Lawyer role required.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}; 