const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════');
    console.log('     TESTING LOW STOCK DETECTION');
    console.log('═══════════════════════════════════════\n');
    
    // Get all products
    const allProducts = await Product.find().select('name quantity reorderLevel status').lean();
    
    console.log(`📦 Total Products: ${allProducts.length}\n`);
    
    if (allProducts.length === 0) {
      console.log('No products in database.');
      process.exit(0);
    }
    
    // Show all products with their stock status
    console.log('📊 All Products:');
    console.log('─────────────────────────────────────────\n');
    
    allProducts.forEach((product, index) => {
      const isLowStock = product.quantity <= product.reorderLevel;
      const isOutOfStock = product.quantity === 0;
      
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Quantity: ${product.quantity}`);
      console.log(`   Reorder Level: ${product.reorderLevel}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   Low Stock: ${isLowStock ? 'YES ⚠️' : 'NO ✅'}`);
      console.log(`   Out of Stock: ${isOutOfStock ? 'YES ❌' : 'NO ✅'}`);
      console.log('');
    });
    
    // Get low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).lean();
    
    const outOfStock = lowStockProducts.filter(p => p.quantity === 0);
    const lowStock = lowStockProducts.filter(p => p.quantity > 0);
    
    console.log('═══════════════════════════════════════');
    console.log('📊 LOW STOCK SUMMARY:');
    console.log('═══════════════════════════════════════\n');
    
    console.log(`Total Low Stock Items: ${lowStockProducts.length}`);
    console.log(`   Out of Stock: ${outOfStock.length}`);
    console.log(`   Low Stock: ${lowStock.length}`);
    console.log('');
    
    if (outOfStock.length > 0) {
      console.log('❌ OUT OF STOCK:');
      outOfStock.forEach(p => {
        console.log(`   - ${p.name} (Batch: ${p.batchNumber})`);
      });
      console.log('');
    }
    
    if (lowStock.length > 0) {
      console.log('⚠️  LOW STOCK:');
      lowStock.forEach(p => {
        console.log(`   - ${p.name}: ${p.quantity} units (Reorder at: ${p.reorderLevel})`);
      });
      console.log('');
    }
    
    if (lowStockProducts.length === 0) {
      console.log('✅ All items are well stocked!');
      console.log('');
    }
    
    console.log('═══════════════════════════════════════');
    console.log('API Response Format:');
    console.log('═══════════════════════════════════════\n');
    
    const apiResponse = {
      success: true,
      count: lowStockProducts.length,
      outOfStock: outOfStock.map(p => ({
        name: p.name,
        batchNumber: p.batchNumber,
        quantity: p.quantity
      })),
      lowStock: lowStock.map(p => ({
        name: p.name,
        batchNumber: p.batchNumber,
        quantity: p.quantity,
        reorderLevel: p.reorderLevel
      }))
    };
    
    console.log(JSON.stringify(apiResponse, null, 2));
    console.log('');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
