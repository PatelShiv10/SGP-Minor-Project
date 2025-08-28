const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res) => {
  try {
    const { type = 'general', subject, message, priority = 'medium' } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const user = req.user || null;
    const userEmail = user?.email || req.body.email;
    const userName = user ? `${user.firstName} ${user.lastName}` : req.body.name;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const feedback = await Feedback.create({
      userId: user ? user.id : undefined,
      userEmail,
      userName,
      type,
      subject,
      message,
      priority
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (e) {
    console.error('Error creating feedback:', e);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
};

exports.listFeedback = async (_req, res) => {
  try {
    const list = await Feedback.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (e) {
    console.error('Error listing feedback:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;
    const update = {};
    if (status) {
      if (!['pending', 'resolved'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
      update.status = status;
      update.resolvedAt = status === 'resolved' ? new Date() : undefined;
    }
    if (priority) {
      if (!['low','medium','high'].includes(priority)) return res.status(400).json({ success: false, message: 'Invalid priority' });
      update.priority = priority;
    }
    const fb = await Feedback.findByIdAndUpdate(id, update, { new: true });
    if (!fb) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, data: fb });
  } catch (e) {
    console.error('Error updating feedback:', e);
    res.status(500).json({ success: false, message: 'Failed to update feedback' });
  }
};