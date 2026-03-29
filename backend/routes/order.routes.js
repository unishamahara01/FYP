const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all orders
router.get('/', authenticateToken, orderController.getAllOrders);

// Get single order
router.get('/:id', authenticateToken, orderController.getOrderById);

// Create order
router.post('/', authenticateToken, orderController.createOrder);

// Update order
router.put('/:id', authenticateToken, orderController.updateOrder);

// Delete order
router.delete('/:id', authenticateToken, orderController.deleteOrder);

module.exports = router;
