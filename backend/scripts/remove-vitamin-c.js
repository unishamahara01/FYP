/**
 * Remove Vitamin C 1000mg completely from the database
 * This will delete:
 * - The product itself
 * - All purchase orders for this product
 * - All order items containing this product
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const PurchaseOrder = require('../models/PurchaseOrder');
const Order = require('../models/Order');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy';

async function removeVitaminC() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Vitamin C 1000mg product
    console.log('🔍 Searching for Vitamin C 1000mg...');
    const vitaminC = await Product.findOne({ 
      name: { $regex: /vitamin.*c.*1000/i } 
    });

    if (!vitaminC) {
      console.log('❌ Vitamin C 1000mg not found in database');
      process.exit(0);
    }

    console.log(`✅ Found: ${vitaminC.name} (ID: ${vitaminC._id})`);
    console.log(`   Batch: ${vitaminC.batchNumber}`);
    console.log(`   Quantity: ${vitaminC.quantity}`);
    console.log(`   Category: ${vitaminC.category}\n`);

    const productId = vitaminC._id;

    // 1. Delete all purchase orders for this product
    console.log('🗑️  Deleting purchase orders...');
    const poResult = await PurchaseOrder.deleteMany({ product: productId });
    console.log(`   ✅ Deleted ${poResult.deletedCount} purchase orders\n`);

    // 2. Remove this product from all orders (remove items array entries)
    console.log('🗑️  Removing from order items...');
    const orders = await Order.find({ 'items.product': productId });
    console.log(`   Found ${orders.length} orders containing this product`);
    
    let updatedOrders = 0;
    for (const order of orders) {
      // Remove the item from the order
      order.items = order.items.filter(item => item.product.toString() !== productId.toString());
      
      // Recalculate total
      order.totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // If order has no items left, delete it
      if (order.items.length === 0) {
        await Order.deleteOne({ _id: order._id });
        console.log(`   🗑️  Deleted empty order: ${order._id}`);
      } else {
        await order.save();
        updatedOrders++;
      }
    }
    console.log(`   ✅ Updated ${updatedOrders} orders\n`);

    // 3. Delete the product itself
    console.log('🗑️  Deleting product...');
    await Product.deleteOne({ _id: productId });
    console.log(`   ✅ Deleted product: ${vitaminC.name}\n`);

    // Verify deletion
    console.log('✅ VERIFICATION:');
    const productCheck = await Product.findById(productId);
    const poCheck = await PurchaseOrder.find({ product: productId });
    const orderCheck = await Order.find({ 'items.product': productId });

    console.log(`   Product exists: ${productCheck ? '❌ YES (ERROR!)' : '✅ NO'}`);
    console.log(`   Purchase orders: ${poCheck.length === 0 ? '✅ NONE' : `❌ ${poCheck.length} FOUND`}`);
    console.log(`   Order items: ${orderCheck.length === 0 ? '✅ NONE' : `❌ ${orderCheck.length} FOUND`}`);

    console.log('\n🎉 Vitamin C 1000mg has been completely removed from the database!');
    console.log('   Please restart both servers for changes to take effect.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

removeVitaminC();
