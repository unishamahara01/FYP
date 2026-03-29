const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(() => {
    console.log('✓ Connected to MongoDB');
    testQRLookup();
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

async function testQRLookup() {
  try {
    console.log('\n🔍 Testing QR Batch Number Lookup:\n');
    
    // Test batch numbers
    const testBatches = ['VIT-844931', 'PAR-943247', 'VIT-2024-003', 'AMX-2024-001'];
    
    for (const batchNumber of testBatches) {
      console.log(`Testing batch: ${batchNumber}`);
      
      const product = await Product.findOne({ batchNumber: batchNumber });
      
      if (product) {
        console.log(`✅ Found: ${product.name} (Qty: ${product.quantity})`);
      } else {
        console.log(`❌ Not found`);
      }
      console.log('');
    }
    
    // Test the exact error case from user
    console.log('Testing user\'s specific case:');
    console.log('Batch: "Vitamin C 1000mgAscorbic Acid" (should fail)');
    const badResult = await Product.findOne({ batchNumber: "Vitamin C 1000mgAscorbic Acid" });
    console.log(badResult ? '✅ Found (unexpected)' : '❌ Not found (expected)');
    
    console.log('\nBatch: "VIT-844931" (should work)');
    const goodResult = await Product.findOne({ batchNumber: "VIT-844931" });
    console.log(goodResult ? `✅ Found: ${goodResult.name}` : '❌ Not found');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing QR lookup:', error);
    process.exit(1);
  }
}