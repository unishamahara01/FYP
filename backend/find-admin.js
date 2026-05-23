/**
 * Find all Admin users
 * Run: node find-admin.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['Admin', 'Pharmacist'], default: 'Pharmacist' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function findAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB\n');

    const admins = await User.find({ role: 'Admin' }).sort({ createdAt: 1 });
    
    console.log(`Found ${admins.length} Admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.fullName || 'No Name'}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.createdAt}`);
      console.log(`   ID: ${admin._id}`);
      console.log('');
    });

    if (admins.length > 0) {
      console.log('ℹ️  The PRIMARY admin (first created) is:');
      console.log(`   Email: ${admins[0].email}`);
      console.log('\n💡 Use this email for API testing!');
    }

    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findAdmins();
