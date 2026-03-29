const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testBatchLookup() {
  try {
    console.log('🔍 Testing Direct Batch Number Lookup...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB');
    
    // Test batch number lookup
    const batchNumber = 'VIT-518940';
    console.log(`🔍 Looking for batch: ${batchNumber}`);
    
    const product = await Product.findOne({ batchNumber: batchNumber });
    
    if (product) {
      console.log('✅ SUCCESS: Found product!');
      console.log('📦 Name:', product.name);
      console.log('📦 Batch:', product.batchNumber);
      console.log('📈 Stock:', product.quantity);
      console.log('💰 Price:', product.price);
    } else {
      console.log('❌ FAILED: Product not found');
      
      // Let's see what batch numbers exist
      console.log('\n🔍 Available batch numbers:');
      const allProducts = await Product.find({}, 'name batchNumber').limit(10);
      allProducts.forEach(p => {
        console.log(`  - ${p.batchNumber} → ${p.name}`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testBatchLookup();