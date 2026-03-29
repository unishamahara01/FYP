const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');

async function removeTestPOs() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🔄 Removing test purchase orders...\n');
    
    // Find all test purchase orders (PO numbers with "TEST" in them)
    const testPOs = await PurchaseOrder.find({
      poNumber: /TEST/i
    });
    
    console.log(`📦 Found ${testPOs.length} test purchase orders:`);
    
    for (const po of testPOs) {
      console.log(`   - ${po.poNumber} (${po.productName}, Status: ${po.status})`);
      await PurchaseOrder.deleteOne({ _id: po._id });
    }
    
    console.log(`\n✅ Removed ${testPOs.length} test purchase orders`);
    
    // Show remaining purchase orders
    const remainingPOs = await PurchaseOrder.find();
    console.log(`\n📊 Remaining purchase orders: ${remainingPOs.length}`);
    
    if (remainingPOs.length > 0) {
      console.log('\n📋 Current Purchase Orders:');
      remainingPOs.forEach(po => {
        console.log(`   - ${po.poNumber} (${po.productName}, Status: ${po.status})`);
      });
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

removeTestPOs();
