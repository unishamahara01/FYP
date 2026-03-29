const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════');
    console.log('   CHECKING EMAIL RECIPIENTS');
    console.log('═══════════════════════════════════════\n');
    
    // Get all users
    const allUsers = await User.find().select('fullName email role').lean();
    
    console.log(`👥 Total Users: ${allUsers.length}\n`);
    
    if (allUsers.length === 0) {
      console.log('No users found in database.');
      process.exit(0);
    }
    
    console.log('All Users:');
    console.log('─────────────────────────────────────────\n');
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });
    
    // Get admin and pharmacist users (who will receive alerts)
    const recipients = await User.find({
      role: { $in: ['Admin', 'Pharmacist'] },
      email: { $exists: true, $ne: '' }
    }).select('fullName email role').lean();
    
    console.log('═══════════════════════════════════════');
    console.log('📧 LOW STOCK ALERT RECIPIENTS:');
    console.log('═══════════════════════════════════════\n');
    
    if (recipients.length === 0) {
      console.log('❌ No Admin or Pharmacist users found!');
      console.log('   Low stock alerts will not be sent.\n');
      console.log('💡 To fix this:');
      console.log('   1. Create an admin user');
      console.log('   2. Or update existing user role to Admin/Pharmacist\n');
    } else {
      console.log(`✅ Found ${recipients.length} recipient(s):\n`);
      
      recipients.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Will receive: ✅ YES`);
        console.log('');
      });
      
      console.log('═══════════════════════════════════════');
      console.log('✅ Email alerts will be sent to these users');
      console.log('═══════════════════════════════════════\n');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
