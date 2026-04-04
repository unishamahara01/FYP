const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    PRODUCT STOCK THRESHOLDS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    try {
      const products = await Product.find().sort({ name: 1 });
      
      console.log(`Total Products: ${products.length}\n`);
      
      console.log('Product Name                    | Current Stock | Reorder Level | Status');
      console.log('--------------------------------|---------------|---------------|-------------');
      
      products.forEach(product => {
        const stock = product.quantity || 0;
        const threshold = product.reorderLevel || product.reorderThreshold || 50;
        
        let status;
        if (stock === 0) {
          status = '🔴 OUT OF STOCK';
        } else if (stock <= threshold) {
          status = '🟡 LOW STOCK';
        } else {
          status = '🟢 IN STOCK';
        }
        
        const name = product.name.padEnd(30);
        const stockStr = stock.toString().padEnd(13);
        const thresholdStr = threshold.toString().padEnd(13);
        
        console.log(`${name} | ${stockStr} | ${thresholdStr} | ${status}`);
      });
      
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('                    THRESHOLD EXPLANATION');
      console.log('═══════════════════════════════════════════════════════════════\n');
      
      console.log('HOW IT WORKS:');
      console.log('-------------');
      console.log('1. Each product has a "Reorder Level" (threshold)');
      console.log('2. When current stock ≤ reorder level → LOW STOCK alert');
      console.log('3. When current stock = 0 → OUT OF STOCK alert');
      console.log('4. When current stock > reorder level → IN STOCK (normal)\n');
      
      console.log('STOCK STATUS RULES:');
      console.log('-------------------');
      console.log('🔴 OUT OF STOCK:  quantity = 0');
      console.log('🟡 LOW STOCK:     quantity ≤ reorder level (but > 0)');
      console.log('🟢 IN STOCK:      quantity > reorder level\n');
      
      console.log('EXAMPLE:');
      console.log('--------');
      console.log('Product: Paracetamol 500mg');
      console.log('Reorder Level: 200 units');
      console.log('');
      console.log('If stock = 250 → 🟢 IN STOCK (250 > 200)');
      console.log('If stock = 150 → 🟡 LOW STOCK (150 ≤ 200)');
      console.log('If stock = 0   → 🔴 OUT OF STOCK\n');
      
      // Count by status
      const outOfStock = products.filter(p => p.quantity === 0).length;
      const lowStock = products.filter(p => {
        const threshold = p.reorderLevel || p.reorderThreshold || 50;
        return p.quantity > 0 && p.quantity <= threshold;
      }).length;
      const inStock = products.filter(p => {
        const threshold = p.reorderLevel || p.reorderThreshold || 50;
        return p.quantity > threshold;
      }).length;
      
      console.log('CURRENT SUMMARY:');
      console.log('----------------');
      console.log(`🔴 Out of Stock: ${outOfStock} products`);
      console.log(`🟡 Low Stock:    ${lowStock} products`);
      console.log(`🟢 In Stock:     ${inStock} products`);
      console.log('');
      
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
