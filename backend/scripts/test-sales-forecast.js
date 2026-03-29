const mongoose = require('mongoose');
require('dotenv').config();

const Sale = require('../models/Sale');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    
    // Get sales from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const salesByDay = await Sale.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          totalSales: { $sum: '$amount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          actual: '$totalSales',
          orders: '$orderCount'
        }
      }
    ]);

    // Format dates to be more readable
    const formattedData = salesByDay.map(item => {
      const date = new Date(item.date);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const day = date.getDate();
      
      return {
        month: `${month} ${day}`,
        actual: item.actual,
        orders: item.orders
      };
    });

    console.log('📊 Sales Forecast Data (Last 30 Days):');
    console.log(`   Total days with sales: ${formattedData.length}`);
    
    if (formattedData.length > 0) {
      console.log('\n📈 Sample Data (first 5 days):');
      formattedData.slice(0, 5).forEach(day => {
        console.log(`   ${day.month}: Rs ${day.actual} (${day.orders} orders)`);
      });
      
      console.log('\n📈 Sample Data (last 5 days):');
      formattedData.slice(-5).forEach(day => {
        console.log(`   ${day.month}: Rs ${day.actual} (${day.orders} orders)`);
      });
      
      const totalRevenue = formattedData.reduce((sum, day) => sum + day.actual, 0);
      const totalOrders = formattedData.reduce((sum, day) => sum + day.orders, 0);
      
      console.log(`\n💰 Total Revenue (30 days): Rs ${totalRevenue.toLocaleString()}`);
      console.log(`📦 Total Orders (30 days): ${totalOrders}`);
      console.log(`📊 Average Daily Sales: Rs ${Math.round(totalRevenue / formattedData.length).toLocaleString()}`);
      
      console.log('\n✅ Graph data is ready! The chart should display properly.');
    } else {
      console.log('\n❌ No sales data found in the last 30 days.');
      console.log('   Run seedDailySales.js to create sample data.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
