const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('../models/Order');
const Sale = require('../models/Sale');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('Removing future orders (after March 29, 2026)...\n');
    
    try {
      // Set cutoff date to end of March 29, 2026
      const cutoffDate = new Date('2026-03-29T23:59:59');
      
      console.log(`Cutoff date: ${cutoffDate.toLocaleString()}`);
      console.log(`Current date: ${new Date().toLocaleString()}\n`);
      
      // Find future orders
      const futureOrders = await Order.find({ createdAt: { $gt: cutoffDate } });
      console.log(`Found ${futureOrders.length} future orders to delete\n`);
      
      if (futureOrders.length > 0) {
        // Delete future sales
        const salesResult = await Sale.deleteMany({ createdAt: { $gt: cutoffDate } });
        console.log(`✓ Deleted ${salesResult.deletedCount} future sales`);
        
        // Delete future orders
        const ordersResult = await Order.deleteMany({ createdAt: { $gt: cutoffDate } });
        console.log(`✓ Deleted ${ordersResult.deletedCount} future orders\n`);
        
        console.log('═══════════════════════════════════════');
        console.log('✅ FUTURE ORDERS REMOVED!');
        console.log('═══════════════════════════════════════\n');
        console.log('💡 Refresh your browser - graph will now end at March 29\n');
      } else {
        console.log('✓ No future orders found. All good!\n');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error removing orders:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
