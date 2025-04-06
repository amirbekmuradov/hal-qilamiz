const { Issue, IssuePriority, IssueStatus } = require('../models/Issue');
const { User, UserRole } = require('../models/User');
const { Region } = require('../models/Region');
const { getStorage } = require('../config/firebase');
const mongoose = require('mongoose');

// Get all issues with pagination and filtering
const getIssues = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      region,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isNationwide,
    } = req.query;

    // Build filter object
    const filter = {};

    // Add status filter if provided
    if (status && Object.values(IssueStatus).includes(status)) {
      filter.status = status;
    }

    // Add region filter if provided
    if (region) {
      filter['location.region'] = region;
    }

    // Add nationwide filter if provided
    if (isNationwide !== undefined) {
      filter['location.isNationwide'] = isNationwide === 'true';
    }

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Query issues with pagination
    const issues = await Issue.find(filter)
      .sort(sort)
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
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get trending issues
const getTrendingIssues = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get issues sorted by total votes and created within the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const issues = await Issue.find({
      createdAt: { $gte: thirtyDaysAgo },
      status: { $ne: IssueStatus.RESOLVED }, // Exclude resolved issues
    })
      .sort({ 'votes.total': -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName profilePictureUrl')
      .populate('location.region', 'name code')
      .exec();

    res.status(200).json({ issues });
  } catch (error) {
    console.error('Error fetching trending issues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recently tackled (resolved) issues
const getTackledIssues = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recently resolved issues
    const issues = await Issue.find({
      status: IssueStatus.RESOLVED,
    })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName profilePictureUrl')
      .populate('location.region', 'name code')
      .exec();

    res.status(200).json({ issues });
  } catch (error) {
    console.error('Error fetching tackled issues:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get issue by ID
const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id)
      .populate('author', 'firstName lastName profilePictureUrl')
      .populate('location.region', 'name code')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'firstName lastName profilePictureUrl role',
        },
      })
      .populate('subscribers', 'firstName lastName')
      .populate('lastUpdatedBy', 'firstName lastName role')
      .exec();

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.status(200).json({ issue });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new issue
const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      mediaUrls,
    } = req.body;

    // Check if user exists
    const user = req.user;

    // Check if region exists if not nationwide
    if (!location.isNationwide && location.regionId) {
      const region = await Region.findById(location.regionId);
      if (!region) {
        return res.status(400).json({ message: 'Invalid region' });
      }
    }

    // Create new issue
    const newIssue = new Issue({
      title,
      description,
      location: {
        region: location.isNationwide ? null : location.regionId,
        isNationwide: location.isNationwide,
        coordinates: location.coordinates,
      },
      author: user._id,
      mediaUrls: mediaUrls || [],
    });

    // Calculate expected response time
    newIssue.calculateResponseTime();

    // Save issue
    await newIssue.save();

    // Update user's issuesCreated array
    await User.findByIdAndUpdate(user._id, {
      $push: { issuesCreated: newIssue._id },
    });

    // Populate author and region
    await newIssue.populate('author', 'firstName lastName profilePictureUrl');
    if (!location.isNationwide && location.regionId) {
      await newIssue.populate('location.region', 'name code');
    }

    res.status(201).json({
      issue: newIssue,
      message: 'Issue created successfully',
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update issue
const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      mediaUrls,
      isEscalated,
    } = req.body;

    // Find issue
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check permissions
    const user = req.user;
    const isAuthor = issue.author.toString() === user._id.toString();
    const hasPrivilegeRole = [UserRole.ADMIN, UserRole.MODERATOR, UserRole.OFFICIAL].includes(user.role);

    if (!isAuthor && !hasPrivilegeRole) {
      return res.status(403).json({ message: 'You do not have permission to update this issue' });
    }

    // Update fields if provided
    if (title) issue.title = title;
    if (description) issue.description = description;
    if (mediaUrls) issue.mediaUrls = mediaUrls;

    // Only allow privileged roles to update status and escalation
    if (hasPrivilegeRole) {
      if (status && Object.values(IssueStatus).includes(status)) {
        issue.status = status;
      }
      if (isEscalated !== undefined) {
        issue.isEscalated = isEscalated;
      }
    }

    // Update last updated by
    issue.lastUpdatedBy = user._id;

    // Recalculate response time if status changed
    if (status) {
      issue.calculateResponseTime();
    }

    // Save updated issue
    await issue.save();

    // Notify subscribers about the update
    // In a real app, you would send notifications to subscribers
    console.log(`Issue ${issue._id} updated. Notifying ${issue.subscribers.length} subscribers.`);

    res.status(200).json({
      issue,
      message: 'Issue updated successfully',
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete issue
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    // Find issue
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check permissions
    const user = req.user;
    const isAuthor = issue.author.toString() === user._id.toString();
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to delete this issue' });
    }

    // Remove issue
    await Issue.deleteOne({ _id: id });

    // Remove issue from user's issuesCreated array
    await User.updateMany(
      { $or: [
        { issuesCreated: id },
        { issuesVotedOn: { $elemMatch: { issue: id } } },
        { issuesSubscribed: id },
      ]},
      { 
        $pull: { 
          issuesCreated: id,
          issuesVotedOn: { issue: id },
          issuesSubscribed: id,
        } 
      }
    );

    res.status(200).json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Vote on issue
const voteOnIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    // Validate priority
    if (!Object.values(IssuePriority).includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    // Find issue
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const user = req.user;

    // Check if user has already voted on this issue
    const existingVoteIndex = issue.votes.users.findIndex(
      vote => vote.user.toString() === user._id.toString()
    );

    if (existingVoteIndex !== -1) {
      // Update existing vote if priority is different
      const existingVote = issue.votes.users[existingVoteIndex];
      if (existingVote.priority !== priority) {
        // Decrement previous priority count
        issue.votes[existingVote.priority] -= 1;
        
        // Increment new priority count
        issue.votes[priority] += 1;
        
        // Update vote priority
        issue.votes.users[existingVoteIndex].priority = priority;
      } else {
        // User is voting with same priority
        return res.status(400).json({ message: 'You have already voted with this priority' });
      }
    } else {
      // Add new vote
      issue.votes.users.push({
        user: user._id,
        priority,
      });
      
      // Increment priority count
      issue.votes[priority] += 1;
      
      // Increment total count
      issue.votes.total += 1;
      
      // Add issue to user's votedOn array
      await User.findByIdAndUpdate(user._id, {
        $push: {
          issuesVotedOn: {
            issue: issue._id,
            priority,
          },
        },
      });
    }

    // Recalculate response time based on new votes
    issue.calculateResponseTime();
    
    // Save updated issue
    await issue.save();

    res.status(200).json({
      votes: issue.votes,
      message: 'Vote recorded successfully',
    });
  } catch (error) {
    console.error('Error voting on issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Subscribe to issue
const subscribeToIssue = async (req, res) => {
  try {
    const { id } = req.params;

    // Find issue
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const user = req.user;

    // Check if user is already subscribed
    const isSubscribed = issue.subscribers.includes(user._id);

    if (isSubscribed) {
      // Unsubscribe
      issue.subscribers = issue.subscribers.filter(
        subscriberId => subscriberId.toString() !== user._id.toString()
      );
      
      // Remove issue from user's subscribed array
      await User.findByIdAndUpdate(user._id, {
        $pull: { issuesSubscribed: issue._id },
      });
      
      await issue.save();
      
      res.status(200).json({
        subscribed: false,
        subscriberCount: issue.subscribers.length,
        message: 'Unsubscribed from issue successfully',
      });
    } else {
      // Subscribe
      issue.subscribers.push(user._id);
      
      // Add issue to user's subscribed array
      await User.findByIdAndUpdate(user._id, {
        $push: { issuesSubscribed: issue._id },
      });
      
      await issue.save();
      
      res.status(200).json({
        subscribed: true,
        subscriberCount: issue.subscribers.length,
        message: 'Subscribed to issue successfully',
      });
    }
  } catch (error) {
    console.error('Error subscribing to issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add resolution step (for officials and admins)
const addResolutionStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, date, status } = req.body;

    // Find issue
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check user permissions
    const user = req.user;
    if (![UserRole.ADMIN, UserRole.OFFICIAL].includes(user.role)) {
      return res.status(403).json({ message: 'Only officials and admins can add resolution steps' });
    }

    // Add resolution step
    issue.resolutionSteps.push({
      description,
      status: status || 'pending',
      date: date || new Date(),
      updatedBy: user._id,
    });

    // Update issue status if needed
    if (status === 'completed' && issue.status !== IssueStatus.RESOLVED) {
      // Check if all steps are completed
      const allStepsCompleted = issue.resolutionSteps.every(step => step.status === 'completed');
      
      if (allStepsCompleted) {
        issue.status = IssueStatus.RESOLVED;
      } else {
        issue.status = IssueStatus.IN_PROGRESS;
      }
    } else if (issue.status === IssueStatus.PENDING) {
      issue.status = IssueStatus.IN_PROGRESS;
    }

    // Update last updated by
    issue.lastUpdatedBy = user._id;

    // Save updated issue
    await issue.save();

    // Notify subscribers about the update
    // In a real app, you would send notifications to subscribers
    console.log(`Resolution step added to issue ${issue._id}. Notifying ${issue.subscribers.length} subscribers.`);

    res.status(200).json({
      issue,
      message: 'Resolution step added successfully',
    });
  } catch (error) {
    console.error('Error adding resolution step:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload media for issue
const uploadMedia = async (req, res) => {
  try {
    // In a real implementation, you would handle file uploads using multer
    // and upload them to Firebase Storage
    
    // Mock implementation
    const fileUrls = [];
    
    res.status(200).json({
      urls: fileUrls,
      message: 'Media uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};