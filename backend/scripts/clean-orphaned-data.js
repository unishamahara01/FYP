const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Sale = require('./models/Sale');

async function cleanOrphanedData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🧹 Cleaning orphaned sales and orders...\n');
    
    // Get all valid product IDs
    const validProducts = await Product.find().select('_id');
    const validProductIds = validProducts.map(p => p._id.toString());
    
    console.log(`📦 Found ${validProductIds.length} valid products in database\n`);
    
    // Find and remove sales with invalid product references
    console.log('💰 Checking sales...');
    const allSales = await Sale.find();
    let removedSales = 0;
    
    for (const sale of allSales) {
      if (sale.product && !validProductIds.includes(sale.product.toString())) {
        console.log(`   Removing sale for deleted product: ${sale.productName || 'Unknown'}`);
        await Sale.deleteOne({ _id: sale._id });
        removedSales++;
      }
    }
    console.log(`   ✅ Removed ${removedSales} orphaned sales\n`);
    
    // Find and remove orders with invalid product references
    console.log('🛒 Checking orders...');
    const allOrders = await Order.find();
    let removedOrders = 0;
    let cleanedOrders = 0;
    
    for (const order of allOrders) {
      let hasInvalidItems = false;
      const validItems = [];
      
      for (const item of order.items) {
        if (item.product && !validProductIds.includes(item.product.toString())) {
          hasInvalidItems = true;
          console.log(`   Found invalid item in order ${order.orderNumber}`);
        } else {
          validItems.push(item);
        }
      }
      
      if (hasInvalidItems) {
        if (validItems.length === 0) {
          // Remove entire order if all items are invalid
          await Order.deleteOne({ _id: order._id });
          removedOrders++;
        } else {
          // Keep order but remove invalid items
          order.items = validItems;
          await order.save();
          cleanedOrders++;
        }
      }
    }
    console.log(`   ✅ Removed ${removedOrders} orders with all invalid items`);
    console.log(`   ✅ Cleaned ${cleanedOrders} orders by removing invalid items\n`);
    
    console.log('=' .repeat(60));
    console.log('\n📊 FINAL COUNTS:\n');
    
    const finalSales = await Sale.countDocuments();
    const finalOrders = await Order.countDocuments();
    
    console.log(`Sales: ${finalSales}`);
    console.log(`Orders: ${finalOrders}`);
    console.log(`Products: ${validProductIds.length}\n`);
    
    console.log('✅ CLEANUP COMPLETE! All orphaned data removed.\n');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

cleanOrphanedData();
