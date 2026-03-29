const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    
    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@meditrust.com' });
    if (existing) {
      console.log('✅ Admin user already exists');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role: ${existing.role}\n`);
      process.exit(0);
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = new User({
      fullName: 'Admin User',
      email: 'admin@meditrust.com',
      password: hashedPassword,
      role: 'Admin',
      permissions: ['view_all', 'edit_all', 'delete_all', 'manage_users', 'view_reports', 'manage_inventory'],
      status: 'Active',
      authProvider: 'local'
    });
    
    await admin.save();
    
    console.log('✅ Admin user created successfully!\n');
    console.log('   Email: admin@meditrust.com');
    console.log('   Password: password123');
    console.log('   Role: Admin\n');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
