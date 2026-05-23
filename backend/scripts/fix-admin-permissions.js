const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' });

async function fixAdminPermissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB');
    
    // Update admin user permissions
    const result = await User.updateOne(
      { email: 'admin@meditrust.com' },
      { 
        $set: { 
          permissions: ['view_all', 'edit_all', 'delete_all', 'manage_users', 'view_reports', 'manage_inventory']
        } 
      }
    );
    
    console.log('✅ Admin permissions updated:', result.modifiedCount, 'user(s)');
    
    // Verify
    const admin = await User.findOne({ email: 'admin@meditrust.com' });
    console.log('Admin permissions:', admin.permissions);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAdminPermissions();
