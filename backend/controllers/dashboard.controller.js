const Product = require('../models/Product');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const { checkAndSendAlerts } = require('../utils/autoLowStockAlert');

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

    // Total SKUs (products)
    const totalSKUs = await Product.countDocuments();

    // Expiring items (within 90 days)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const expiringItems = await Product.countDocuments({
      expiryDate: { $lte: ninetyDaysFromNow, $gte: new Date() }
    });

    // Low stock items (quantity <= reorder level, including out of stock)
    const lowStockItems = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow }
        }
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
    // Get top 5 products by sales in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'Completed'
        }
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
    // Get last 10 orders
    const recentOrders = await Order.find()
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
