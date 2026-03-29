const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Get low stock items
router.get('/low-stock', authenticateToken, inventoryController.getLowStockItems);

// Send low stock alert
router.post('/send-low-stock-alert', authenticateToken, authorizeRole('Admin', 'Pharmacist'), inventoryController.sendLowStockAlert);

// Check low stock (automated)
router.post('/check-low-stock', authenticateToken, authorizeRole('Admin'), inventoryController.checkLowStock);

module.exports = router;
