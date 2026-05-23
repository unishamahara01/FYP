/**
 * Reset Primary Admin Password
 * Run: node reset-admin-password.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['Admin', 'Pharmacist'], default: 'Pharmacist' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB\n');

    // Find primary admin (first created)
    const primaryAdmin = await User.findOne({ role: 'Admin' }).sort({ createdAt: 1 });
    
    if (!primaryAdmin) {
      console.log('❌ No admin user found!');
      process.exit(1);
    }

    console.log(`Found primary admin: ${primaryAdmin.email}`);
    
    // Reset password to admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    primaryAdmin.password = hashedPassword;
    await primaryAdmin.save();

    console.log('\n✅ Password reset successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${primaryAdmin.email}`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${primaryAdmin.role}`);

    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
