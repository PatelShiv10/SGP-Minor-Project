const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@lawmate.com' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = new User({
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lawmate.com',
      phone: '1234567890',
      password: hashedPassword,
      agree: true,
      isVerified: true,
      status: 'approved'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@lawmate.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser(); 