const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUserRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB');
    
    // Find all users and their roles
    const users = await User.find({});
    console.log('\n👥 Current users and their roles:');
    
    if (users.length === 0) {
      console.log('   No users found');
    } else {
      users.forEach(user => {
        console.log(`   - ${user.fullName} (${user.email})`);
        console.log(`     Role: ${user.role}`);
        console.log(`     Permissions: ${user.permissions?.join(', ') || 'None'}`);
        console.log('');
      });
    }
    
    // Check role distribution
    const roleCount = {};
    users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    
    console.log('📊 Role Distribution:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserRoles();