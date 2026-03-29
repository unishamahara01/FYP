const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');
const Product = require('./models/Product');

async function debugPurchaseOrders() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🔍 Debugging Purchase Orders...\n');
    
    // 1. Check all purchase orders
    const pos = await PurchaseOrder.find().sort({ createdAt: -1 });
    console.log(`📦 Found ${pos.length} purchase orders:`);
    
    for (const po of pos) {
      console.log(`\n  PO: ${po.poNumber}`);
      console.log(`  Product ID: ${po.product}`);
      console.log(`  Product Name: ${po.productName}`);
      console.log(`  Suggested Qty: ${po.suggestedOrderQty}`);
      console.log(`  Status: ${po.status}`);
      
      // Check if product exists
      const product = await Product.findById(po.product);
      if (product) {
        console.log(`  ✅ Product found: ${product.name} (Current stock: ${product.quantity})`);
      } else {
        console.log(`  ❌ Product NOT found in database!`);
      }
    }
    
    // 2. Check products with 0 stock
    console.log('\n🔍 Products with 0 stock:');
    const zeroStockProducts = await Product.find({ quantity: 0 });
    
    for (const product of zeroStockProducts) {
      console.log(`  - ${product.name} (ID: ${product._id})`);
    }
    
    // 3. Test fulfillment of first pending PO
    const pendingPO = pos.find(po => po.status === 'Pending');
    if (pendingPO) {
      console.log(`\n🧪 Testing fulfillment of PO: ${pendingPO.poNumber}`);
      
      const product = await Product.findById(pendingPO.product);
      if (!product) {
        console.log('❌ ISSUE FOUND: Product referenced in PO does not exist!');
        console.log(`   PO Product ID: ${pendingPO.product}`);
        console.log(`   This is likely causing the fulfillment error.`);
      } else {
        console.log(`✅ Product exists: ${product.name}`);
        console.log(`   Current stock: ${product.quantity}`);
        console.log(`   Will add: ${pendingPO.suggestedOrderQty}`);
        console.log(`   New stock would be: ${product.quantity + pendingPO.suggestedOrderQty}`);
      }
    } else {
      console.log('\n📝 No pending purchase orders found.');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Debug error:', error);
    mongoose.disconnect();
  }
}

debugPurchaseOrders();