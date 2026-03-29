/**
 * Test the reorder suggestions API to see what it returns
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const PurchaseOrder = require('../models/PurchaseOrder');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy';

async function testReorderAPI() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check products
    const totalProducts = await Product.countDocuments();
    console.log(`📦 Total Products: ${totalProducts}`);

    // Check pending POs
    const pendingPOs = await PurchaseOrder.find({ status: 'Pending' });
    console.log(`🚚 Pending Purchase Orders: ${pendingPOs.length}`);
    
    if (pendingPOs.length > 0) {
      console.log('\nPending POs:');
      for (const po of pendingPOs) {
        console.log(`   ${po.poNumber}: ${po.productName}`);
        console.log(`   Product ID: ${po.product}`);
        console.log(`   Status: ${po.status}`);
        console.log(`   Created: ${po.createdAt || po.orderDate}`);
        console.log('');
      }
    }

    // Check if there are products with low stock
    const lowStockProducts = await Product.find({ quantity: { $lt: 50 } }).limit(10);
    console.log(`\n📉 Low Stock Products (< 50 units): ${lowStockProducts.length}`);
    
    if (lowStockProducts.length > 0) {
      console.log('\nSample Low Stock Products:');
      lowStockProducts.forEach(p => {
        console.log(`   ${p.name}: ${p.quantity} units (ID: ${p._id})`);
      });
    }

    // Simulate the AI backend logic
    console.log('\n🤖 Simulating AI Backend Filter Logic:');
    const allProducts = await Product.find();
    console.log(`   Total products fetched: ${allProducts.length}`);
    
    const pendingProductIds = new Set();
    for (const po of pendingPOs) {
      const productId = po.product;
      if (productId) {
        pendingProductIds.add(productId.toString());
      }
    }
    console.log(`   Products to exclude: ${pendingProductIds.size}`);
    console.log(`   Excluded IDs: ${Array.from(pendingProductIds).join(', ') || 'NONE'}`);
    
    const filteredProducts = allProducts.filter(p => !pendingProductIds.has(p._id.toString()));
    console.log(`   Products after filter: ${filteredProducts.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

testReorderAPI();
