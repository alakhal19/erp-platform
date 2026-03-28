const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../shared/middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected route — must be logged in
router.get('/me', authenticate, authController.getMe);

module.exports = router;