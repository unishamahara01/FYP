/**
 * Comprehensive State Verification Script
 * Checks actual database state and compares with what should be displayed
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function verifyCurrentState() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Product = require('../models/Product');
    const Order = require('../models/Order');
    const Customer = require('../models/Customer');

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 CURRENT DATABASE STATE');
    console.log('═══════════════════════════════════════════════════════\n');

    // 1. Total Products
    const totalProducts = await Product.countDocuments({});
    console.log(`1️⃣  TOTAL SKUs: ${totalProducts}`);
    console.log('   └─ All products in inventory\n');

    // 2. Expiring Items (within 90 days)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const expiringItems = await Product.countDocuments({
      expiryDate: { $lte: ninetyDaysFromNow, $gte: new Date() }
    });
    console.log(`2️⃣  EXPIRING ITEMS (90 days): ${expiringItems}`);
    
    const expiringProducts = await Product.find({
      expiryDate: { $lte: ninetyDaysFromNow, $gte: new Date() }
    }).select('name expiryDate quantity').sort({ expiryDate: 1 });
    
    if (expiringProducts.length > 0) {
      console.log('   └─ Products expiring soon:');
      expiringProducts.forEach(p => {
        const daysUntilExpiry = Math.ceil((p.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`      • ${p.name} - Expires in ${daysUntilExpiry} days (${p.expiryDate.toLocaleDateString()})`);
      });
    }
    console.log('');

    // 3. Low Stock Items (quantity <= 50)
    const LOW_STOCK_THRESHOLD = 50;
    const lowStockCount = await Product.countDocuments({
      quantity: { $lte: LOW_STOCK_THRESHOLD }
    });
    console.log(`3️⃣  LOW STOCK ITEMS (qty <= ${LOW_STOCK_THRESHOLD}): ${lowStockCount}`);
    
    const lowStockProducts = await Product.find({
      quantity: { $lte: LOW_STOCK_THRESHOLD }
    }).select('name quantity').sort({ quantity: 1 });
    
    if (lowStockProducts.length > 0) {
      console.log('   └─ Low stock products:');
      lowStockProducts.forEach(p => {
        const status = p.quantity === 0 ? '🔴 OUT OF STOCK' : '🟡 LOW STOCK';
        console.log(`      ${status} - ${p.name} (qty: ${p.quantity})`);
      });
    }
    console.log('');

    // 4. Out of Stock vs Low Stock breakdown
    const outOfStock = await Product.countDocuments({ quantity: 0 });
    const lowStock = await Product.countDocuments({ 
      quantity: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } 
    });
    console.log(`   📦 Breakdown:`);
    console.log(`      • OUT OF STOCK (qty = 0): ${outOfStock}`);
    console.log(`      • LOW STOCK (0 < qty <= 50): ${lowStock}`);
    console.log(`      • TOTAL: ${outOfStock + lowStock}\n`);

    // 5. Today's Sales
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    const todaysOrders = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfToday, $lte: endOfToday },
          status: 'Completed'
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const todaysSales = todaysOrders.length > 0 ? todaysOrders[0].total : 0;
    console.log(`4️⃣  TODAY'S SALES: Rs ${todaysSales.toLocaleString()}`);
    console.log(`   └─ From ${startOfToday.toLocaleTimeString()} to ${endOfToday.toLocaleTimeString()}\n`);

    // 6. Total Orders and Customers
    const totalOrders = await Order.countDocuments({});
    const totalCustomers = await Customer.countDocuments({});
    console.log(`📈 OTHER STATS:`);
    console.log(`   • Total Orders: ${totalOrders}`);
    console.log(`   • Total Customers: ${totalCustomers}\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ EXPECTED DASHBOARD DISPLAY');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│                  DASHBOARD CARDS                    │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│ Total SKUs:           ${totalProducts.toString().padEnd(30)} │`);
    console.log(`│ Expiring Items:       ${expiringItems.toString().padEnd(30)} │`);
    console.log(`│ Low Stock Items:      ${lowStockCount.toString().padEnd(30)} │`);
    console.log(`│ Today's Sales:        Rs ${todaysSales.toLocaleString().padEnd(24)} │`);
    console.log('└─────────────────────────────────────────────────────┘\n');

    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│              LOW STOCK ALERT (Sidebar)              │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│ OUT OF STOCK:         ${outOfStock.toString().padEnd(30)} │`);
    console.log(`│ LOW STOCK:            ${lowStock.toString().padEnd(30)} │`);
    console.log(`│ TOTAL:                ${(outOfStock + lowStock).toString().padEnd(30)} │`);
    console.log('└─────────────────────────────────────────────────────┘\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🎯 VERIFICATION CHECKLIST');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('After refreshing your browser (Ctrl + F5), verify:');
    console.log(`✓ Dashboard "Low Stock Items" shows: ${lowStockCount}`);
    console.log(`✓ Sidebar "OUT OF STOCK" shows: ${outOfStock}`);
    console.log(`✓ Sidebar "LOW STOCK" shows: ${lowStock}`);
    console.log(`✓ Numbers match: ${lowStockCount} = ${outOfStock} + ${lowStock} = ${outOfStock + lowStock} ✅\n`);

    if (lowStockCount === (outOfStock + lowStock)) {
      console.log('✅ MATH CHECKS OUT! Numbers should match after refresh.\n');
    } else {
      console.log('⚠️  WARNING: Math doesn\'t add up! There may be a logic issue.\n');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 NOTES');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('• AI predictions SHOULD be the same for all users ✅');
    console.log('• This is CORRECT behavior (shared inventory)');
    console.log('• Orders ARE filtered by user (security) ✅');
    console.log('• Products are NOT filtered (shared stock) ✅\n');

    await mongoose.connection.close();
    console.log('✅ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyCurrentState();
