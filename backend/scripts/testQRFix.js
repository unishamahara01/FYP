const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(() => {
    console.log('✓ Connected to MongoDB');
    testQRFix();
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

async function testQRFix() {
  try {
    console.log('\n🔍 Testing QR Fix for JSON Format:\n');
    
    // Simulate the exact QR data format from the error
    const qrDataString = '{"id":"VIT-844931"}';
    console.log(`Testing QR data: ${qrDataString}`);
    
    // Parse like the backend does
    const parsedData = JSON.parse(qrDataString);
    console.log('Parsed data:', parsedData);
    console.log('ID value:', parsedData.id);
    console.log('Is MongoDB ID format?', parsedData.id.match(/^[0-9a-fA-F]{24}$/));
    
    // Test the new logic
    let product = null;
    
    if (parsedData.id) {
      // First check if the ID is actually a batch number format
      if (typeof parsedData.id === 'string' && !parsedData.id.match(/^[0-9a-fA-F]{24}$/)) {
        // Looks like a batch number, not MongoDB ID
        product = await Product.findOne({ batchNumber: parsedData.id });
        console.log("🔍 Found product by parsed ID as batch number:", product ? product.name : 'Not found');
      } else {
        // Try as MongoDB ID
        try {
          product = await Product.findById(parsedData.id);
          console.log("🔍 Found product by parsed ID:", product ? product.name : 'Not found');
        } catch (idError) {
          console.log("❌ MongoDB ID search failed, trying as batch number:", idError.message);
          // Fallback to batch number search
          product = await Product.findOne({ batchNumber: parsedData.id });
          console.log("🔍 Found product by parsed ID as batch number (fallback):", product ? product.name : 'Not found');
        }
      }
    }
    
    if (product) {
      console.log(`\n✅ SUCCESS! Found product:`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Batch: ${product.batchNumber}`);
      console.log(`   Quantity: ${product.quantity}`);
    } else {
      console.log('\n❌ Product not found');
    }
    
    // Test with available batch numbers
    console.log('\n📦 Testing with available batch numbers:');
    const availableBatches = ['VIT-844931', 'PAR-943247', 'VIT-2024-003'];
    
    for (const batch of availableBatches) {
      const testData = `{"id":"${batch}"}`;
      const parsed = JSON.parse(testData);
      const found = await Product.findOne({ batchNumber: parsed.id });
      console.log(`${batch}: ${found ? '✅ Found' : '❌ Not found'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing QR fix:', error);
    process.exit(1);
  }
}