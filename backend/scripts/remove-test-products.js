const mongoose = require('mongoose');
const Product = require('./models/Product');
const PurchaseOrder = require('./models/PurchaseOrder');

async function removeTestProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🔄 Removing test products and related purchase orders...\n');
    
    // Find all test products (products with "Test" in the name)
    const testProducts = await Product.find({
      $or: [
        { name: /test/i },
        { name: /Test Product/i },
        { name: /Test Medicine/i }
      ]
    });
    
    console.log(`📦 Found ${testProducts.length} test products:`);
    
    for (const product of testProducts) {
      console.log(`   - ${product.name} (Batch: ${product.batchNumber})`);
      
      // Find and delete related purchase orders
      const relatedPOs = await PurchaseOrder.find({ product: product._id });
      if (relatedPOs.length > 0) {
        console.log(`     → Deleting ${relatedPOs.length} related purchase orders`);
        await PurchaseOrder.deleteMany({ product: product._id });
      }
      
      // Delete the product
      await Product.deleteOne({ _id: product._id });
    }
    
    console.log(`\n✅ Removed ${testProducts.length} test products and their purchase orders`);
    
    // Show remaining products count
    const remainingProducts = await Product.countDocuments();
    console.log(`📊 Remaining products in database: ${remainingProducts}`);
    
    // List remaining products
    const products = await Product.find().select('name batchNumber quantity');
    console.log('\n📋 Current Products:');
    products.forEach(p => {
      console.log(`   - ${p.name} (Batch: ${p.batchNumber}, Stock: ${p.quantity})`);
    });
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

removeTestProducts();
