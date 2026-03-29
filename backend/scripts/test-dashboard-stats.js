const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════');
    console.log('   TESTING DASHBOARD STATS QUERY');
    console.log('═══════════════════════════════════════\n');
    
    // Test the exact query used in dashboard controller
    const lowStockItems = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    
    console.log(`📊 Low Stock Count (from query): ${lowStockItems}\n`);
    
    // Get all products to verify manually
    const allProducts = await Product.find().select('name quantity reorderLevel').lean();
    
    console.log('📦 All Products:');
    console.log('─────────────────────────────────────────\n');
    
    let manualCount = 0;
    allProducts.forEach((product, index) => {
      const isLowStock = product.quantity <= product.reorderLevel;
      if (isLowStock) manualCount++;
      
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Quantity: ${product.quantity}`);
      console.log(`   Reorder Level: ${product.reorderLevel}`);
      console.log(`   Is Low Stock: ${isLowStock ? 'YES ⚠️' : 'NO ✅'}`);
      console.log('');
    });
    
    console.log('═══════════════════════════════════════');
    console.log(`Query Result: ${lowStockItems}`);
    console.log(`Manual Count: ${manualCount}`);
    console.log('═══════════════════════════════════════\n');
    
    if (lowStockItems !== manualCount) {
      console.log('❌ MISMATCH! Query is not working correctly.');
    } else {
      console.log('✅ Query is working correctly!');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
