const User = require('../models/User');

// Get all lawyers for admin dashboard
exports.getAllLawyers = async (req, res) => {
  try {
    const lawyers = await User.find({ role: 'lawyer' })
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: lawyers
    });
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyers'
    });
  }
};

// Get approved lawyers for public display
exports.getApprovedLawyers = async (req, res) => {
  try {
    const lawyers = await User.find({ 
      role: 'lawyer', 
      isVerified: true 
    })
      .select('-password -otp -otpExpires -phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: lawyers
    });
  } catch (error) {
    console.error('Error fetching approved lawyers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyers'
    });
  }
};

// Update lawyer status (approve/reject)
exports.updateLawyerStatus = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, rejected, or pending'
      });
    }

    const lawyer = await User.findByIdAndUpdate(
      lawyerId,
      { 
        status,
        isVerified: status === 'approved' ? true : false
      },
      { new: true }
    ).select('-password -otp -otpExpires');

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    // Send email notification
    try {
      const { sendMail } = require('../utils/mailer');
      const subject = status === 'approved' 
        ? 'Your LawMate lawyer account has been approved'
        : status === 'rejected'
          ? 'Your LawMate lawyer account application has been rejected'
          : 'Your LawMate lawyer account status has changed';
      const html = `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border-radius:8px;background:#f9f9f9;border:1px solid #eee;">
          <h2 style="color:#008080;margin:0 0 12px">LawMate Update</h2>
          <p>Hi <b>${lawyer.firstName}</b>,</p>
          <p>Your lawyer account status has been updated to <b>${status}</b>.</p>
          ${status === 'approved' ? '<p>You can now be discovered in the Find a Lawyer directory and start receiving bookings.</p>' : ''}
          ${status === 'rejected' ? '<p>If you believe this is an error, please reply to this email with additional details.</p>' : ''}
          <p style="margin-top:24px;color:#888;">— LawMate Team</p>
        </div>
      `;
      await sendMail({ to: lawyer.email, subject, html });
    } catch (mailErr) {
      console.warn('Failed to send status email:', mailErr);
    }

    res.json({
      success: true,
      message: `Lawyer ${status} successfully`,
      data: lawyer
    });
  } catch (error) {
    console.error('Error updating lawyer status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lawyer status'
    });
  }
};

// Delete lawyer
exports.deleteLawyer = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    const lawyer = await User.findByIdAndDelete(lawyerId);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    res.json({
      success: true,
      message: 'Lawyer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lawyer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lawyer'
    });
  }
};

// Get lawyer statistics for admin dashboard
exports.getLawyerStats = async (req, res) => {
  try {
    const totalLawyers = await User.countDocuments({ role: 'lawyer' });
    const approvedLawyers = await User.countDocuments({ role: 'lawyer', isVerified: true });
    const pendingLawyers = await User.countDocuments({ role: 'lawyer', isVerified: false });
    const rejectedLawyers = await User.countDocuments({ role: 'lawyer', status: 'rejected' });

    res.json({
      success: true,
      data: {
        totalLawyers,
        approvedLawyers,
        pendingLawyers,
        rejectedLawyers
      }
    });
  } catch (error) {
    console.error('Error fetching lawyer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyer statistics'
    });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('__hasNewMessages role');
    if (!me || me.role !== 'lawyer') return res.status(403).json({ success: false, message: 'Forbidden' });
    const hasNew = Boolean(me.__hasNewMessages);

    const shouldClear = (req.query.clear ?? 'true') !== 'false';
    if (shouldClear && hasNew) {
      await User.findByIdAndUpdate(req.user.id, { $unset: { __hasNewMessages: 1 } });
    }

    res.json({ success: true, data: { hasNewMessages: hasNew } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// Fetch the current logged-in lawyer's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password -otp -otpExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'lawyer') {
      return res.status(403).json({ success: false, message: 'Access denied. Lawyer role required.' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching my profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// Update the current logged-in lawyer's profile
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'specialization',
      'experience',
      'location',
      'barNumber',
      'bio',
      'education',
      'certifications',
      'profileImage'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password -otp -otpExpires');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (updatedUser.role !== 'lawyer') {
      return res.status(403).json({ success: false, message: 'Access denied. Lawyer role required.' });
    }

    res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Error updating my profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// Set or update current lawyer availability
exports.updateMyAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body; // array of day schedules

    if (!Array.isArray(availability)) {
      return res.status(400).json({ success: false, message: 'Invalid availability format' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'lawyer') return res.status(403).json({ success: false, message: 'Access denied. Lawyer role required.' });

    user.availability = availability;
    await user.save();

    res.json({ success: true, message: 'Availability updated successfully', data: user.availability });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ success: false, message: 'Failed to update availability' });
  }
};

// Get current lawyer availability
exports.getMyAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('availability role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role !== 'lawyer') return res.status(403).json({ success: false, message: 'Access denied. Lawyer role required.' });
    res.json({ success: true, data: user.availability || [] });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch availability' });
  }
};

// Public: Get lawyer profile by ID (for public view and booking)
exports.getPublicLawyerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select('-password -otp -otpExpires -phone')
      .lean();

    if (!user || user.role !== 'lawyer' || !user.isVerified) {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching public lawyer profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lawyer profile' });
  }
}; 