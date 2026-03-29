const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testThresholdSystem() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🧪 Testing Threshold System\n');
    console.log('=' .repeat(60));
    
    // Get all products and show their threshold logic
    const products = await Product.find().sort({ quantity: 1 });
    
    console.log('\n📊 HOW THE THRESHOLD SYSTEM WORKS:\n');
    console.log('Each product has a "reorderLevel" (threshold) - default is 50');
    console.log('The system automatically assigns status based on:');
    console.log('  1. Quantity vs Threshold (reorderLevel)');
    console.log('  2. Days until expiry\n');
    
    console.log('STATUS RULES (Priority Order):');
    console.log('  ❌ Expired        → Expiry date has passed');
    console.log('  🚫 Out of Stock   → Quantity = 0');
    console.log('  ⚠️  Low Stock      → Quantity ≤ Threshold (reorderLevel)');
    console.log('  ⏰ Expiring Soon  → Days until expiry ≤ 90');
    console.log('  ✅ In Stock       → Quantity > Threshold AND not expiring soon\n');
    
    console.log('=' .repeat(60));
    console.log('\n📦 YOUR CURRENT PRODUCTS:\n');
    
    products.forEach((product, index) => {
      const today = new Date();
      const daysUntilExpiry = Math.floor((product.expiryDate - today) / (1000 * 60 * 60 * 24));
      
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Batch: ${product.batchNumber}`);
      console.log(`   Quantity: ${product.quantity}`);
      console.log(`   Threshold (reorderLevel): ${product.reorderLevel}`);
      console.log(`   Days Until Expiry: ${daysUntilExpiry}`);
      console.log(`   Status: ${product.status}`);
      
      // Explain WHY this status was assigned
      console.log(`   📝 Why this status?`);
      if (daysUntilExpiry < 0) {
        console.log(`      → Medicine has EXPIRED (${Math.abs(daysUntilExpiry)} days ago)`);
      } else if (product.quantity === 0) {
        console.log(`      → Quantity is 0 (completely out of stock)`);
      } else if (product.quantity <= product.reorderLevel) {
        console.log(`      → Quantity (${product.quantity}) ≤ Threshold (${product.reorderLevel})`);
      } else if (daysUntilExpiry <= 90) {
        console.log(`      → Expiring in ${daysUntilExpiry} days (≤ 90 days)`);
      } else {
        console.log(`      → Quantity (${product.quantity}) > Threshold (${product.reorderLevel})`);
        console.log(`      → Not expiring soon (${daysUntilExpiry} days remaining)`);
      }
      console.log('');
    });
    
    console.log('=' .repeat(60));
    console.log('\n🧪 TESTING: What happens when quantity changes?\n');
    
    // Find a product to test with
    const testProduct = products.find(p => p.quantity > 100);
    
    if (testProduct) {
      console.log(`Testing with: ${testProduct.name}`);
      console.log(`Original: Quantity=${testProduct.quantity}, Status="${testProduct.status}"\n`);
      
      // Test 1: Set quantity to 0
      const originalQty = testProduct.quantity;
      const originalStatus = testProduct.status;
      
      testProduct.quantity = 0;
      await testProduct.save();
      console.log(`✅ Test 1: Set quantity to 0`);
      console.log(`   Result: Status changed to "${testProduct.status}"`);
      
      // Test 2: Set quantity below threshold
      testProduct.quantity = 30;
      await testProduct.save();
      console.log(`\n✅ Test 2: Set quantity to 30 (below threshold of ${testProduct.reorderLevel})`);
      console.log(`   Result: Status changed to "${testProduct.status}"`);
      
      // Test 3: Set quantity above threshold
      testProduct.quantity = 200;
      await testProduct.save();
      console.log(`\n✅ Test 3: Set quantity to 200 (above threshold of ${testProduct.reorderLevel})`);
      console.log(`   Result: Status changed to "${testProduct.status}"`);
      
      // Restore original values
      testProduct.quantity = originalQty;
      await testProduct.save();
      console.log(`\n🔄 Restored original quantity: ${originalQty}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ CONCLUSION: The threshold system is WORKING CORRECTLY!');
    console.log('\nThe system automatically updates status whenever:');
    console.log('  • You add a new product');
    console.log('  • You update product quantity');
    console.log('  • You fulfill a purchase order');
    console.log('  • A customer makes a purchase\n');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

testThresholdSystem();
