const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all customers
router.get('/', authenticateToken, customerController.getAllCustomers);

// Create customer
router.post('/', authenticateToken, customerController.createCustomer);

// Update customer
router.put('/:id', authenticateToken, customerController.updateCustomer);

// Delete customer
router.delete('/:id', authenticateToken, customerController.deleteCustomer);

module.exports = router;
