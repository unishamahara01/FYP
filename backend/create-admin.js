/**
 * Create Admin User for Testing
 * Run: node create-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['Admin', 'Pharmacist'], default: 'Pharmacist' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@meditrust.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('   Email: admin@meditrust.com');
      console.log('   Role:', existingAdmin.role);
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash('admin123', 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'Admin';
      await existingAdmin.save();
      console.log('✅ Admin password updated to: admin123');
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = new User({
        fullName: 'Admin User',
        email: 'admin@meditrust.com',
        password: hashedPassword,
        role: 'Admin'
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('   Email: admin@meditrust.com');
      console.log('   Password: admin123');
      console.log('   Role: Admin');
    }

    await mongoose.connection.close();
    console.log('\n✅ Done! You can now login with:');
    console.log('   Email: admin@meditrust.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
