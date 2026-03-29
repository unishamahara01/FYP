const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all suppliers
router.get('/', authenticateToken, supplierController.getAllSuppliers);

// Create supplier
router.post('/', authenticateToken, supplierController.createSupplier);

// Update supplier
router.put('/:id', authenticateToken, supplierController.updateSupplier);

// Delete supplier
router.delete('/:id', authenticateToken, supplierController.deleteSupplier);

module.exports = router;
