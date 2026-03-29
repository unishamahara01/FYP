const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrder.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all purchase orders
router.get('/', authenticateToken, purchaseOrderController.getAllPurchaseOrders);

// Create purchase order
router.post('/', authenticateToken, purchaseOrderController.createPurchaseOrder);

// Fulfill purchase order
router.put('/:id/fulfill', authenticateToken, purchaseOrderController.fulfillPurchaseOrder);

module.exports = router;
