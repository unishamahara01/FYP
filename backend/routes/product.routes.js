const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all products
router.get('/', authenticateToken, productController.getAllProducts);

// Get single product
router.get('/:id', authenticateToken, productController.getProductById);

// Create product
router.post('/', authenticateToken, productController.createProduct);

// Update product
router.put('/:id', authenticateToken, productController.updateProduct);

// Delete product
router.delete('/:id', authenticateToken, productController.deleteProduct);

// QR Code routes
router.post('/qr-lookup', authenticateToken, productController.qrLookup);
router.post('/qr-add', authenticateToken, productController.qrAddToInventory);

module.exports = router;
