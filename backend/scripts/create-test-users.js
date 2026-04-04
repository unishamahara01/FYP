const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the actual User model
const User = require('../models/User');

async function createTestUsers() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if users already exist
    const adminExists = await User.findOne({ email: 'admin@meditrust.com' });
    const pharmacistExists = await User.findOne({ email: 'pharmacist@meditrust.com' });

    // Delete existing test users to recreate them properly
    if (adminExists) {
      await User.deleteOne({ email: 'admin@meditrust.com' });
      console.log('🗑️ Deleted existing admin user');
    }
    if (pharmacistExists) {
      await User.deleteOne({ email: 'pharmacist@meditrust.com' });
      console.log('🗑️ Deleted existing pharmacist user');
    }

    // Create admin user (password will be hashed by pre-save hook)
    await User.create({
      fullName: 'Test Admin',
      email: 'admin@meditrust.com',
      password: 'admin123',
      role: 'Admin',
      status: 'Active'
    });
    console.log('✅ Created admin@meditrust.com (password: admin123)');

    // Create pharmacist user (password will be hashed by pre-save hook)
    await User.create({
      fullName: 'Test Pharmacist',
      email: 'pharmacist@meditrust.com',
      password: 'pharma123',
      role: 'Pharmacist',
      status: 'Active'
    });
    console.log('✅ Created pharmacist@meditrust.com (password: pharma123)');

    console.log('✅ Test users created successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUsers();
