/**
 * Quick Database Reset - Clear all data and reseed with fresh products
 * This will give you a clean slate without any Vitamin C issues
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const PurchaseOrder = require('../models/PurchaseOrder');
const Order = require('../models/Order');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy';

async function quickReset() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('⚠️  WARNING: This will delete ALL data and reseed!');
    console.log('   Waiting 3 seconds... Press Ctrl+C to cancel\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Clear all collections
    console.log('🗑️  Clearing all data...');
    await Product.deleteMany({});
    await PurchaseOrder.deleteMany({});
    // Don't delete orders - keep sales history
    
    console.log('   ✅ Cleared products and purchase orders\n');

    // Add sample products (without Vitamin C)
    console.log('📦 Adding sample products...');
    
    const sampleProducts = [
      {
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        category: 'Pain Relief',
        price: 5.99,
        quantity: 150,
        batchNumber: 'PAR-2024-001',
        expiryDate: new Date('2025-12-31'),
        reorderThreshold: 50,
        supplier: 'PharmaCorp'
      },
      {
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        category: 'Pain Relief',
        price: 7.99,
        quantity: 120,
        batchNumber: 'IBU-2024-002',
        expiryDate: new Date('2025-11-30'),
        reorderThreshold: 40,
        supplier: 'MediSupply'
      },
      {
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        category: 'Antibiotic',
        price: 12.99,
        quantity: 80,
        batchNumber: 'AMX-2024-003',
        expiryDate: new Date('2025-10-31'),
        reorderThreshold: 30,
        supplier: 'PharmaCorp'
      },
      {
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine',
        category: 'Allergy',
        price: 8.99,
        quantity: 100,
        batchNumber: 'CET-2024-004',
        expiryDate: new Date('2026-01-31'),
        reorderThreshold: 35,
        supplier: 'AllergyMeds Inc'
      },
      {
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        category: 'Digestive',
        price: 15.99,
        quantity: 60,
        batchNumber: 'OME-2024-005',
        expiryDate: new Date('2025-09-30'),
        reorderThreshold: 25,
        supplier: 'GastroHealth'
      },
      {
        name: 'Metformin 500mg',
        genericName: 'Metformin',
        category: 'Diabetes',
        price: 10.99,
        quantity: 25, // Low stock - will appear in suggestions
        batchNumber: 'MET-2024-006',
        expiryDate: new Date('2025-08-31'),
        reorderThreshold: 40,
        supplier: 'DiabetesCare'
      },
      {
        name: 'Aspirin 75mg',
        genericName: 'Acetylsalicylic Acid',
        category: 'Cardiovascular',
        price: 4.99,
        quantity: 200,
        batchNumber: 'ASP-2024-007',
        expiryDate: new Date('2026-03-31'),
        reorderThreshold: 50,
        supplier: 'CardioMeds'
      },
      {
        name: 'Loratadine 10mg',
        genericName: 'Loratadine',
        category: 'Allergy',
        price: 9.99,
        quantity: 15, // Low stock - will appear in suggestions
        batchNumber: 'LOR-2024-008',
        expiryDate: new Date('2025-07-31'),
        reorderThreshold: 30,
        supplier: 'AllergyMeds Inc'
      }
    ];

    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`   ✅ Added ${insertedProducts.length} products\n`);

    // Show summary
    console.log('📊 Database Summary:');
    console.log(`   Total Products: ${await Product.countDocuments()}`);
    console.log(`   Purchase Orders: ${await PurchaseOrder.countDocuments()}`);
    console.log(`   Orders (kept): ${await Order.countDocuments()}\n`);

    // Show low stock products
    const lowStock = await Product.find({ quantity: { $lt: 50 } });
    console.log(`📉 Low Stock Products (will appear in suggestions):`);
    lowStock.forEach(p => {
      console.log(`   ${p.name}: ${p.quantity} units (threshold: ${p.reorderThreshold})`);
    });

    console.log('\n✅ Database reset complete!');
    console.log('   Next steps:');
    console.log('   1. Restart backend: cd backend && npm start');
    console.log('   2. Restart AI backend: cd ai && python app.py');
    console.log('   3. Clear browser cache: Ctrl+Shift+R');
    console.log('   4. Refresh frontend');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

quickReset();
