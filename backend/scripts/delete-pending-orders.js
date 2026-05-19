require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

async function deletePendingOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB');

    // Find all pending orders
    const pendingOrders = await Order.find({ status: 'Pending' });
    console.log(`\n📋 Found ${pendingOrders.length} pending orders:`);
    
    pendingOrders.forEach(order => {
      console.log(`   - ${order.orderNumber} | ${order.customerName} | Rs${order.totalAmount}`);
    });

    // Delete all pending orders
    const result = await Order.deleteMany({ status: 'Pending' });
    console.log(`\n🗑️  Deleted ${result.deletedCount} pending orders`);
    
    console.log('✅ Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deletePendingOrders();
