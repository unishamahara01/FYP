/**
 * FORCE DELETE ALL VITAMIN C - Search by name pattern and delete everything
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy';

async function forceDeleteVitaminC() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Search for ALL products with "vitamin" in name (case insensitive)
    console.log('🔍 Searching for Vitamin products...');
    const products = await db.collection('products').find({
      name: { $regex: /vitamin/i }
    }).toArray();

    console.log(`Found ${products.length} Vitamin products:\n`);
    
    const productIds = [];
    for (const product of products) {
      console.log(`   📦 ${product.name} (ID: ${product._id})`);
      console.log(`      Batch: ${product.batchNumber}`);
      console.log(`      Quantity: ${product.quantity}`);
      productIds.push(product._id);
    }

    if (productIds.length === 0) {
      console.log('\n❌ No Vitamin products found to delete');
      process.exit(0);
    }

    console.log('\n🗑️  DELETING ALL VITAMIN PRODUCTS...');
    
    // Delete all purchase orders for these products
    const poResult = await db.collection('purchaseorders').deleteMany({
      product: { $in: productIds }
    });
    console.log(`   ✅ Deleted ${poResult.deletedCount} purchase orders`);

    // Delete all products
    const productResult = await db.collection('products').deleteMany({
      _id: { $in: productIds }
    });
    console.log(`   ✅ Deleted ${productResult.deletedCount} products`);

    // Remove from orders
    const orders = await db.collection('orders').find({
      'items.product': { $in: productIds }
    }).toArray();

    console.log(`   Found ${orders.length} orders with Vitamin products`);
    
    for (const order of orders) {
      // Remove vitamin items
      const newItems = order.items.filter(item => 
        !productIds.some(id => id.toString() === item.product.toString())
      );
      
      if (newItems.length === 0) {
        // Delete empty order
        await db.collection('orders').deleteOne({ _id: order._id });
        console.log(`   🗑️  Deleted empty order: ${order._id}`);
      } else {
        // Update order with remaining items
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        await db.collection('orders').updateOne(
          { _id: order._id },
          { $set: { items: newItems, totalAmount: newTotal } }
        );
      }
    }

    console.log('\n✅ VERIFICATION:');
    const remainingProducts = await db.collection('products').find({
      name: { $regex: /vitamin/i }
    }).count();
    const remainingPOs = await db.collection('purchaseorders').find({
      product: { $in: productIds }
    }).count();

    console.log(`   Vitamin products remaining: ${remainingProducts}`);
    console.log(`   Purchase orders remaining: ${remainingPOs}`);

    if (remainingProducts === 0 && remainingPOs === 0) {
      console.log('\n🎉 SUCCESS! All Vitamin C products and POs deleted!');
      console.log('\n📋 NEXT STEPS:');
      console.log('   1. Restart backend: cd backend && npm start');
      console.log('   2. Restart AI backend: cd ai && python app.py');
      console.log('   3. Hard refresh browser: Ctrl + Shift + R');
      console.log('   4. Check Reorder Suggestions - Vitamin C should be GONE');
    } else {
      console.log('\n⚠️  WARNING: Some items still remain!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

forceDeleteVitaminC();
