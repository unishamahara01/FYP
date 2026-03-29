const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// AI Chatbot
router.post('/', authenticateToken, chatbotController.chat);

module.exports = router;
