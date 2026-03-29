const mongoose = require('mongoose');
require('dotenv').config();

const Sale = require('../models/Sale');
const Order = require('../models/Order');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    
    const today = new Date('2026-03-26');
    today.setHours(23, 59, 59, 999);
    
    console.log('📅 Today is: March 26, 2026\n');
    
    // Check for future sales
    const futureSales = await Sale.find({
      date: { $gt: today }
    }).sort({ date: 1 }).lean();
    
    console.log(`Found ${futureSales.length} sales with future dates:\n`);
    
    if (futureSales.length > 0) {
      futureSales.forEach(sale => {
        console.log(`  - ${new Date(sale.date).toLocaleDateString()} (Rs ${sale.amount})`);
      });
      
      console.log('\n❌ These dates are in the future and should be removed!\n');
      
      // Delete future sales and orders
      const futureOrderIds = futureSales.map(s => s.order);
      
      await Sale.deleteMany({ date: { $gt: today } });
      await Order.deleteMany({ createdAt: { $gt: today } });
      
      console.log('✅ Deleted all future-dated sales and orders\n');
      
      // Show updated counts
      const totalSales = await Sale.countDocuments();
      const totalOrders = await Order.countDocuments();
      
      console.log('📊 Updated Database:');
      console.log(`   Sales: ${totalSales}`);
      console.log(`   Orders: ${totalOrders}`);
      console.log('');
    } else {
      console.log('✅ No future dates found!\n');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
