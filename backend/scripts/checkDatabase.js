const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Sale = require('./models/Sale');
const Customer = require('./models/Customer');
const Supplier = require('./models/Supplier');
const PasswordReset = require('./models/PasswordReset');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(() => {
    console.log('✓ Connected to MongoDB');
    checkDatabase();
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

async function checkDatabase() {
  try {
    console.log('\n📊 Checking MediTrust Database...\n');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    console.log('\n' + '='.repeat(50) + '\n');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('📁 Collections in Database:\n');

    // Define expected collections and their models
    const expectedCollections = [
      { name: 'users', model: User, description: 'User accounts (Admin, Pharmacist, Staff)' },
      { name: 'products', model: Product, description: 'Medicine inventory' },
      { name: 'orders', model: Order, description: 'Customer orders' },
      { name: 'sales', model: Sale, description: 'Sales records' },
      { name: 'customers', model: Customer, description: 'Customer information' },
      { name: 'suppliers', model: Supplier, description: 'Supplier information' },
      { name: 'passwordresets', model: PasswordReset, description: 'Password reset tokens' }
    ];

    let allPresent = true;

    for (const expected of expectedCollections) {
      const exists = collectionNames.includes(expected.name);
      const status = exists ? '✅' : '⚠️';
      const count = exists ? await expected.model.countDocuments() : 0;
      
      console.log(`${status} ${expected.name.padEnd(20)} - ${expected.description}`);
      if (exists) {
        console.log(`   Documents: ${count}`);
      } else {
        console.log(`   Status: Will be created automatically when first document is added`);
        allPresent = false;
      }
      console.log('');
    }

    console.log('='.repeat(50) + '\n');

    if (allPresent) {
      console.log('✅ All collections are present!\n');
    } else {
      console.log('⚠️  Some collections are missing (this is normal for a new database)');
      console.log('   MongoDB will create them automatically when you add data.\n');
    }

    // Check indexes
    console.log('🔍 Checking Indexes...\n');
    
    for (const expected of expectedCollections) {
      if (collectionNames.includes(expected.name)) {
        const indexes = await expected.model.collection.getIndexes();
        console.log(`${expected.name}:`);
        Object.keys(indexes).forEach(indexName => {
          console.log(`  - ${indexName}`);
        });
        console.log('');
      }
    }

    console.log('='.repeat(50) + '\n');
    console.log('✅ Database check complete!\n');
    console.log('Summary:');
    console.log(`  - Database: ${mongoose.connection.name}`);
    console.log(`  - Collections: ${collectionNames.length}`);
    console.log(`  - Status: Ready for use\n`);

    // Show data counts
    console.log('📈 Current Data:\n');
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const saleCount = await Sale.countDocuments();
    const customerCount = await Customer.countDocuments();
    const supplierCount = await Supplier.countDocuments();

    console.log(`  Users: ${userCount}`);
    console.log(`  Products: ${productCount}`);
    console.log(`  Orders: ${orderCount}`);
    console.log(`  Sales: ${saleCount}`);
    console.log(`  Customers: ${customerCount}`);
    console.log(`  Suppliers: ${supplierCount}\n`);

    if (productCount === 0) {
      console.log('💡 Tip: Add products in the Inventory section to get started!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}
