const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./models/Order');
const Sale = require('./models/Sale');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

async function clearOldOrders() {
  try {
    console.log('\n🗑️  Clearing old orders and sales...\n');

    // Delete all orders and sales
    await Order.deleteMany({});
    await Sale.deleteMany({});

    console.log('✅ All orders and sales cleared!');
    console.log('\nNow you can create fresh orders through the UI.');
    console.log('All new orders will display correctly with all fields.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearOldOrders();
