const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  sendPhoneVerification,
  verifyPhoneCode,
} = require('../controllers/authController');
const { userValidation } = require('../middleware/validation');
const { verifyFirebaseToken, authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', verifyFirebaseToken, userValidation.register, register);

// Login user
router.post('/login', verifyFirebaseToken, login);

// Get current user
router.get('/me', authenticateToken, getCurrentUser);

// Send phone verification code
router.post('/send-verification', authenticateToken, sendPhoneVerification);

// Verify phone code
router.post('/verify-phone', authenticateToken, verifyPhoneCode);

module.exports = router;