const express = require('express');
const router = express.Router();

// Import all route modules
// const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const dashboardRoutes = require('./dashboard.routes');
const inventoryRoutes = require('./inventory.routes');
// const purchaseOrderRoutes = require('./purchaseOrder.routes');
// const customerRoutes = require('./customer.routes');
// const supplierRoutes = require('./supplier.routes');
const salesRoutes = require('./sales.routes');
// const adminRoutes = require('./admin.routes');
// const chatbotRoutes = require('./chatbot.routes');

// Mount routes
// router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/inventory', inventoryRoutes);
// router.use('/purchase-orders', purchaseOrderRoutes);
// router.use('/customers', customerRoutes);
// router.use('/suppliers', supplierRoutes);
router.use('/sales', salesRoutes);
// router.use('/admin', adminRoutes);
// router.use('/chat', chatbotRoutes);

// Health check
router.get('/', (req, res) => {
  res.json({ 
    message: 'MediTrust Backend API is running', 
    status: 'healthy',
    version: '1.0.0'
  });
});

module.exports = router;
