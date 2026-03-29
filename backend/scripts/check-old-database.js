const mongoose = require('mongoose');

// Connect to the old database
mongoose.connect('mongodb://localhost:27017/test')
  .then(async () => {
    console.log('✓ Connected to test\n');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📚 Collections in test database:');
    console.log('═══════════════════════════════════════\n');
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name}: ${count} documents`);
    }
    
    console.log('\n═══════════════════════════════════════\n');
    
    // Check products
    const productsCount = await mongoose.connection.db.collection('products').countDocuments();
    if (productsCount > 0) {
      console.log('📦 Sample Products from test database:\n');
      const products = await mongoose.connection.db.collection('products')
        .find()
        .limit(10)
        .toArray();
      
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name || 'Unknown'}`);
        console.log(`   Quantity: ${product.quantity || 0}`);
        console.log(`   Price: Rs ${product.price || 0}`);
        console.log(`   Batch: ${product.batchNumber || 'N/A'}`);
        console.log(`   Created: ${product.createdAt || 'N/A'}`);
        console.log('');
      });
    }
    
    // Check orders
    const ordersCount = await mongoose.connection.db.collection('orders').countDocuments();
    if (ordersCount > 0) {
      console.log(`\n📋 Orders: ${ordersCount} total\n`);
      const orders = await mongoose.connection.db.collection('orders')
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
      
      console.log('Recent orders:');
      orders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber || 'N/A'} - Rs ${order.totalAmount || 0} (${order.createdAt || 'N/A'})`);
      });
    }
    
    // Check customers
    const customersCount = await mongoose.connection.db.collection('customers').countDocuments();
    if (customersCount > 0) {
      console.log(`\n\n👥 Customers: ${customersCount} total\n`);
      const customers = await mongoose.connection.db.collection('customers')
        .find()
        .limit(5)
        .toArray();
      
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.fullName || customer.name || 'Unknown'}`);
        console.log(`   Email: ${customer.email || 'N/A'}`);
        console.log(`   Phone: ${customer.phone || 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ This appears to be your previous real data!');
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
