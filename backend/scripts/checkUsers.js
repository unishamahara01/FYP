const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    
    const users = await User.find().select('fullName email role status');
    
    console.log(`📊 Found ${users.length} users:\n`);
    
    users.forEach(user => {
      console.log(`   ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status || 'Active'}`);
      console.log('');
    });
    
    // Check for admin user
    const admin = await User.findOne({ email: 'admin@meditrust.com' });
    if (admin) {
      console.log('✅ Admin user exists');
    } else {
      console.log('❌ Admin user NOT found - need to create one!');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
