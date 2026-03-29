const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/meditrust')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function updateProductExpiry() {
  try {
    // Find Paracetamol with high stock (1000 units)
    const paracetamol = await Product.findOne({ 
      name: 'Paracetamol 500mg', 
      quantity: 1000 
    });
    
    if (paracetamol) {
      // Set expiry to 15 days from now (CRITICAL RISK)
      // High stock (1000) + High value (50000) + Soon expiry (15 days) = Critical Risk
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 15);
      
      paracetamol.expiryDate = newExpiryDate;
      await paracetamol.save();
      
      console.log('✅ Updated Paracetamol 500mg:');
      console.log('   Expiry date:', newExpiryDate.toLocaleDateString());
      console.log('   Stock: 1000 units');
      console.log('   Value: Rs 50,000');
      console.log('   This WILL trigger AI Critical Risk alert! ⚠️');
    } else {
      console.log('❌ Paracetamol with 1000 stock not found');
    }
    
    console.log('\n🎯 Now refresh your dashboard to see the AI alert banner!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateProductExpiry();
