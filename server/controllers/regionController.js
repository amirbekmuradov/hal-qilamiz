const { Region } = require('../models/Region');
const { Issue, IssueStatus } = require('../models/Issue');
const { User, UserRole } = require('../models/User');

// Get all regions
const getAllRegions = async (req, res) => {
  try {
    const regions = await Region.find({ isActive: true })
      .select('name code description population coordinates imageUrl')
      .sort({ name: 1 });

    res.status(200).json({ regions });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get region by ID or code
const getRegionById = async (req, res) => {
  try {
    const { id } = req.params;

    let region;
    if (mongoose.Types.ObjectId.isValid(id)) {
      // If ID is a valid MongoDB ObjectId
      region = await Region.findById(id);
    } else {
      // If ID is not a valid ObjectId, try finding by code
      region = await Region.findOne({ code: id });
    }

    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    // Get issue counts for the region
    const totalIssues = await Issue.countDocuments({ 'location.region': region._id });
    const pendingIssues = await Issue.countDocuments({ 'location.region': region._id, status: IssueStatus.PENDING });
    const inProgressIssues = await Issue.countDocuments({ 'location.region': region._id, status: IssueStatus.IN_PROGRESS });
    const resolvedIssues = await Issue.countDocuments({ 'location.region': region._id, status: IssueStatus.RESOLVED });

    // Get official representatives
    await region.populate({
      path: 'officialRepresentatives.user',
      select: 'firstName lastName profilePictureUrl',
    });

    // Format the response
    const regionData = {
      id: region._id,
      name: region.name,
      code: region.code,
      description: region.description,
      population: region.population,
      coordinates: region.coordinates,
      imageUrl: region.imageUrl,
      statisticsUrl: region.statisticsUrl,
      localGovernmentWebsite: region.localGovernmentWebsite,
      subRegions: region.subRegions,
      officialRepresentatives: region.officialRepresentatives.map(rep => ({
        id: rep.user._id,
        name: `${rep.user.firstName} ${rep.user.lastName}`,
        position: rep.position,
        department: rep.department,
        profilePictureUrl: rep.user.profilePictureUrl,
      })),
      issueStatistics: {
        total: totalIssues,
        pending: pendingIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues,
        resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues * 100).toFixed(1) : 0,
      },
    };

    res.status(200).json({ region: regionData });
  } catch (error) {
    console.error('Error fetching region:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get region issues
const getRegionIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Find region
    let region;
    if (mongoose.Types.ObjectId.isValid(id)) {
      region = await Region.findById(id);
    } else {
      region = await Region.findOne({ code: id });
    }

    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    // Build filter object
    const filter = { 'location.region': region._id };

    // Add status filter if provided
    if (status && Object.values(IssueStatus).includes(status)) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get issues with pagination
    const issues = await Issue.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName profilePictureUrl')
      .exec();

    // Count total issues for pagination
    const totalIssues = await Issue.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalIssues / parseInt(limit));

    res.status(200).json({
      region: {
        id: region._id,
        name: region.name,
        code: region.code,
      },
      issues,
      pagination: {
        totalIssues,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching region issues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get region statistics
const getRegionStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query; // days: 7, 30, 90, 365

    // Find region
    let region;
    if (mongoose.Types.ObjectId.isValid(id)) {
      region = await Region.findById(id);
    } else {
      region = await Region.findOne({ code: id });
    }

    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    // Calculate start date based on period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get issue statistics
    const issueStats = await Issue.aggregate([
      {
        $match: {
          'location.region': region._id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
          },
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
            },
          },
          totalCount: { $sum: '$count' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
        },
      },
    ]);

    // Format the statistics for frontend charts
    const formattedStats = issueStats.map(day => {
      const date = new Date(day._id.year, day._id.month - 1, day._id.day);
      const formattedDate = date.toISOString().split('T')[0];

      // Initialize counts for all statuses
      const statusCounts = {
        [IssueStatus.PENDING]: 0,
        [IssueStatus.IN_PROGRESS]: 0,
        [IssueStatus.RESOLVED]: 0,
      };

      // Update with actual counts
      day.statuses.forEach(status => {
        if (Object.values(IssueStatus).includes(status.status)) {
          statusCounts[status.status] = status.count;
        }
      });

      return {
        date: formattedDate,
        ...statusCounts,
        total: day.totalCount,
      };
    });

    // Get overall statistics
    const totalIssues = await Issue.countDocuments({ 'location.region': region._id });
    const pendingIssues = await Issue.countDocuments({ 'location.region': region._id, status: IssueStatus.PENDING });
    const inProgressIssues = await Issue.countDocuments({ 'location.region': region._id, status: IssueStatus.IN_PROGRESS });
    const resolvedIssues = await Issue.countDocuments({ 'location.region': region._id, status: IssueStatus.RESOLVED });

    // Calculate average resolution time for resolved issues
    const resolvedIssuesData = await Issue.find({
      'location.region': region._id,
      status: IssueStatus.RESOLVED,
    }).select('createdAt updatedAt');

    let totalResolutionTime = 0;
    resolvedIssuesData.forEach(issue => {
      const createdAt = new Date(issue.createdAt);
      const resolvedAt = new Date(issue.updatedAt);
      const resolutionTime = resolvedAt - createdAt; // in milliseconds
      totalResolutionTime += resolutionTime;
    });

    const averageResolutionTime = resolvedIssuesData.length > 0
      ? totalResolutionTime / resolvedIssuesData.length / (1000 * 60 * 60 * 24) // in days
      : 0;

    res.status(200).json({
      region: {
        id: region._id,
        name: region.name,
        code: region.code,
      },
      period: parseInt(period),
      dailyStats: formattedStats,
      overallStats: {
        totalIssues,
        pendingIssues,
        inProgressIssues,
        resolvedIssues,
        resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues * 100).toFixed(1) : 0,
        averageResolutionTime: averageResolutionTime.toFixed(1), // in days
      },
    });
  } catch (error) {
    console.error('Error fetching region statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Create a new region
const createRegion = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      population,
      coordinates,
      imageUrl,
      statisticsUrl,
      localGovernmentWebsite,
      subRegions,
    } = req.body;

    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can create regions' });
    }

    // Check if region with same name or code already exists
    const existingRegion = await Region.findOne({
      $or: [{ name }, { code }],
    });

    if (existingRegion) {
      return res.status(400).json({ message: 'Region with this name or code already exists' });
    }

    // Create new region
    const newRegion = new Region({
      name,
      code,
      description,
      population,
      coordinates,
      imageUrl,
      statisticsUrl,
      localGovernmentWebsite,
      subRegions: subRegions || [],
    });

    // Save region
    await newRegion.save();

    res.status(201).json({
      region: newRegion,
      message: 'Region created successfully',
    });
  } catch (error) {
    console.error('Error creating region:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update region
const updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can update regions' });
    }

    // Find region
    let region;
    if (mongoose.Types.ObjectId.isValid(id)) {
      region = await Region.findById(id);
    } else {
      region = await Region.findOne({ code: id });
    }

    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    // Update region
    Object.keys(updateData).forEach(key => {
      // Skip _id field
      if (key !== '_id') {
        region[key] = updateData[key];
      }
    });

    // Save updated region
    await region.save();

    res.status(200).json({
      region,
      message: 'Region updated successfully',
    });
  } catch (error) {
    console.error('Error updating region:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Add official representative to region
const addOfficialRepresentative = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, position, department } = req.body;

    // Check if user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can add official representatives' });
    }

    // Find region
    let region;
    if (mongoose.Types.ObjectId.isValid(id)) {
      region = await Region.findById(id);
    } else {
      region = await Region.findOne({ code: id });
    }

    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a representative for this region
    const isExistingRep = region.officialRepresentatives.some(rep => rep.user.toString() === userId);
    if (isExistingRep) {
      return res.status(400).json({ message: 'User is already a representative for this region' });
    }

    // Update user role to official if not already
    if (user.role !== UserRole.OFFICIAL && user.role !== UserRole.ADMIN) {
      user.role = UserRole.OFFICIAL;
      await user.save();
    }

    // Add representative to region
    region.officialRepresentatives.push({
      user: userId,
      position,
      department,
    });

    // Save updated region
    await region.save();

    // Populate user details for response
    await region.populate({
      path: 'officialRepresentatives.user',
      select: 'firstName lastName profilePictureUrl',
    });

    res.status(200).json({
      representative: region.officialRepresentatives[region.officialRepresentatives.length - 1],
      message: 'Official representative added successfully',
    });
  } catch (error) {
    console.error('Error adding official representative:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllRegions,
  getRegionById,
  getRegionIssues,
  getRegionStatistics,
  createRegion,
  updateRegion,
  addOfficialRepresentative,
};