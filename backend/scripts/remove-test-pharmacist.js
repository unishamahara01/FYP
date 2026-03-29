const mongoose = require('mongoose');
const User = require('./models/User');

async function removeTestPharmacist() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB');

    // Find and remove test pharmacist
    const result = await User.deleteOne({ 
      email: 'testpharmacist@meditrust.com' 
    });

    if (result.deletedCount > 0) {
      console.log('✅ Removed Test Pharmacist user');
    } else {
      console.log('ℹ️  Test Pharmacist user not found (may already be deleted)');
    }

    // Show remaining users
    const users = await User.find({}, 'fullName email role');
    console.log('\n📋 Remaining users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email}) - ${user.role}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removeTestPharmacist();
