const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('Adding recent orders for last 30 days...\n');
    
    try {
      // Get existing data
      const products = await Product.find();
      const customers = await Customer.find();
      
      if (products.length === 0 || customers.length === 0) {
        console.log('❌ No products or customers found. Run reseed-all-data.js first.');
        process.exit(1);
      }
      
      const paymentMethods = ['Cash', 'Card', 'QR Payment'];
      const today = new Date();
      let orderNumber = 2000; // Start from 2000 to avoid conflicts
      let totalOrders = 0;
      let totalRevenue = 0;
      
      // Create 3-8 orders per day for last 30 days
      for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
        const orderDate = new Date(today);
        orderDate.setDate(orderDate.getDate() - daysAgo);
        
        // More orders on recent days, fewer on older days
        const ordersToday = Math.floor(Math.random() * 6) + 3; // 3-8 orders per day
        
        for (let i = 0; i < ordersToday; i++) {
          const orderTime = new Date(orderDate);
          orderTime.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM
          orderTime.setMinutes(Math.floor(Math.random() * 60));
          
          // Select random customer
          const customer = customers[Math.floor(Math.random() * customers.length)];
          
          // Select 1-4 random products
          const numItems = Math.floor(Math.random() * 3) + 1;
          const orderItems = [];
          let orderTotal = 0;
          
          for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 units
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
          
          // Create order
          const order = await Order.create({
            orderNumber: `ORD-${orderNumber++}`,
            customerName: customer.fullName,
            customer: customer._id,
            items: orderItems,
            totalAmount: orderTotal,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            status: 'Completed',
            createdAt: orderTime,
            updatedAt: orderTime
          });
          
          // Create corresponding sale
          await Sale.create({
            order: order._id,
            amount: orderTotal,
            date: orderTime,
            month: orderTime.toLocaleString('default', { month: 'long' }),
            year: orderTime.getFullYear(),
            paymentMethod: order.paymentMethod,
            createdAt: orderTime
          });
          
          totalOrders++;
          totalRevenue += orderTotal;
        }
        
        // Show progress
        if ((29 - daysAgo) % 10 === 0) {
          console.log(`✓ Added orders for ${29 - daysAgo + 1} days...`);
        }
      }
      
      console.log('\n═══════════════════════════════════════');
      console.log('✅ RECENT ORDERS ADDED!');
      console.log('═══════════════════════════════════════\n');
      
      console.log('📊 Summary:');
      console.log(`   New Orders: ${totalOrders}`);
      console.log(`   Revenue: Rs ${totalRevenue.toLocaleString()}`);
      console.log(`   Date Range: Last 30 days`);
      console.log('');
      
      console.log('💡 Next Steps:');
      console.log('   1. Refresh your browser');
      console.log('   2. The Daily Sales Trend graph will now show data!');
      console.log('');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error adding orders:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
