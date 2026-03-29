const mongoose = require('mongoose');
require('dotenv').config();

// Import the notification system
const { checkLowStock, sendLowStockEmail } = require('./lowStockNotification');
const Product = require('./models/Product');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(() => {
    console.log('✓ Connected to MongoDB for testing');
    testLowStockSystem();
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

async function testLowStockSystem() {
  try {
    console.log('\n🧪 Testing Low Stock Notification System...\n');
    
    // 1. Check current low stock items
    console.log('📊 Step 1: Checking current low stock items');
    const lowStockProducts = await Product.find({
      quantity: { $lte: 50 }
    }).sort({ quantity: 1 });
    
    console.log(`Found ${lowStockProducts.length} low stock items:`);
    lowStockProducts.forEach((product, index) => {
      const status = product.quantity === 0 ? '🔴 OUT OF STOCK' : '🟡 LOW STOCK';
      console.log(`  ${index + 1}. ${product.name} (${product.batchNumber}) - Qty: ${product.quantity} ${status}`);
    });
    
    // 2. Check admin users
    console.log('\n👥 Step 2: Checking admin users for notifications');
    const adminUsers = await User.find({ 
      role: { $in: ['Admin', 'Pharmacist'] },
      email: { $exists: true, $ne: '' }
    });
    
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.fullName} (${user.email}) - Role: ${user.role}`);
    });
    
    // 3. Test email sending (dry run - don't actually send)
    console.log('\n📧 Step 3: Testing email generation (dry run)');
    if (lowStockProducts.length > 0 && adminUsers.length > 0) {
      console.log('✅ Email would be sent with the following content:');
      
      const outOfStock = lowStockProducts.filter(p => p.quantity === 0);
      const lowStock = lowStockProducts.filter(p => p.quantity > 0);
      
      console.log(`   - Subject: 🚨 Low Stock Alert - ${outOfStock.length} Out of Stock, ${lowStock.length} Low Stock Items`);
      console.log(`   - Recipients: ${adminUsers.map(u => u.email).join(', ')}`);
      console.log(`   - Out of Stock Items: ${outOfStock.length}`);
      console.log(`   - Low Stock Items: ${lowStock.length}`);
      
      if (outOfStock.length > 0) {
        console.log('   - Out of Stock Products:');
        outOfStock.forEach(p => console.log(`     • ${p.name} (${p.batchNumber})`));
      }
      
      if (lowStock.length > 0) {
        console.log('   - Low Stock Products:');
        lowStock.slice(0, 3).forEach(p => console.log(`     • ${p.name} (${p.batchNumber}) - Qty: ${p.quantity}`));
      }
    } else {
      console.log('⚠️  Cannot test email: No low stock items or no admin users found');
    }
    
    // 4. Test API endpoints (simulate)
    console.log('\n🔗 Step 4: API Endpoints Available');
    console.log('   GET  /api/inventory/low-stock - Get low stock items');
    console.log('   POST /api/inventory/send-low-stock-alert - Send email notifications');
    console.log('   POST /api/inventory/check-low-stock - Automated check');
    
    // 5. Test thresholds
    console.log('\n⚙️  Step 5: Current Configuration');
    console.log('   Low Stock Threshold: 50 units or below');
    console.log('   Out of Stock: 0 units');
    console.log('   Email Format: HTML with professional styling');
    console.log('   Authentication: JWT required for all endpoints');
    
    console.log('\n✅ Low Stock Notification System Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Configure email settings in .env file');
    console.log('   2. Test email sending via API endpoint');
    console.log('   3. Set up automated scheduling (cron job)');
    console.log('   4. Test in browser dashboard');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error testing low stock system:', error);
    process.exit(1);
  }
}

// Export for use in other files
module.exports = { testLowStockSystem };