const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════');
    console.log('        CLEARING ALL SAMPLE DATA');
    console.log('═══════════════════════════════════════\n');
    
    // Count before deletion
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const saleCount = await Sale.countDocuments();
    const customerCount = await Customer.countDocuments();
    const supplierCount = await Supplier.countDocuments();
    const poCount = await PurchaseOrder.countDocuments();
    
    console.log('📊 Current Data:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Sales: ${saleCount}`);
    console.log(`   Customers: ${customerCount}`);
    console.log(`   Suppliers: ${supplierCount}`);
    console.log(`   Purchase Orders: ${poCount}`);
    console.log('');
    
    console.log('🗑️  Deleting all data...\n');
    
    // Delete all data
    await Product.deleteMany({});
    console.log('   ✅ Deleted all products');
    
    await Order.deleteMany({});
    console.log('   ✅ Deleted all orders');
    
    await Sale.deleteMany({});
    console.log('   ✅ Deleted all sales');
    
    await Customer.deleteMany({});
    console.log('   ✅ Deleted all customers');
    
    await Supplier.deleteMany({});
    console.log('   ✅ Deleted all suppliers');
    
    await PurchaseOrder.deleteMany({});
    console.log('   ✅ Deleted all purchase orders');
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ ALL SAMPLE DATA CLEARED!');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📝 Next Steps:');
    console.log('   1. Refresh your browser (Ctrl + F5)');
    console.log('   2. Login to the system');
    console.log('   3. Start adding your real products');
    console.log('   4. Create real orders');
    console.log('');
    console.log('💡 The system is now ready for your real data!');
    console.log('');
    
    // Verify deletion
    const finalProductCount = await Product.countDocuments();
    const finalOrderCount = await Order.countDocuments();
    const finalSaleCount = await Sale.countDocuments();
    
    console.log('📊 Verification:');
    console.log(`   Products: ${finalProductCount}`);
    console.log(`   Orders: ${finalOrderCount}`);
    console.log(`   Sales: ${finalSaleCount}`);
    console.log('');
    
    if (finalProductCount === 0 && finalOrderCount === 0 && finalSaleCount === 0) {
      console.log('✅ Database is clean and ready!');
    } else {
      console.log('⚠️  Some data might still exist');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
