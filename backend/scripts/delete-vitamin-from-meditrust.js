const mongoose = require('mongoose');

async function deleteVitamins() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to meditrust database\n');
    
    const db = mongoose.connection.db;
    
    // Find all Vitamin products
    const vitamins = await db.collection('products').find({
      name: { $regex: /vitamin/i }
    }).toArray();
    
    console.log(`Found ${vitamins.length} Vitamin products:`);
    vitamins.forEach(v => {
      console.log(`  📦 ${v.name} (ID: ${v._id})`);
    });
    
    if (vitamins.length === 0) {
      console.log('\n❌ No Vitamin products to delete');
      process.exit(0);
    }
    
    const vitaminIds = vitamins.map(v => v._id);
    
    // Delete purchase orders
    console.log('\n🗑️  Deleting purchase orders...');
    const poResult = await db.collection('purchaseorders').deleteMany({
      product: { $in: vitaminIds }
    });
    console.log(`   ✅ Deleted ${poResult.deletedCount} purchase orders`);
    
    // Delete products
    console.log('\n🗑️  Deleting products...');
    const productResult = await db.collection('products').deleteMany({
      _id: { $in: vitaminIds }
    });
    console.log(`   ✅ Deleted ${productResult.deletedCount} products`);
    
    // Verify
    console.log('\n✅ VERIFICATION:');
    const remaining = await db.collection('products').countDocuments({
      name: { $regex: /vitamin/i }
    });
    console.log(`   Vitamin products remaining: ${remaining}`);
    
    if (remaining === 0) {
      console.log('\n🎉 SUCCESS! All Vitamin products deleted!');
      console.log('\n📋 NEXT STEPS:');
      console.log('   1. Restart AI backend: cd ai && python app.py');
      console.log('   2. Restart Node backend: cd backend && npm start');
      console.log('   3. Hard refresh browser: Ctrl + Shift + R');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

deleteVitamins();
