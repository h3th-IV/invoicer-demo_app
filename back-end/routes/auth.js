const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/staff/register', AuthController.registerStaff);
router.post('/staff/login', AuthController.loginStaff);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router; 