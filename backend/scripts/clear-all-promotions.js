const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');

async function clearAllPromotions() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust';
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all products with promotions
    const promotedProducts = await Product.find({ isPromoted: true });
    console.log(`📦 Found ${promotedProducts.length} products with promotions\n`);

    if (promotedProducts.length > 0) {
      console.log('Products with promotions:');
      promotedProducts.forEach(p => {
        console.log(`  - ${p.name}: ${p.discountPercentage}% OFF`);
      });
      console.log('');
    }

    // Clear all promotions
    const result = await Product.updateMany(
      { isPromoted: true },
      { 
        $set: { 
          isPromoted: false, 
          discountPercentage: 0,
          promotionPrice: 0
        } 
      }
    );

    console.log(`✅ Cleared promotions from ${result.modifiedCount} products\n`);
    console.log('Now you can manually apply promotions through the AI Analytics page.');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearAllPromotions();
