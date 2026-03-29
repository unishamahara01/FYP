const mongoose = require('mongoose');
const User = require('./models/User');

async function createTestPharmacist() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB');
    
    // Check if test pharmacist already exists
    const existingUser = await User.findOne({ email: 'testpharmacist@meditrust.com' });
    if (existingUser) {
      console.log('🗑️ Removing existing test pharmacist...');
      await User.deleteOne({ email: 'testpharmacist@meditrust.com' });
    }
    
    // Create test pharmacist with known password
    console.log('👨‍⚕️ Creating test pharmacist...');
    const testPharmacist = new User({
      fullName: 'Test Pharmacist',
      email: 'testpharmacist@meditrust.com',
      password: 'password123', // This will be hashed by the User model
      role: 'Pharmacist',
      permissions: ['view_inventory', 'edit_inventory', 'view_orders', 'process_orders', 'view_reports'],
      authProvider: 'local'
    });
    
    await testPharmacist.save();
    
    console.log('✅ Test pharmacist created successfully!');
    console.log('   Email: testpharmacist@meditrust.com');
    console.log('   Password: password123');
    console.log('   Role: Pharmacist');
    console.log('   Permissions:', testPharmacist.permissions.join(', '));
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestPharmacist();