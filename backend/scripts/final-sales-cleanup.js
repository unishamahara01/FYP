const mongoose = require('mongoose');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

async function finalSalesCleanup() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('🧹 Final Sales Cleanup...\n');
    
    // Get all valid product IDs
    const validProducts = await Product.find().select('_id name');
    const validProductIds = validProducts.map(p => p._id.toString());
    const validProductNames = validProducts.map(p => p.name.toLowerCase());
    
    console.log(`📦 Valid products (${validProducts.length}):`);
    validProducts.forEach(p => console.log(`   - ${p.name}`));
    console.log('');
    
    // Check all sales
    const allSales = await Sale.find();
    console.log(`💰 Checking ${allSales.length} sales records...\n`);
    
    let removedCount = 0;
    let keptCount = 0;
    
    for (const sale of allSales) {
      let shouldRemove = false;
      
      // Check if product ID is invalid
      if (sale.product && !validProductIds.includes(sale.product.toString())) {
        shouldRemove = true;
      }
      
      // Check if product name contains "test" or "dummy"
      if (sale.productName) {
        const nameLower = sale.productName.toLowerCase();
        if (nameLower.includes('test') || nameLower.includes('dummy') || nameLower.includes('sample')) {
          shouldRemove = true;
        }
      }
      
      if (shouldRemove) {
        console.log(`   ❌ Removing: ${sale.productName || 'Unknown'} (${sale.date?.toLocaleDateString() || 'No date'})`);
        await Sale.deleteOne({ _id: sale._id });
        removedCount++;
      } else {
        keptCount++;
      }
    }
    
    console.log(`\n✅ Removed ${removedCount} invalid sales`);
    console.log(`✅ Kept ${keptCount} valid sales\n`);
    
    const finalCount = await Sale.countDocuments();
    console.log(`📊 Final sales count: ${finalCount}\n`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

finalSalesCleanup();
