/**
 * Set Password for Unisha Admin
 * Run: node set-password.js
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

async function setPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB\n');

    // Find Unisha's account
    const user = await User.findOne({ email: 'unisha@meditrust.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log(`Found user: ${user.email}`);
    
    // Set password to unisha123
    const hashedPassword = await bcrypt.hash('unisha123', 10);
    user.password = hashedPassword;
    await user.save();

    console.log('\n✅ Password updated successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: unisha123`);
    console.log(`   Role: ${user.role}`);

    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setPassword();
