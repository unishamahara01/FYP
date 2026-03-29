const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
const Pharmacy = require('./models/Pharmacy');
const Product = require('./models/Product');
const bcrypt = require('bcryptjs');

async function startFreshDatabase() {
  try {
    console.log('🔄 Starting Fresh Database Setup...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB');

    // Clear all existing data
    console.log('\n🗑️ Clearing existing data...');
    await Department.deleteMany({});
    await Pharmacy.deleteMany({});
    await Product.deleteMany({});
    
    // Keep only essential admin user, remove others
    await User.deleteMany({ email: { $ne: 'admin@meditrust.com' } });
    
    // Ensure we have one admin user
    const existingAdmin = await User.findOne({ email: 'admin@meditrust.com' });
    
    if (!existingAdmin) {
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const adminUser = new User({
        fullName: 'System Administrator',
        email: 'admin@meditrust.com',
        password: hashedPassword,
        role: 'Admin',
        permissions: ['view_all', 'edit_all', 'delete_all', 'manage_users', 'view_reports', 'manage_inventory'],
        authProvider: 'local',
        status: 'Active'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created: admin@meditrust.com / password123');
    } else {
      console.log('✅ Admin user already exists');
    }

    console.log('\n🎉 Fresh Database Ready!');
    console.log('\n📊 Current Status:');
    console.log('   • Users: 1 (admin only)');
    console.log('   • Departments: 0 (empty - ready for admin to create)');
    console.log('   • Pharmacies: 0 (empty - ready for admin to create)');
    console.log('   • Products: 0 (empty - ready for admin to create)');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Login as admin@meditrust.com / password123');
    console.log('2. Go to Admin Dashboard');
    console.log('3. Create departments using "Add Department" button');
    console.log('4. Create pharmacies using "Add Pharmacy" button');
    console.log('5. All data will be saved to MongoDB through the website!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

startFreshDatabase();