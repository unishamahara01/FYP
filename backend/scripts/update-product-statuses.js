const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════');
    console.log('     UPDATING PRODUCT STATUSES');
    console.log('═══════════════════════════════════════\n');
    
    const products = await Product.find();
    
    console.log(`📦 Found ${products.length} products\n`);
    
    if (products.length === 0) {
      console.log('No products to update.');
      process.exit(0);
    }
    
    let updated = 0;
    const today = new Date();
    
    for (const product of products) {
      const oldStatus = product.status;
      const daysUntilExpiry = Math.floor((product.expiryDate - today) / (1000 * 60 * 60 * 24));
      
      // Calculate new status
      let newStatus;
      if (daysUntilExpiry < 0) {
        newStatus = 'Expired';
      } else if (product.quantity === 0) {
        newStatus = 'Out of Stock';
      } else if (product.quantity <= product.reorderLevel) {
        newStatus = 'Low Stock';
      } else if (daysUntilExpiry <= 90) {
        newStatus = 'Expiring Soon';
      } else {
        newStatus = 'In Stock';
      }
      
      if (oldStatus !== newStatus) {
        product.status = newStatus;
        await product.save();
        updated++;
        
        console.log(`✅ ${product.name}`);
        console.log(`   ${oldStatus} → ${newStatus}`);
        console.log(`   Expiry: ${product.expiryDate.toLocaleDateString()} (${daysUntilExpiry} days)`);
        console.log(`   Quantity: ${product.quantity}`);
        console.log('');
      }
    }
    
    console.log('═══════════════════════════════════════');
    console.log(`✅ Updated ${updated} product statuses`);
    console.log('═══════════════════════════════════════\n');
    
    // Show summary
    const statusCounts = await Product.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('📊 Current Status Distribution:');
    statusCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });
    console.log('');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
