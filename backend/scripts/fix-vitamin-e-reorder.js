const mongoose = require('mongoose');
require('dotenv').config();

async function fixVitaminE() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust';
    await mongoose.connect(MONGODB_URI);
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
    
    // Update Vitamin E reorder level
    const result = await Product.updateOne(
      { name: 'Vitamin E 400 IU' },
      { $set: { reorderLevel: 130 } }
    );
    
    console.log('✅ Updated Vitamin E 400 IU reorder level to 130');
    
    // Verify
    const vitaminE = await Product.findOne({ name: 'Vitamin E 400 IU' });
    console.log('\nVerification:');
    console.log('Name:', vitaminE.name);
    console.log('Quantity:', vitaminE.quantity);
    console.log('Reorder Level:', vitaminE.reorderLevel);
    console.log('Status:', vitaminE.quantity <= vitaminE.reorderLevel ? '🟡 LOW STOCK' : '🟢 IN STOCK');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixVitaminE();
