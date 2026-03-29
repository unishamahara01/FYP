const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get recent sales
router.get('/', authenticateToken, salesController.getRecentSales);

// Get sales forecast
router.get('/forecast', authenticateToken, salesController.getSalesForecast);

module.exports = router;
