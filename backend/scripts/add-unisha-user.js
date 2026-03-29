const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function addUnishaUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🔍 Adding Unisha as admin user for email notifications...');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'unishamahara01@gmail.com' });
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.fullName);
      // Update to admin role if needed
      if (existingUser.role !== 'Admin') {
        existingUser.role = 'Admin';
        existingUser.permissions = ['view_all', 'edit_all', 'delete_all', 'manage_users', 'view_reports', 'manage_inventory'];
        await existingUser.save();
        console.log('✅ Updated user to Admin role');
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const newUser = new User({
        fullName: 'Unisha Mahara',
        email: 'unishamahara01@gmail.com',
        password: hashedPassword,
        role: 'Admin',
        permissions: ['view_all', 'edit_all', 'delete_all', 'manage_users', 'view_reports', 'manage_inventory'],
        authProvider: 'local',
        status: 'Active'
      });
      
      await newUser.save();
      console.log('✅ Created new admin user: Unisha Mahara');
    }
    
    console.log('🎉 Email notifications will now work with unishamahara01@gmail.com');
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

addUnishaUser();