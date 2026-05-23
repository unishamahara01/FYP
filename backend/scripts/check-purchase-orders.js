require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const PurchaseOrder = require('../models/PurchaseOrder');

async function checkPurchaseOrders() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all purchase orders
    const allPOs = await PurchaseOrder.find().sort({ createdAt: -1 });
    console.log(`📦 Total Purchase Orders: ${allPOs.length}\n`);

    // Group by status
    const pending = allPOs.filter(po => po.status === 'Pending');
    const received = allPOs.filter(po => po.status === 'Received');

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 PURCHASE ORDERS SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`🟡 Pending Orders: ${pending.length}`);
    console.log(`🟢 Received Orders: ${received.length}\n`);

    if (pending.length > 0) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🟡 PENDING ORDERS:');
      console.log('═══════════════════════════════════════════════════════\n');
      pending.forEach((po, index) => {
        console.log(`${index + 1}. ${po.poNumber || 'No PO Number'}`);
        console.log(`   Product: ${po.productName}`);
        console.log(`   Quantity: ${po.suggestedOrderQty} units`);
        console.log(`   Cost: Rs ${po.estimatedCost}`);
        console.log(`   Created: ${po.createdAt?.toLocaleDateString() || 'Unknown'}`);
        console.log(`   Status: ${po.status}`);
        console.log(`   Processed By: ${po.processedBy || 'Unknown'}\n`);
      });
    }

    if (received.length > 0) {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🟢 RECEIVED ORDERS:');
      console.log('═══════════════════════════════════════════════════════\n');
      received.forEach((po, index) => {
        console.log(`${index + 1}. ${po.poNumber || 'No PO Number'}`);
        console.log(`   Product: ${po.productName}`);
        console.log(`   Quantity: ${po.suggestedOrderQty} units`);
        console.log(`   Cost: Rs ${po.estimatedCost}`);
        console.log(`   Created: ${po.createdAt?.toLocaleDateString() || 'Unknown'}`);
        console.log(`   Received: ${po.receivedAt?.toLocaleDateString() || 'Unknown'}`);
        console.log(`   Status: ${po.status}`);
        console.log(`   Processed By: ${po.processedBy || 'Unknown'}\n`);
      });
    } else {
      console.log('═══════════════════════════════════════════════════════');
      console.log('⚠️  NO RECEIVED ORDERS FOUND');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('This is why Restock History is empty!\n');
      console.log('To populate Restock History:');
      console.log('1. Login as Pharmacist');
      console.log('2. Go to AI Analytics → Demand Forecast');
      console.log('3. Click "🔄 Reorder" on a product');
      console.log('4. Click "✅ Confirm Receipt" in Pending Deliveries');
      console.log('5. Order will move to Restock History\n');
    }

    console.log('✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPurchaseOrders();
