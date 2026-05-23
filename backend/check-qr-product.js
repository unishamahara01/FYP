/**
 * Check if product with QR code exists
 * Run: node check-qr-product.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({
  name: String,
  batchNumber: String,
  quantity: Number,
  price: Number,
  expiryDate: Date,
  manufactureDate: Date,
});

const Product = mongoose.model('Product', productSchema);

async function checkProduct() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust');
    console.log('✅ Connected to MongoDB\n');

    // Search for the product
    const qrCode = 'PAR-943247';
    console.log(`🔍 Searching for product with batch number: ${qrCode}\n`);

    const product = await Product.findOne({ batchNumber: qrCode });
    
    if (product) {
      console.log('✅ Product found!');
      console.log(`   Name: ${product.name}`);
      console.log(`   Batch: ${product.batchNumber}`);
      console.log(`   Quantity: ${product.quantity}`);
      console.log(`   ID: ${product._id}`);
    } else {
      console.log('❌ Product NOT found with batch number:', qrCode);
      console.log('\n📋 Checking all products with "PAR" in batch number...\n');
      
      const similarProducts = await Product.find({ 
        batchNumber: { $regex: 'PAR', $options: 'i' } 
      }).limit(10);
      
      if (similarProducts.length > 0) {
        console.log(`Found ${similarProducts.length} products with "PAR" in batch:\n`);
        similarProducts.forEach((p, i) => {
          console.log(`${i + 1}. ${p.name}`);
          console.log(`   Batch: ${p.batchNumber}`);
          console.log(`   ID: ${p._id}\n`);
        });
      } else {
        console.log('No products found with "PAR" in batch number.');
        console.log('\n📋 Showing first 5 products in database:\n');
        
        const anyProducts = await Product.find().limit(5);
        anyProducts.forEach((p, i) => {
          console.log(`${i + 1}. ${p.name}`);
          console.log(`   Batch: ${p.batchNumber || 'No batch number'}`);
          console.log(`   ID: ${p._id}\n`);
        });
      }
    }

    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProduct();
