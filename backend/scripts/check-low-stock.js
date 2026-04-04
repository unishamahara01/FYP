const mongoose = require('mongoose');
require('dotenv').config();

const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));

async function checkLowStock() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust';
    await mongoose.connect(MONGODB_URI);
    
    const lowStock = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).select('name quantity reorderLevel');
    
    console.log('Low Stock Products:', lowStock.length);
    lowStock.forEach(p => {
      console.log(`- ${p.name}: Qty ${p.quantity} (Reorder: ${p.reorderLevel})`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkLowStock();
