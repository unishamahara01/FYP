/**
 * Find all Vitamin products in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const PurchaseOrder = require('../models/PurchaseOrder');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy';

async function findVitaminProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all products with "vitamin" in the name
    console.log('🔍 Searching for all Vitamin products...\n');
    const vitaminProducts = await Product.find({ 
      name: { $regex: /vitamin/i } 
    });

    if (vitaminProducts.length === 0) {
      console.log('❌ No Vitamin products found');
    } else {
      console.log(`✅ Found ${vitaminProducts.length} Vitamin products:\n`);
      
      for (const product of vitaminProducts) {
        console.log(`📦 ${product.name}`);
        console.log(`   ID: ${product._id}`);
        console.log(`   Batch: ${product.batchNumber}`);
        console.log(`   Quantity: ${product.quantity}`);
        console.log(`   Category: ${product.category}`);
        
        // Check for pending POs
        const pendingPOs = await PurchaseOrder.find({ 
          product: product._id, 
          status: 'Pending' 
        });
        
        if (pendingPOs.length > 0) {
          console.log(`   ⚠️  PENDING POs: ${pendingPOs.length}`);
          pendingPOs.forEach(po => {
            console.log(`      - ${po.poNumber} (${po.suggestedOrderQty} units)`);
          });
        }
        console.log('');
      }
    }

    // Also check all pending POs
    console.log('\n🚚 All Pending Purchase Orders:');
    const allPendingPOs = await PurchaseOrder.find({ status: 'Pending' });
    console.log(`   Total: ${allPendingPOs.length}\n`);
    
    for (const po of allPendingPOs) {
      console.log(`   ${po.poNumber}: ${po.productName} (Product ID: ${po.product})`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

findVitaminProducts();
