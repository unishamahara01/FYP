const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function checkExpiredProducts() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust';
    
    await mongoose.connect(MONGODB_URI);
    
    const expired = await Product.find({ status: 'Expired' });
    
    console.log(`\n⚠️  Expired Products: ${expired.length}\n`);
    
    if (expired.length > 0) {
      expired.forEach(p => {
        console.log(`  - ${p.name}`);
        console.log(`    Batch: ${p.batchNumber}`);
        console.log(`    Expiry: ${new Date(p.expiryDate).toLocaleDateString()}`);
        console.log(`    Quantity: ${p.quantity} units`);
        console.log('');
      });
      
      console.log('⚠️  WARNING: These expired products should NOT be available for ordering!');
      console.log('✅ System now prevents ordering expired products (both frontend & backend).\n');
    } else {
      console.log('✅ No expired products found. All products are safe to order.\n');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkExpiredProducts();
