const mongoose = require('mongoose');
const Product = require('./models/Product');
const PurchaseOrder = require('./models/PurchaseOrder');
const Order = require('./models/Order');
const Sale = require('./models/Sale');

async function completeCleanup() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🧹 COMPLETE CLEANUP - Removing ALL test/dummy data...\n');
    
    // 1. Remove ALL test products
    console.log('📦 Removing test products...');
    const testProducts = await Product.find({
      $or: [
        { name: /test/i },
        { name: /dummy/i },
        { name: /sample/i },
        { batchNumber: /test/i },
        { batchNumber: /TST/i },
        { batchNumber: /SAMPLE/i }
      ]
    });
    
    console.log(`   Found ${testProducts.length} test products:`);
    for (const product of testProducts) {
      console.log(`   - ${product.name} (Batch: ${product.batchNumber})`);
      
      // Delete related purchase orders
      await PurchaseOrder.deleteMany({ product: product._id });
      
      // Delete related orders
      await Order.deleteMany({ 'items.product': product._id });
      
      // Delete related sales
      await Sale.deleteMany({ product: product._id });
      
      // Delete the product
      await Product.deleteOne({ _id: product._id });
    }
    console.log(`   ✅ Removed ${testProducts.length} test products\n`);
    
    // 2. Remove test purchase orders
    console.log('📋 Removing test purchase orders...');
    const testPOs = await PurchaseOrder.find({
      $or: [
        { poNumber: /test/i },
        { productName: /test/i },
        { productName: /dummy/i }
      ]
    });
    console.log(`   Found ${testPOs.length} test purchase orders`);
    await PurchaseOrder.deleteMany({
      $or: [
        { poNumber: /test/i },
        { productName: /test/i },
        { productName: /dummy/i }
      ]
    });
    console.log(`   ✅ Removed ${testPOs.length} test purchase orders\n`);
    
    // 3. Remove test orders
    console.log('🛒 Removing test orders...');
    const testOrders = await Order.find({
      $or: [
        { orderNumber: /test/i },
        { customerName: /test/i },
        { customerName: /dummy/i }
      ]
    });
    console.log(`   Found ${testOrders.length} test orders`);
    await Order.deleteMany({
      $or: [
        { orderNumber: /test/i },
        { customerName: /test/i },
        { customerName: /dummy/i }
      ]
    });
    console.log(`   ✅ Removed ${testOrders.length} test orders\n`);
    
    // 4. Remove test sales
    console.log('💰 Removing test sales...');
    const testSales = await Sale.find({
      $or: [
        { customerName: /test/i },
        { customerName: /dummy/i }
      ]
    });
    console.log(`   Found ${testSales.length} test sales`);
    await Sale.deleteMany({
      $or: [
        { customerName: /test/i },
        { customerName: /dummy/i }
      ]
    });
    console.log(`   ✅ Removed ${testSales.length} test sales\n`);
    
    console.log('=' .repeat(60));
    console.log('\n📊 FINAL DATABASE STATE:\n');
    
    const remainingProducts = await Product.countDocuments();
    const remainingPOs = await PurchaseOrder.countDocuments();
    const remainingOrders = await Order.countDocuments();
    const remainingSales = await Sale.countDocuments();
    
    console.log(`Products: ${remainingProducts}`);
    console.log(`Purchase Orders: ${remainingPOs}`);
    console.log(`Orders: ${remainingOrders}`);
    console.log(`Sales: ${remainingSales}\n`);
    
    // List remaining products
    const products = await Product.find().select('name batchNumber quantity');
    if (products.length > 0) {
      console.log('📋 Remaining Products:');
      products.forEach(p => {
        console.log(`   - ${p.name} (Batch: ${p.batchNumber}, Stock: ${p.quantity})`);
      });
    } else {
      console.log('📋 No products remaining in database');
    }
    
    console.log('\n✅ CLEANUP COMPLETE! All test/dummy data removed.\n');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

completeCleanup();
