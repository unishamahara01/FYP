const mongoose = require('mongoose');
require('dotenv').config();

async function checkVitaminB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust';
    await mongoose.connect(MONGODB_URI);
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
    const vitaminB = await Product.findOne({ name: /vitamin.*b/i });
    
    if (vitaminB) {
      console.log('\n📦 Vitamin B Complex Details:');
      console.log('Name:', vitaminB.name);
      console.log('Quantity:', vitaminB.quantity);
      console.log('Reorder Level:', vitaminB.reorderLevel);
      console.log('Category:', vitaminB.category);
      
      const status = vitaminB.quantity === 0 ? '🔴 OUT OF STOCK' : 
                     vitaminB.quantity <= vitaminB.reorderLevel ? '🟡 LOW STOCK' : 
                     '🟢 IN STOCK';
      
      console.log('Status:', status);
      console.log('\nLogic Check:');
      console.log(`${vitaminB.quantity} <= ${vitaminB.reorderLevel}?`, vitaminB.quantity <= vitaminB.reorderLevel);
    } else {
      console.log('❌ Vitamin B Complex not found in database');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkVitaminB();
