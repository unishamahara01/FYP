const Product = require('../models/Product');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const { checkAndSendAlerts } = require('../utils/autoLowStockAlert');
const { getUserFilter } = require('../middleware/auth.middleware');

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Check for low stock and send automatic alerts (async, don't wait)
    if (req.user && req.user.email) {
      checkAndSendAlerts(req.user.email, req.user.fullName || req.user.email)
        .then(result => {
          if (result.success && result.alertsSent > 0) {
            console.log(`📧 Automatic alert sent to ${req.user.email} for ${result.productsCount} products`);
          }
        })
        .catch(err => console.error('Error sending automatic alert:', err));
    }

    const productFilter = getUserFilter(req, 'createdBy');
    const orderFilter = getUserFilter(req, 'processedBy');

    // Total SKUs (products) — scoped
    const totalSKUs = await Product.countDocuments(productFilter);

    // Expiring items (within 90 days) — scoped
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const expiringItems = await Product.countDocuments({
      ...productFilter,
      expiryDate: { $lte: ninetyDaysFromNow, $gte: new Date() }
    });

    // Low stock items (quantity <= reorder level, including out of stock) — scoped
    const lowStockItems = await Product.countDocuments({
      ...productFilter,
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });

    // Today's sales (Nepal Standard Time timezone-aware boundaries)
    const options = { timeZone: 'Asia/Kathmandu', year: 'numeric', month: 'numeric', day: 'numeric' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    let year, month, day;
    parts.forEach(p => {
      if (p.type === 'year') year = parseInt(p.value);
      if (p.type === 'month') month = parseInt(p.value) - 1;
      if (p.type === 'day') day = parseInt(p.value);
    });

    const startOfNepalToday = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const today = new Date(startOfNepalToday.getTime() - (5 * 60 + 45) * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Build scoped match for sales aggregation
    const saleMatchStage = {
      date: { $gte: today, $lt: tomorrow }
    };
    if (orderFilter.processedBy) {
      const mongoose = require('mongoose');
      saleMatchStage.processedBy = new mongoose.Types.ObjectId(orderFilter.processedBy);
    }

    const todaysSales = await Sale.aggregate([
      {
        $match: saleMatchStage
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const todaysSalesAmount = todaysSales.length > 0 ? todaysSales[0].total : 0;

    res.json({
      totalSKUs,
      expiringItems,
      predictedShortages: lowStockItems, // Frontend expects this field name
      lowStockItems, // Keep for backward compatibility
      todaysSales: todaysSalesAmount
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics', error: error.message });
  }
};

// Get top products
exports.getTopProducts = async (req, res) => {
  try {
    const orderFilter = getUserFilter(req, 'processedBy');

    // Get top 5 products by sales in last 30 days — scoped
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const matchStage = {
      createdAt: { $gte: thirtyDaysAgo },
      status: 'Completed'
    };
    if (orderFilter.processedBy) {
      const mongoose = require('mongoose');
      matchStage.processedBy = new mongoose.Types.ObjectId(orderFilter.processedBy);
    }

    const topProducts = await Order.aggregate([
      {
        $match: matchStage
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$productName',
          soldQuantity: '$totalQuantity',
          revenue: '$totalRevenue'
        }
      }
    ]);

    res.json(topProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: 'Error fetching top products', error: error.message });
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const orderFilter = getUserFilter(req, 'processedBy');

    // Get last 10 orders — scoped
    const recentOrders = await Order.find(orderFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber customerName totalAmount status createdAt')
      .lean();

    const activities = recentOrders.map(order => ({
      type: 'order',
      description: `Order ${order.orderNumber} - ${order.customerName}`,
      amount: order.totalAmount,
      status: order.status,
      timestamp: order.createdAt
    }));

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Error fetching recent activity', error: error.message });
  }
};
