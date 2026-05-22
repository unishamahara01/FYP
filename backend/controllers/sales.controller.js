const Sale = require('../models/Sale');
const { getUserFilter } = require('../middleware/auth.middleware');

// Get recent sales
exports.getRecentSales = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const saleFilter = getUserFilter(req, 'processedBy');
    
    const sales = await Sale.find(saleFilter)
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
    // Get sales from last 30 days up to the end of today (Nepal Standard Time timezone-aware boundaries)
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
    const endOfToday = new Date(tomorrow.getTime() - 1);

    const thirtyDaysAgo = new Date(today.getTime());
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build scoped match stage
    const saleFilter = getUserFilter(req, 'processedBy');
    const matchStage = {
      date: { $gte: thirtyDaysAgo, $lte: endOfToday }
    };
    if (saleFilter.processedBy) {
      const mongoose = require('mongoose');
      matchStage.processedBy = new mongoose.Types.ObjectId(saleFilter.processedBy);
    }

    const salesByDay = await Sale.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "+05:45" }
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

    // Format dates to be more readable (e.g., "Jan 15", "Jan 16") in a timezone-neutral way
    const formattedData = salesByDay.map(item => {
      const [y, m, d] = item.date.split('-').map(Number);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[m - 1];
      const day = d;
      
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
