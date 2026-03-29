const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📚 All Collections in Database:');
    console.log('═══════════════════════════════════════\n');
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name}: ${count} documents`);
    }
    
    console.log('\n═══════════════════════════════════════\n');
    
    // Check for any products that might be "real" vs "sample"
    const Product = require('../models/Product');
    const products = await Product.find().select('name manufacturer batchNumber createdAt').lean();
    
    console.log('📦 All Products in Database:');
    console.log('═══════════════════════════════════════\n');
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Manufacturer: ${product.manufacturer}`);
      console.log(`   Batch: ${product.batchNumber}`);
      console.log(`   Created: ${product.createdAt}`);
      console.log('');
    });
    
    // Check orders
    const Order = require('../models/Order');
    const orderCount = await Order.countDocuments();
    const oldestOrder = await Order.findOne().sort({ createdAt: 1 }).select('createdAt orderNumber');
    const newestOrder = await Order.findOne().sort({ createdAt: -1 }).select('createdAt orderNumber');
    
    console.log('📋 Order Information:');
    console.log('═══════════════════════════════════════\n');
    console.log(`   Total Orders: ${orderCount}`);
    if (oldestOrder) {
      console.log(`   Oldest Order: ${oldestOrder.orderNumber} (${oldestOrder.createdAt})`);
    }
    if (newestOrder) {
      console.log(`   Newest Order: ${newestOrder.orderNumber} (${newestOrder.createdAt})`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
