const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');
const Product = require('./models/Product');

async function manualFulfillPO() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🔄 Manual Purchase Order Fulfillment...\n');
    
    // Get all pending purchase orders
    const pendingPOs = await PurchaseOrder.find({ status: 'Pending' });
    
    if (pendingPOs.length === 0) {
      console.log('📝 No pending purchase orders found.');
      mongoose.disconnect();
      return;
    }
    
    console.log(`📦 Found ${pendingPOs.length} pending purchase orders:`);
    
    for (const po of pendingPOs) {
      console.log(`\n🔄 Processing PO: ${po.poNumber}`);
      console.log(`   Product: ${po.productName}`);
      console.log(`   Quantity to add: ${po.suggestedOrderQty}`);
      
      // Find the product
      const product = await Product.findById(po.product);
      if (!product) {
        console.log(`   ❌ Product not found: ${po.product}`);
        continue;
      }
      
      // Update product quantity
      const oldQuantity = parseInt(product.quantity) || 0;
      const addQuantity = parseInt(po.suggestedOrderQty) || 0;
      const newQuantity = oldQuantity + addQuantity;
      
      product.quantity = newQuantity;
      await product.save();
      
      // Update PO status
      po.status = 'Received';
      po.receivedAt = new Date();
      await po.save();
      
      console.log(`   ✅ SUCCESS: Stock updated from ${oldQuantity} to ${newQuantity}`);
      console.log(`   ✅ PO marked as received`);
    }
    
    console.log('\n🎉 All pending purchase orders have been fulfilled!');
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.disconnect();
  }
}

// Check if script is run directly
if (require.main === module) {
  manualFulfillPO();
}

module.exports = manualFulfillPO;