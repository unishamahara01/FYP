const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// All routes require Admin role
router.use(authenticateToken, authorizeRole('Admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users', [
  body('fullName').trim().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], adminController.createUser);
router.put('/users/:id', [
  body('fullName').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail()
], adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
