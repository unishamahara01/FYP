const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');
const Product = require('./models/Product');

async function createTestPO() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🔄 Creating test purchase order...\n');
    
    // Find a product with 0 stock
    const zeroStockProduct = await Product.findOne({ quantity: 0 });
    
    if (!zeroStockProduct) {
      console.log('❌ No products with 0 stock found. Creating one...');
      
      // Create a test product with 0 stock
      const testProduct = new Product({
        name: 'Test Medicine Zero Stock',
        genericName: 'Test Generic',
        category: 'Other',
        manufacturer: 'Test Pharma',
        batchNumber: `TEST-BATCH-${Date.now()}`,
        quantity: 0,
        price: 50.00,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        manufactureDate: new Date(),
        reorderLevel: 50
      });
      
      await testProduct.save();
      console.log(`✅ Created test product: ${testProduct.name} (ID: ${testProduct._id})`);
      
      // Create PO for this product
      const newPO = new PurchaseOrder({
        poNumber: `PO-TEST-${Date.now()}`,
        product: testProduct._id,
        productName: testProduct.name,
        currentStock: 0,
        reorderLevel: testProduct.reorderLevel,
        suggestedOrderQty: 100,
        estimatedCost: 100 * testProduct.price,
        status: 'Pending',
        createdAt: new Date()
      });
      
      await newPO.save();
      console.log(`✅ Created purchase order: ${newPO.poNumber}`);
      console.log(`   Product: ${newPO.productName}`);
      console.log(`   Quantity: ${newPO.suggestedOrderQty}`);
      console.log(`   Status: ${newPO.status}\n`);
      
    } else {
      console.log(`✅ Found product with 0 stock: ${zeroStockProduct.name} (ID: ${zeroStockProduct._id})`);
      
      // Create PO for this product
      const newPO = new PurchaseOrder({
        poNumber: `PO-TEST-${Date.now()}`,
        product: zeroStockProduct._id,
        productName: zeroStockProduct.name,
        currentStock: 0,
        reorderLevel: zeroStockProduct.reorderLevel,
        suggestedOrderQty: 100,
        estimatedCost: 100 * zeroStockProduct.price,
        status: 'Pending',
        createdAt: new Date()
      });
      
      await newPO.save();
      console.log(`✅ Created purchase order: ${newPO.poNumber}`);
      console.log(`   Product: ${newPO.productName}`);
      console.log(`   Quantity: ${newPO.suggestedOrderQty}`);
      console.log(`   Status: ${newPO.status}\n`);
    }
    
    console.log('🎉 Test purchase order created successfully!');
    console.log('📝 You can now test the fulfillment in the UI.');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

createTestPO();
