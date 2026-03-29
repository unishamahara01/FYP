const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Sale = require('../models/Sale');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

async function seedDailySales() {
  try {
    console.log('\n🌱 Adding daily sales data for AI training...\n');

    // Get existing data
    const products = await Product.find();
    const customers = await Customer.find();
    const pharmacist = await User.findOne({ role: 'Pharmacist' });

    if (products.length === 0 || customers.length === 0) {
      console.log('❌ Please run seedAllData.js first to create products and customers');
      process.exit(1);
    }

    console.log(`Found ${products.length} products and ${customers.length} customers`);

    // Generate daily sales for the last 30 days
    const today = new Date();
    let orderCounter = await Order.countDocuments() + 1000;
    let totalOrders = 0;
    let totalSales = 0;

    console.log('📅 Generating daily sales for last 30 days...\n');

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const orderDate = new Date(today);
      orderDate.setDate(today.getDate() - dayOffset);
      orderDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

      // Generate 2-5 orders per day
      const ordersPerDay = Math.floor(Math.random() * 4) + 2;

      for (let i = 0; i < ordersPerDay; i++) {
        orderCounter++;

        // Random customer
        const customer = customers[Math.floor(Math.random() * customers.length)];

        // Random 1-3 products
        const numItems = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let orderTotal = 0;

        for (let j = 0; j < numItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 5) + 1;
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
          orderNumber: `ORD-${orderCounter}`,
          customer: customer._id,
          customerName: customer.fullName,
          items: orderItems,
          totalAmount: orderTotal,
          paymentMethod: ['Cash', 'Card', 'QR Payment'][Math.floor(Math.random() * 3)],
          status: 'Completed',
          prescriptionRequired: Math.random() > 0.7,
          processedBy: pharmacist ? pharmacist._id : null,
          createdAt: orderDate,
          completedAt: orderDate
        });

        // Create corresponding sale
        await Sale.create({
          order: order._id,
          amount: orderTotal,
          date: orderDate,
          month: orderDate.toLocaleString('default', { month: 'long' }),
          year: orderDate.getFullYear(),
          paymentMethod: order.paymentMethod,
          processedBy: pharmacist ? pharmacist._id : null
        });

        totalOrders++;
        totalSales += orderTotal;
      }

      console.log(`✓ Day ${30 - dayOffset + 1}/31: ${ordersPerDay} orders`);
    }

    console.log(`\n✅ Daily sales data added successfully!\n`);
    console.log('📊 Summary:');
    console.log(`   - New Orders: ${totalOrders}`);
    console.log(`   - New Sales: ${totalOrders}`);
    console.log(`   - Total Revenue: ₨${totalSales.toFixed(2)}`);
    console.log(`   - Days Covered: 31 days\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding daily sales:', error);
    process.exit(1);
  }
}

seedDailySales();
