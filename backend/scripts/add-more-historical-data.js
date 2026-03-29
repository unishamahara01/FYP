const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════');
    console.log('   ADDING MORE HISTORICAL DATA');
    console.log('   (Keeping existing data intact)');
    console.log('═══════════════════════════════════════\n');
    
    try {
      // Get existing data
      const existingProducts = await Product.find().lean();
      const existingCustomers = await Customer.find().lean();
      const existingOrders = await Order.countDocuments();
      
      console.log('📊 Current Database Status:');
      console.log(`   Products: ${existingProducts.length}`);
      console.log(`   Customers: ${existingCustomers.length}`);
      console.log(`   Orders: ${existingOrders}`);
      console.log('');
      
      if (existingProducts.length === 0) {
        console.log('❌ No products found! Please add products first.');
        process.exit(1);
      }
      
      if (existingCustomers.length === 0) {
        console.log('❌ No customers found! Please add customers first.');
        process.exit(1);
      }
      
      // Add more historical orders (going back 12 months instead of 6)
      console.log('📋 Adding Historical Orders (Last 12 Months)...\n');
      
      const paymentMethods = ['Cash', 'Card', 'QR Payment'];
      const today = new Date();
      
      // Get the highest order number
      const lastOrder = await Order.findOne().sort({ orderNumber: -1 }).lean();
      let orderNumber = lastOrder ? parseInt(lastOrder.orderNumber.split('-')[1]) + 1 : 2000;
      
      let totalNewOrders = 0;
      let totalNewRevenue = 0;
      
      // Generate orders for last 12 months (going back further)
      for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
        const monthDate = new Date(today);
        monthDate.setMonth(monthDate.getMonth() - monthsAgo);
        
        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        
        // More orders in recent months (realistic growth pattern)
        // Older months: 20-30 orders, Recent months: 40-50 orders
        const baseOrders = 20;
        const growthFactor = Math.floor((11 - monthsAgo) * 2.5);
        const ordersThisMonth = baseOrders + Math.floor(Math.random() * 10) + growthFactor;
        
        console.log(`📅 ${monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}: Adding ${ordersThisMonth} orders`);
        
        for (let i = 0; i < ordersThisMonth; i++) {
          const orderDate = new Date(monthDate);
          orderDate.setDate(Math.floor(Math.random() * daysInMonth) + 1);
          orderDate.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM
          orderDate.setMinutes(Math.floor(Math.random() * 60));
          
          // Select random customer
          const customer = existingCustomers[Math.floor(Math.random() * existingCustomers.length)];
          
          // Select 1-5 random products
          const numItems = Math.floor(Math.random() * 4) + 1;
          const orderItems = [];
          let orderTotal = 0;
          
          const selectedProducts = [];
          for (let j = 0; j < numItems; j++) {
            const product = existingProducts[Math.floor(Math.random() * existingProducts.length)];
            
            // Avoid duplicate products in same order
            if (selectedProducts.includes(product._id.toString())) continue;
            selectedProducts.push(product._id.toString());
            
            const quantity = Math.floor(Math.random() * 8) + 1; // 1-8 units
            const subtotal = product.price * quantity;
            
            orderItems.push({
              product: product._id,
              productName: product.name,
              quantity: quantity,
              price: product.price,
              subtotal: subtotal
            });
            
            orderTotal += subtotal;
          }
          
          if (orderItems.length === 0) continue;
          
          // Create order
          const order = await Order.create({
            orderNumber: `ORD-${orderNumber++}`,
            customerName: customer.fullName,
            customer: customer._id,
            items: orderItems,
            totalAmount: orderTotal,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            status: 'Completed',
            createdAt: orderDate,
            updatedAt: orderDate
          });
          
          // Create corresponding sale
          await Sale.create({
            order: order._id,
            amount: orderTotal,
            date: orderDate,
            month: orderDate.toLocaleString('default', { month: 'long' }),
            year: orderDate.getFullYear(),
            paymentMethod: order.paymentMethod,
            createdAt: orderDate
          });
          
          totalNewOrders++;
          totalNewRevenue += orderTotal;
        }
      }
      
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('✅ HISTORICAL DATA ADDED!');
      console.log('═══════════════════════════════════════\n');
      
      // Get updated counts
      const finalProducts = await Product.countDocuments();
      const finalCustomers = await Customer.countDocuments();
      const finalOrders = await Order.countDocuments();
      const finalSales = await Sale.countDocuments();
      
      const totalRevenue = await Sale.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalRev = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
      
      console.log('📊 Updated Database Status:');
      console.log(`   Products: ${finalProducts}`);
      console.log(`   Customers: ${finalCustomers}`);
      console.log(`   Orders: ${finalOrders} (+${totalNewOrders} new)`);
      console.log(`   Sales: ${finalSales}`);
      console.log(`   Total Revenue: Rs ${totalRev.toLocaleString()}`);
      console.log('');
      
      console.log('📅 Date Range:');
      const oldestSale = await Sale.findOne().sort({ date: 1 }).lean();
      const newestSale = await Sale.findOne().sort({ date: -1 }).lean();
      if (oldestSale && newestSale) {
        console.log(`   From: ${new Date(oldestSale.date).toLocaleDateString()}`);
        console.log(`   To: ${new Date(newestSale.date).toLocaleDateString()}`);
      }
      console.log('');
      
      console.log('💡 Analytics Features Ready:');
      console.log('   ✅ 12 months of historical data');
      console.log('   ✅ Real-time + historical analytics');
      console.log('   ✅ Sales trend analysis');
      console.log('   ✅ Growth patterns visible');
      console.log('   ✅ Seasonal analysis possible');
      console.log('   ✅ AI training with large dataset');
      console.log('');
      
      console.log('📈 New Orders Added:');
      console.log(`   Total: ${totalNewOrders} orders`);
      console.log(`   Revenue: Rs ${totalNewRevenue.toLocaleString()}`);
      console.log(`   Average: Rs ${Math.round(totalNewRevenue / totalNewOrders)}/order`);
      console.log('');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error adding data:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
