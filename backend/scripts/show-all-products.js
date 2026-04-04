const mongoose = require('mongoose');
require('dotenv').config();

async function showAllProducts() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust';
    await mongoose.connect(MONGODB_URI);
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
    const products = await Product.find().select('name quantity reorderLevel category').sort('name');
    
    console.log('\n📦 ALL PRODUCTS WITH REORDER LEVELS:\n');
    console.log('='.repeat(80));
    
    products.forEach((p, index) => {
      const status = p.quantity === 0 ? '🔴 OUT OF STOCK' : 
                     p.quantity <= p.reorderLevel ? '🟡 LOW STOCK' : 
                     '🟢 IN STOCK';
      
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Current Stock: ${p.quantity} units`);
      console.log(`   Reorder Level: ${p.reorderLevel} units`);
      console.log(`   Status: ${status}`);
      console.log('   ' + '-'.repeat(70));
    });
    
    console.log('\n📊 SUMMARY:');
    const inStock = products.filter(p => p.quantity > p.reorderLevel).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.reorderLevel).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    
    console.log(`   🟢 In Stock: ${inStock} products`);
    console.log(`   🟡 Low Stock: ${lowStock} products`);
    console.log(`   🔴 Out of Stock: ${outOfStock} products`);
    console.log(`   📦 Total Products: ${products.length}`);
    console.log('='.repeat(80));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

showAllProducts();
