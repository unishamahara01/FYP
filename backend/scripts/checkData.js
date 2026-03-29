const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const customerCount = await Customer.countDocuments();
    const saleCount = await Sale.countDocuments();
    
    console.log('📊 Database Status:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Customers: ${customerCount}`);
    console.log(`   Sales: ${saleCount}\n`);
    
    if (productCount === 0) {
      console.log('❌ No products found - database needs to be seeded!');
    } else {
      console.log('✅ Data exists in database');
      
      // Show sample product
      const sampleProduct = await Product.findOne();
      if (sampleProduct) {
        console.log(`\n📦 Sample Product: ${sampleProduct.name}`);
        console.log(`   Quantity: ${sampleProduct.quantity}`);
        console.log(`   Price: Rs ${sampleProduct.price}`);
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
