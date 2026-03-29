const mongoose = require('mongoose');
const User = require('./models/User');

async function updateUnishaToPharmacist() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🔄 Updating Unisha to Pharmacist role...');
    
    const user = await User.findOne({ email: 'unishamahara01@gmail.com' });
    
    if (user) {
      user.role = 'Pharmacist';
      user.permissions = ['view_inventory', 'edit_inventory', 'view_orders', 'process_orders', 'view_reports'];
      await user.save();
      
      console.log('✅ Updated user successfully:');
      console.log(`   Name: ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Permissions: ${user.permissions.join(', ')}`);
    } else {
      console.log('❌ User not found');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

updateUnishaToPharmacist();