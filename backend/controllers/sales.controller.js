const Sale = require('../models/Sale');

// Get recent sales
exports.getRecentSales = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const sales = await Sale.find()
      .sort({ date: -1 })
      .limit(limit)
      .populate('order')
      .lean();

    res.json({
      success: true,
      count: sales.length,
      sales
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching sales', 
      error: error.message 
    });
  }
};

// Get sales forecast (last 30 days aggregated by day)
exports.getSalesForecast = async (req, res) => {
  try {
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

    // Format dates to be more readable (e.g., "Jan 15", "Jan 16")
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

    // If no data, return empty array
    if (formattedData.length === 0) {
      return res.json([]);
    }

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching sales forecast:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching sales forecast', 
      error: error.message 
    });
  }
};
