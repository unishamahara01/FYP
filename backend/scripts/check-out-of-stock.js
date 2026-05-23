const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function checkOutOfStock() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB\n');

    // Get all products with quantity 0
    const allZeroQuantity = await Product.find({ quantity: 0 }).sort({ name: 1 });
    
    console.log(`📊 TOTAL PRODUCTS WITH QUANTITY 0: ${allZeroQuantity.length}\n`);
    
    // Separate by status
    const expired = allZeroQuantity.filter(p => p.status === 'Expired');
    const outOfStock = allZeroQuantity.filter(p => p.status !== 'Expired');
    
    console.log(`🔴 EXPIRED (quantity 0): ${expired.length}`);
    expired.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.batchNumber}) - Status: ${p.status}`);
    });
    
    console.log(`\n📦 OUT OF STOCK (quantity 0, not expired): ${outOfStock.length}`);
    outOfStock.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.batchNumber}) - Status: ${p.status}`);
    });
    
    console.log(`\n✅ SUMMARY:`);
    console.log(`   - Dashboard should show: ${outOfStock.length} OUT OF STOCK`);
    console.log(`   - Inventory history should show: ${allZeroQuantity.length} total (when "Show Out of Stock History" is checked)`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkOutOfStock();
