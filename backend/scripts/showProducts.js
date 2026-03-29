const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(() => {
    console.log('✓ Connected to MongoDB');
    showProducts();
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

async function showProducts() {
  try {
    console.log('\n📦 Products in Database:\n');
    
    const products = await Product.find({}).select('name batchNumber quantity price expiryDate').limit(10);
    
    if (products.length === 0) {
      console.log('No products found in database.');
      process.exit(0);
    }
    
    console.log('Available Batch Numbers for QR Testing:');
    console.log('=' .repeat(60));
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Batch: ${product.batchNumber}`);
      console.log(`   Quantity: ${product.quantity}`);
      console.log(`   Price: Rs ${product.price}`);
      console.log(`   Expiry: ${product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}`);
      console.log('');
    });
    
    console.log('🔍 QR Testing Instructions:');
    console.log('- Use any batch number above (e.g., VIT-518940)');
    console.log('- Try manual input, file upload, or camera scanning');
    console.log('- Backend will search by batch number automatically');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    process.exit(1);
  }
}