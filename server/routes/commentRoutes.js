const express = require('express');
const router = express.Router();
const {
  createComment,
  getIssueComments,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
} = require('../controllers/commentController');
const { commentValidation, idValidation } = require('../middleware/validation');
const { authenticateToken, isVerified } = require('../middleware/auth');

// Create comment
router.post('/', authenticateToken, isVerified, commentValidation.createComment, createComment);

// Get comments for an issue
router.get('/issue/:issueId', idValidation, getIssueComments);

// Get comment by ID
router.get('/:id', idValidation, getCommentById);

// Update comment
router.put('/:id', authenticateToken, idValidation, commentValidation.updateComment, updateComment);

// Delete comment
router.delete('/:id', authenticateToken, idValidation, deleteComment);

// Like/unlike comment
router.post('/:id/like', authenticateToken, idValidation, likeComment);

module.exports = router;