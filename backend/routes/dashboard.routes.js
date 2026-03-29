const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get dashboard stats
router.get('/stats', authenticateToken, dashboardController.getStats);

// Get top products
router.get('/top-products', authenticateToken, dashboardController.getTopProducts);

// Get recent activity
router.get('/recent-activity', authenticateToken, dashboardController.getRecentActivity);

module.exports = router;
