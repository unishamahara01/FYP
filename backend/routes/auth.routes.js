const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// Register
router.post('/register', [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.register);

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Signup (alternative)
router.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.signup);

// Get current user profile
router.get('/profile', authenticateToken, authController.getProfile);

// Google OAuth
router.post('/google/verify', authController.verifyGoogleToken);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], authController.forgotPassword);

// Reset Password
router.post('/reset-password', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Reset code must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.resetPassword);

// Get user permissions
router.get('/permissions', authenticateToken, authController.getPermissions);

module.exports = router;
