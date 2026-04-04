const mongoose = require('mongoose');
require('dotenv').config();

async function checkAllVitamins() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust';
    await mongoose.connect(MONGODB_URI);
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
    const vitamins = await Product.find({ category: /vitamin/i }).sort('name');
    
    console.log('\n📦 ALL VITAMIN PRODUCTS - THRESHOLD CHECK:\n');
    console.log('='.repeat(100));
    
    vitamins.forEach((v, index) => {
      const isLowStock = v.quantity <= v.reorderLevel;
      const status = v.quantity === 0 ? '🔴 OUT OF STOCK' : 
                     isLowStock ? '🟡 LOW STOCK' : 
                     '🟢 IN STOCK';
      
      const mathCheck = v.quantity <= v.reorderLevel ? '✅ SHOULD BE LOW' : '❌ SHOULD BE IN STOCK';
      
      console.log(`${index + 1}. ${v.name}`);
      console.log(`   Quantity: ${v.quantity} units`);
      console.log(`   Reorder Level: ${v.reorderLevel} units`);
      console.log(`   Math: ${v.quantity} <= ${v.reorderLevel}? ${isLowStock}`);
      console.log(`   Expected: ${mathCheck}`);
      console.log(`   Actual Status: ${status}`);
      console.log(`   ${isLowStock ? '✅ CORRECT' : '⚠️ CHECK THIS'}`);
      console.log('   ' + '-'.repeat(90));
    });
    
    console.log('='.repeat(100));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAllVitamins();
