const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check Orders
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const orderCount = await Order.countDocuments();
    console.log('\n📦 ORDERS:');
    console.log(`   Total: ${orderCount}`);
    
    const recentOrders = await Order.find()
      .sort({createdAt: -1})
      .limit(5)
      .select('orderNumber customerName createdAt totalAmount');
    
    console.log('\n   Last 5 orders:');
    recentOrders.forEach(o => {
      const date = new Date(o.createdAt).toLocaleDateString();
      console.log(`   - ${o.orderNumber} | ${o.customerName} | Rs ${o.totalAmount} | ${date}`);
    });
    
    // Check Customers
    const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));
    const customerCount = await Customer.countDocuments();
    console.log('\n👥 CUSTOMERS:');
    console.log(`   Total: ${customerCount}`);
    
    const recentCustomers = await Customer.find()
      .sort({createdAt: -1})
      .limit(5)
      .select('fullName phone loyaltyPoints createdAt');
    
    console.log('\n   Last 5 customers:');
    recentCustomers.forEach(c => {
      const date = new Date(c.createdAt).toLocaleDateString();
      console.log(`   - ${c.fullName} | ${c.phone} | ${c.loyaltyPoints} pts | ${date}`);
    });
    
    // Check Products
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const productCount = await Product.countDocuments();
    console.log('\n💊 PRODUCTS:');
    console.log(`   Total: ${productCount}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
