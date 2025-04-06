const express = require('express');
const router = express.Router();
const {
  getIssues,
  getTrendingIssues,
  getTackledIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  voteOnIssue,
  subscribeToIssue,
  addResolutionStep,
  uploadMedia,
} = require('../controllers/issueController');
const { issueValidation, idValidation, searchValidation } = require('../middleware/validation');
const { authenticateToken, isVerified, canModifyIssue, isOfficial } = require('../middleware/auth');

// Get issues with search and filters
router.get('/', searchValidation.searchIssues, getIssues);

// Get trending issues
router.get('/trending', getTrendingIssues);

// Get tackled (resolved) issues
router.get('/tackled', getTackledIssues);

// Get issue by ID
router.get('/:id', idValidation, getIssueById);

// Create new issue
router.post('/', authenticateToken, isVerified, issueValidation.createIssue, createIssue);

// Update issue
router.put('/:id', authenticateToken, idValidation, canModifyIssue, issueValidation.updateIssue, updateIssue);

// Delete issue
router.delete('/:id', authenticateToken, idValidation, canModifyIssue, deleteIssue);

// Vote on issue
router.post('/:id/vote', authenticateToken, isVerified, idValidation, issueValidation.vote, voteOnIssue);

// Subscribe to issue
router.post('/:id/subscribe', authenticateToken, idValidation, subscribeToIssue);

// Add resolution step
router.post('/:id/resolution-step', authenticateToken, isOfficial, idValidation, addResolutionStep);

// Upload media for issue
router.post('/upload-media', authenticateToken, uploadMedia);

module.exports = router;