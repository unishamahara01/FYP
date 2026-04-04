const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');
const Sale = require('../models/Sale');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    
    try {
      // Set cutoff to March 30, 2026 00:00:00 (anything >= this is future)
      const cutoffDate = new Date('2026-03-30T00:00:00');
      
      console.log(`Today: March 29, 2026`);
      console.log(`Removing all orders >= ${cutoffDate.toLocaleString()}\n`);
      
      // Find and list future orders
      const futureOrders = await Order.find({ createdAt: { $gte: cutoffDate } }).sort({ createdAt: 1 });
      
      if (futureOrders.length > 0) {
        console.log(`Found ${futureOrders.length} future orders:\n`);
        futureOrders.forEach(order => {
          console.log(`  - ${order.orderNumber}: ${order.createdAt.toLocaleString()} (Rs ${order.totalAmount})`);
        });
        console.log('');
        
        // Delete future sales first
        const salesResult = await Sale.deleteMany({ createdAt: { $gte: cutoffDate } });
        console.log(`✓ Deleted ${salesResult.deletedCount} future sales`);
        
        // Delete future orders
        const ordersResult = await Order.deleteMany({ createdAt: { $gte: cutoffDate } });
        console.log(`✓ Deleted ${ordersResult.deletedCount} future orders\n`);
        
        console.log('═══════════════════════════════════════');
        console.log('✅ ALL FUTURE ORDERS REMOVED!');
        console.log('═══════════════════════════════════════\n');
      } else {
        console.log('✓ No future orders found!\n');
        
        // Check the latest order date
        const latestOrder = await Order.findOne().sort({ createdAt: -1 });
        if (latestOrder) {
          console.log(`Latest order date: ${latestOrder.createdAt.toLocaleString()}`);
        }
      }
      
      console.log('💡 Refresh browser (Ctrl+Shift+R) to see updated graph\n');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
