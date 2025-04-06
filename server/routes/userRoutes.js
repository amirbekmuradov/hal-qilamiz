const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserIssues,
  getUserSubscribedIssues,
  uploadProfilePicture,
  getTrendingUsers,
  updateUserRole,
  awardBadge,
} = require('../controllers/userController');
const { userValidation, idValidation } = require('../middleware/validation');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get user profile by ID
router.get('/:id', idValidation, getUserProfile);

// Update current user profile
router.put('/profile', authenticateToken, userValidation.updateProfile, updateUserProfile);

// Get issues created by user
router.get('/:id/issues', idValidation, getUserIssues);

// Get issues subscribed by current user
router.get('/subscribed-issues', authenticateToken, getUserSubscribedIssues);

// Upload profile picture
router.post('/profile-picture', authenticateToken, uploadProfilePicture);

// Get trending users
router.get('/trending', getTrendingUsers);

// Admin: Update user role
router.put('/:id/role', authenticateToken, isAdmin, idValidation, updateUserRole);

// Admin: Award badge to user
router.post('/:id/badge', authenticateToken, isAdmin, idValidation, awardBadge);

module.exports = router;