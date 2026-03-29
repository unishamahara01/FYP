const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🔍 Checking all users in database...');
    
    const users = await User.find({}, 'fullName email role status');
    console.log('Total users:', users.length);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email}) - Role: ${user.role} - Status: ${user.status || 'Active'}`);
    });
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.disconnect();
  }
}

checkUsers();