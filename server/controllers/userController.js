const { User, UserRole, BadgeType } = require('../models/User');
const { Issue } = require('../models/Issue');
const { Comment } = require('../models/Comment');
const { Region } = require('../models/Region');
const { getStorage } = require('../config/firebase');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by ID
    const user = await User.findById(id)
      .populate('region', 'name code')
      .select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const statistics = {
      issuesCreated: user.issuesCreated.length,
      issuesVotedOn: user.issuesVotedOn.length,
      commentsPosted: user.commentsPosted.length,
      issuesResolved: 0, // Will calculate below
      activeDays: 0, // Will calculate below
    };

    // Calculate resolved issues count
    const resolvedIssuesCount = await Issue.countDocuments({
      author: user._id,
      status: 'Resolved',
    });
    statistics.issuesResolved = resolvedIssuesCount;

    // Calculate active days (days with activity in the last 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get unique dates of recent activity
    const issuesDates = await Issue.find({
      author: user._id,
      createdAt: { $gte: sixtyDaysAgo },
    }).distinct('createdAt');

    const commentsDates = await Comment.find({
      author: user._id,
      createdAt: { $gte: sixtyDaysAgo },
    }).distinct('createdAt');

    const votesDates = user.issuesVotedOn
      .filter(vote => new Date(vote.createdAt) >= sixtyDaysAgo)
      .map(vote => vote.createdAt.toISOString().split('T')[0]);

    // Count unique dates
    const uniqueDates = new Set([
      ...issuesDates.map(date => date.toISOString().split('T')[0]),
      ...commentsDates.map(date => date.toISOString().split('T')[0]),
      ...votesDates,
    ]);
    statistics.activeDays = uniqueDates.size;

    // Get recent activity
    const recentIssues = await Issue.find({
      author: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt')
      .lean();

    const recentComments = await Comment.find({
      author: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('issue', 'title')
      .select('content createdAt issue')
      .lean();

    // Format recent activity for response
    const recentActivity = [
      ...recentIssues.map(issue => ({
        type: 'issue_created',
        timestamp: issue.createdAt,
        issueId: issue._id,
        issueTitle: issue.title,
      })),
      ...recentComments.map(comment => ({
        type: 'issue_commented',
        timestamp: comment.createdAt,
        issueId: comment.issue._id,
        issueTitle: comment.issue.title,
        content: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''),
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // Prepare response
    const userProfile = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.role === UserRole.ADMIN ? user.email : undefined, // Only admins can see other users' emails
      region: {
        id: user.region._id,
        name: user.region.name,
      },
      role: user.role,
      trustScore: user.trustScore,
      badges: user.badges,
      isVerified: user.isVerified,
      profilePictureUrl: user.profilePictureUrl,
      bio: user.bio,
      organization: user.organization,
      position: user.position,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    };

    res.status(200).json({
      user: userProfile,
      statistics,
      recentActivity,
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;
    const {
      firstName,
      lastName,
      phone,
      regionId,
      bio,
      organization,
      position,
    } = req.body;

    // Check if region exists if provided
    if (regionId) {
      const region = await Region.findById(regionId);
      if (!region) {
        return res.status(400).json({ message: 'Invalid region' });
      }
    }

    // Update user fields if provided
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone) updateFields.phone = phone;
    if (regionId) updateFields.region = regionId;
    if (bio !== undefined) updateFields.bio = bio;
    if (organization !== undefined) updateFields.organization = organization;
    if (position !== undefined) updateFields.position = position;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('region', 'name code');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare response
    const userProfile = {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      region: {
        id: updatedUser.region._id,
        name: updatedUser.region.name,
      },
      role: updatedUser.role,
      trustScore: updatedUser.trustScore,
      badges: updatedUser.badges,
      isVerified: updatedUser.isVerified,
      profilePictureUrl: updatedUser.profilePictureUrl,
      bio: updatedUser.bio,
      organization: updatedUser.organization,
      position: updatedUser.position,
    };

    res.status(200).json({
      user: userProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user issues
const getUserIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter object
    const filter = { author: id };

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user issues with pagination
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('location.region', 'name code')
      .exec();

    // Count total issues for pagination
    const totalIssues = await Issue.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalIssues / parseInt(limit));

    res.status(200).json({
      issues,
      pagination: {
        totalIssues,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error getting user issues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user subscribed issues
const getUserSubscribedIssues = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter object
    const filter = { subscribers: user._id };

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get subscribed issues with pagination
    const issues = await Issue.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName profilePictureUrl')
      .populate('location.region', 'name code')
      .exec();

    // Count total issues for pagination
    const totalIssues = await Issue.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalIssues / parseInt(limit));

    res.status(200).json({
      issues,
      pagination: {
        totalIssues,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error getting subscribed issues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    // In a real implementation, you would handle file uploads using multer
    // and upload them to Firebase Storage
    
    // Mock implementation - return a placeholder URL
    const profilePictureUrl = `https://via.placeholder.com/150?text=${req.user.firstName.charAt(0)}${req.user.lastName.charAt(0)}`;
    
    // Update user profile picture URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePictureUrl },
      { new: true }
    );

    res.status(200).json({
      profilePictureUrl,
      message: 'Profile picture uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get trending users (active users)
const getTrendingUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get active users in the last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Find users who have been active in the last 60 days
    const activeUsers = await User.find({
      lastActive: { $gte: sixtyDaysAgo },
    })
      .sort({ trustScore: -1 })
      .limit(parseInt(limit))
      .select('firstName lastName profilePictureUrl trustScore badges')
      .lean();

    // Calculate activity score for each user
    const usersWithActivity = await Promise.all(
      activeUsers.map(async (user) => {
        // Count issues created in the last 60 days
        const issuesCreated = await Issue.countDocuments({
          author: user._id,
          createdAt: { $gte: sixtyDaysAgo },
        });

        // Count comments posted in the last 60 days
        const commentsPosted = await Comment.countDocuments({
          author: user._id,
          createdAt: { $gte: sixtyDaysAgo },
        });

        // Count votes in the last 60 days
        const votesCount = await User.aggregate([
          { $match: { _id: user._id } },
          { $project: {
            recentVotes: {
              $filter: {
                input: '$issuesVotedOn',
                as: 'vote',
                cond: { $gte: ['$$vote.createdAt', sixtyDaysAgo] }
              }
            }
          }},
          { $project: { voteCount: { $size: '$recentVotes' } } }
        ]);

        const voteCount = votesCount.length > 0 ? votesCount[0].voteCount : 0;

        // Calculate activity score
        const activityScore = issuesCreated * 5 + commentsPosted * 2 + voteCount;

        return {
          ...user,
          activityScore,
          recentActivity: {
            issuesCreated,
            commentsPosted,
            voteCount,
          },
        };
      })
    );

    // Sort by activity score
    usersWithActivity.sort((a, b) => b.activityScore - a.activityScore);

    res.status(200).json({
      users: usersWithActivity,
    });
  } catch (error) {
    console.error('Error getting trending users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check if authenticated user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can update user roles' });
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
      },
      message: 'User role updated successfully',
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Award badge to user
const awardBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const { badge } = req.body;

    // Check if authenticated user is admin
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Only admins can award badges' });
    }

    // Validate badge
    if (!Object.values(BadgeType).includes(badge)) {
      return res.status(400).json({ message: 'Invalid badge' });
    }

    // Check if user already has this badge
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.badges.includes(badge)) {
      return res.status(400).json({ message: 'User already has this badge' });
    }

    // Award badge
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $push: { badges: badge } },
      { new: true }
    );

    // Recalculate trust score
    await updatedUser.calculateTrustScore();

    res.status(200).json({
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        badges: updatedUser.badges,
        trustScore: updatedUser.trustScore,
      },
      message: 'Badge awarded successfully',
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserIssues,
  getUserSubscribedIssues,
  uploadProfilePicture,
  getTrendingUsers,
  updateUserRole,
  awardBadge,
};