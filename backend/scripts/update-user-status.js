const mongoose = require('mongoose');
const User = require('./models/User');

async function updateUserStatus() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB');

    // Update all users without status to Active
    const result = await User.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'Active' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to Active status`);

    // Show all users with their status
    const users = await User.find({}, 'fullName email role status');
    console.log('\n📋 All users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email}) - ${user.role} - ${user.status}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateUserStatus();
