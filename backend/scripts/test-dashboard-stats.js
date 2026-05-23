const mongoose = require('mongoose');
const Product = require('../models/Product');

mongoose.connect('mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    console.log('📊 DASHBOARD STATS TEST');
    console.log('=====================================\n');
    
    // 1. Total SKUs
    const totalSKUs = await Product.countDocuments({});
    console.log(`1. Total SKUs: ${totalSKUs}`);
    
    // 2. Expiring Items (within 90 days)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const expiringItems = await Product.countDocuments({
      expiryDate: { $lte: ninetyDaysFromNow, $gte: new Date() }
    });
    console.log(`2. Expiring Items (90 days): ${expiringItems}`);
    
    // 3. Low Stock Items (quantity <= 50)
    const LOW_STOCK_THRESHOLD = 50;
    const lowStock = await Product.countDocuments({
      quantity: { $lte: LOW_STOCK_THRESHOLD }
    });
    console.log(`3. Low Stock Items (qty <= 50): ${lowStock}`);
    
    // Breakdown
    const outOfStock = await Product.countDocuments({ quantity: 0 });
    const lowStockOnly = await Product.countDocuments({ 
      quantity: { $gt: 0, $lte: LOW_STOCK_THRESHOLD }
    });
    console.log(`   - Out of Stock (0): ${outOfStock}`);
    console.log(`   - Low Stock (1-50): ${lowStockOnly}`);
    
    // List them
    console.log('\n📦 LOW STOCK PRODUCTS:');
    const products = await Product.find({
      quantity: { $lte: LOW_STOCK_THRESHOLD }
    }).sort({ quantity: 1 });
    
    products.forEach(p => {
      console.log(`   - ${p.name} | Qty: ${p.quantity} | Status: ${p.status}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
