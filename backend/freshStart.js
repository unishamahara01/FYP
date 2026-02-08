const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Order = require('./models/Order');
const Sale = require('./models/Sale');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

async function freshStart() {
  try {
    console.log('\n🔄 Starting fresh...\n');

    // Clear all data
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Sale.deleteMany({});

    console.log('✅ All products, orders, and sales cleared!');
    console.log('\nNow you can:');
    console.log('1. Go to Inventory → Add products');
    console.log('2. Go to Orders → Create orders');
    console.log('3. Dashboard will show YOUR data only!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

freshStart();
