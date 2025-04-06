const express = require('express');
const router = express.Router();
const {
  getAllRegions,
  getRegionById,
  getRegionIssues,
  getRegionStatistics,
  createRegion,
  updateRegion,
  addOfficialRepresentative,
} = require('../controllers/regionController');
const { idValidation } = require('../middleware/validation');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get all regions
router.get('/', getAllRegions);

// Get region by ID or code
router.get('/:id', idValidation, getRegionById);

// Get region issues
router.get('/:id/issues', idValidation, getRegionIssues);

// Get region statistics
router.get('/:id/statistics', idValidation, getRegionStatistics);

// Admin: Create region
router.post('/', authenticateToken, isAdmin, createRegion);

// Admin: Update region
router.put('/:id', authenticateToken, isAdmin, idValidation, updateRegion);

// Admin: Add official representative
router.post('/:id/representatives', authenticateToken, isAdmin, idValidation, addOfficialRepresentative);

module.exports = router;