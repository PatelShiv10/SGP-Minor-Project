const mongoose = require('mongoose');
const LawyerClient = require('../models/LawyerClient');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// @desc    Get all clients for a lawyer
// @route   GET /api/clients/lawyer
// @access  Private (Lawyer)
const getLawyerClients = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const {
      page = 1,
      limit = 20,
      status,
      caseType,
      search,
      sortBy = 'lastContactDate',
      sortOrder = 'desc',
      isArchived = false
    } = req.query;

    // Build query
    const query = { lawyerId, isArchived: isArchived === 'true' };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (caseType && caseType !== 'all') {
      query.caseType = caseType;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Base query
    let clientQuery = LawyerClient.find(query)
      .populate('clientId', 'firstName lastName email phone profileImage createdAt')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    let clients = await clientQuery.lean();

    // Apply search filter if provided (done after populate for better performance on names)
    if (search) {
      const searchLower = search.toLowerCase();
      clients = clients.filter(client => {
        const fullName = `${client.clientId.firstName} ${client.clientId.lastName}`.toLowerCase();
        const email = client.clientId.email.toLowerCase();
        const caseTitle = (client.caseTitle || '').toLowerCase();
        
        return fullName.includes(searchLower) || 
               email.includes(searchLower) || 
               caseTitle.includes(searchLower);
      });
    }

    // Get total count for pagination
    const total = await LawyerClient.countDocuments(query);

    // Get additional stats for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        // Get appointment count
        const appointmentCount = await Booking.countDocuments({
          lawyerId,
          userId: client.clientId._id
        });

        // Get last appointment
        const lastAppointment = await Booking.findOne({
          lawyerId,
          userId: client.clientId._id
        })
        .sort({ date: -1, start: -1 })
        .select('date start status appointmentType')
        .lean();

        // Get next appointment
        const nextAppointment = await Booking.findOne({
          lawyerId,
          userId: client.clientId._id,
          date: { $gte: new Date().toISOString().split('T')[0] },
          status: { $in: ['pending', 'confirmed'] }
        })
        .sort({ date: 1, start: 1 })
        .select('date start status appointmentType')
        .lean();

        return {
          ...client,
          stats: {
            totalAppointments: appointmentCount,
            lastAppointment,
            nextAppointment
          }
        };
      })
    );

    // Get overall statistics
    const stats = await LawyerClient.getClientStats(lawyerId);

    res.json({
      success: true,
      data: {
        clients: clientsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNext: skip + clients.length < total,
          hasPrev: parseInt(page) > 1
        },
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching lawyer clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clients'
    });
  }
};

// @desc    Add a new client manually
// @route   POST /api/clients/lawyer/add
// @access  Private (Lawyer)
const addClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const lawyerId = req.user.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      caseType = 'other',
      caseTitle,
      caseDescription,
      notes,
      preferredContact = 'email',
      hourlyRate,
      priority = 'medium'
    } = req.body;

    // Check if user already exists
    let client = await User.findOne({ email });
    
    if (!client) {
      // Create new user as client
      client = await User.create({
        firstName,
        lastName,
        email,
        phone,
        role: 'user',
        password: 'temppassword123', // They can reset this later
        agree: true,
        isVerified: false // They'll need to verify their email
      });
    }

    // Check if lawyer-client relationship already exists
    const existingRelation = await LawyerClient.findOne({
      lawyerId,
      clientId: client._id
    });

    if (existingRelation) {
      return res.status(400).json({
        success: false,
        message: 'Client relationship already exists'
      });
    }

    // Create lawyer-client relationship
    const clientRelation = await LawyerClient.create({
      lawyerId,
      clientId: client._id,
      addedBy: 'manual',
      status: 'active',
      caseType,
      caseTitle,
      caseDescription,
      notes,
      preferredContact,
      hourlyRate,
      priority,
      caseStartDate: new Date(),
      lastContactDate: new Date()
    });

    // Populate and return the created relationship
    const populatedRelation = await LawyerClient.findById(clientRelation._id)
      .populate('clientId', 'firstName lastName email phone profileImage')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Client added successfully',
      data: populatedRelation
    });

  } catch (error) {
    console.error('Error adding client:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add client'
    });
  }
};

// @desc    Get client details
// @route   GET /api/clients/:id
// @access  Private (Lawyer)
const getClientDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyerId = req.user.id;

    const client = await LawyerClient.findOne({
      _id: id,
      lawyerId
    })
    .populate('clientId', 'firstName lastName email phone profileImage createdAt')
    .lean();

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Get detailed appointment history
    const appointments = await Booking.find({
      lawyerId,
      userId: client.clientId._id
    })
    .sort({ date: -1, start: -1 })
    .limit(10)
    .lean();

    // Get appointment statistics
    const appointmentStats = await Booking.aggregate([
      {
        $match: {
          lawyerId: new mongoose.Types.ObjectId(lawyerId),
          userId: new mongoose.Types.ObjectId(client.clientId._id)
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDuration: { $sum: '$durationMins' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        client,
        appointments,
        appointmentStats
      }
    });

  } catch (error) {
    console.error('Error fetching client details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client details'
    });
  }
};

// @desc    Update client information
// @route   PUT /api/clients/:id
// @access  Private (Lawyer)
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyerId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.lawyerId;
    delete updateData.clientId;
    delete updateData.addedBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const client = await LawyerClient.findOneAndUpdate(
      { _id: id, lawyerId },
      { ...updateData, lastContactDate: new Date() },
      { new: true, runValidators: true }
    ).populate('clientId', 'firstName lastName email phone profileImage');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });

  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client'
    });
  }
};

// @desc    Mark client as completed
// @route   PUT /api/clients/:id/complete
// @access  Private (Lawyer)
const markClientComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const lawyerId = req.user.id;

    const client = await LawyerClient.findOne({ _id: id, lawyerId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.markComplete(notes);

    const updatedClient = await LawyerClient.findById(id)
      .populate('clientId', 'firstName lastName email phone profileImage')
      .lean();

    res.json({
      success: true,
      message: 'Client marked as completed',
      data: updatedClient
    });

  } catch (error) {
    console.error('Error marking client complete:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark client as completed'
    });
  }
};

// @desc    Delete/Remove client relationship
// @route   DELETE /api/clients/:id
// @access  Private (Lawyer)
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyerId = req.user.id;

    const client = await LawyerClient.findOneAndDelete({ _id: id, lawyerId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client relationship removed successfully'
    });

  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove client'
    });
  }
};

// @desc    Archive client
// @route   PUT /api/clients/:id/archive
// @access  Private (Lawyer)
const archiveClient = async (req, res) => {
  try {
    const { id } = req.params;
    const lawyerId = req.user.id;

    const client = await LawyerClient.findOne({ _id: id, lawyerId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.archive();

    res.json({
      success: true,
      message: 'Client archived successfully'
    });

  } catch (error) {
    console.error('Error archiving client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive client'
    });
  }
};

// @desc    Add note to client
// @route   POST /api/clients/:id/notes
// @access  Private (Lawyer)
const addClientNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const lawyerId = req.user.id;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const client = await LawyerClient.findOne({ _id: id, lawyerId });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await client.addNote(note.trim());

    const updatedClient = await LawyerClient.findById(id)
      .populate('clientId', 'firstName lastName email phone profileImage')
      .lean();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: updatedClient
    });

  } catch (error) {
    console.error('Error adding client note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note'
    });
  }
};

// @desc    Get client dashboard stats
// @route   GET /api/clients/lawyer/stats
// @access  Private (Lawyer)
const getClientStats = async (req, res) => {
  try {
    const lawyerId = req.user.id;

    const stats = await LawyerClient.getClientStats(lawyerId);
    
    // Get additional metrics
    const recentClients = await LawyerClient.find({
      lawyerId,
      isArchived: false
    })
    .populate('clientId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    const followUpClients = await LawyerClient.find({
      lawyerId,
      isArchived: false,
      nextFollowUpDate: { $lte: new Date() },
      requiresFollowUp: true
    })
    .populate('clientId', 'firstName lastName')
    .limit(10)
    .lean();

    res.json({
      success: true,
      data: {
        stats,
        recentClients,
        followUpClients
      }
    });

  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client statistics'
    });
  }
};

module.exports = {
  getLawyerClients,
  addClient,
  getClientDetails,
  updateClient,
  markClientComplete,
  deleteClient,
  archiveClient,
  addClientNote,
  getClientStats
};