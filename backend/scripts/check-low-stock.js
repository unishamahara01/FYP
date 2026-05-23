const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    
    // Check products with quantity <= 50
    const lowStockProducts = await Product.find({
      quantity: { $lte: 50 }
    }).sort({ quantity: 1 });
    
    console.log('📊 LOW STOCK ANALYSIS (Threshold: 50)');
    console.log('=====================================\n');
    
    const outOfStock = lowStockProducts.filter(p => p.quantity === 0);
    const lowStock = lowStockProducts.filter(p => p.quantity > 0 && p.quantity <= 50);
    
    console.log(`Total Low Stock Products: ${lowStockProducts.length}`);
    console.log(`Out of Stock (0): ${outOfStock.length}`);
    console.log(`Low Stock (1-50): ${lowStock.length}\n`);
    
    console.log('OUT OF STOCK PRODUCTS:');
    outOfStock.forEach(p => {
      console.log(`  - ${p.name} | Qty: ${p.quantity} | Status: ${p.status}`);
    });
    
    console.log('\nLOW STOCK PRODUCTS:');
    lowStock.forEach(p => {
      console.log(`  - ${p.name} | Qty: ${p.quantity} | Reorder Level: ${p.reorderLevel || 'N/A'}`);
    });
    
    // Check products below reorder level
    console.log('\n\n📊 REORDER LEVEL ANALYSIS');
    console.log('=====================================\n');
    
    const belowReorder = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    
    console.log(`Products Below Reorder Level: ${belowReorder.length}`);
    belowReorder.forEach(p => {
      console.log(`  - ${p.name} | Qty: ${p.quantity} | Reorder: ${p.reorderLevel}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
