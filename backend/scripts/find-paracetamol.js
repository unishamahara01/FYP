const mongoose = require('mongoose');
require('dotenv').config();

async function findParacetamol() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust';
    await mongoose.connect(MONGODB_URI);
    
    const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
    const paracetamol = await Product.find({ name: /paracetamol/i }).select('name batchNumber _id');
    
    console.log('Paracetamol products found:', paracetamol.length);
    paracetamol.forEach(p => {
      console.log(`- ${p.name}`);
      console.log(`  ID: ${p._id}`);
      console.log(`  Batch: ${p.batchNumber}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findParacetamol();
