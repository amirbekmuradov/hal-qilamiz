const { Comment } = require('../models/Comment');
const { Issue } = require('../models/Issue');
const { User, UserRole } = require('../models/User');
const mongoose = require('mongoose');

// Create a comment
const createComment = async (req, res) => {
  try {
    const { issueId, content, parentCommentId, mediaUrls } = req.body;
    const user = req.user;

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if parent comment exists if provided
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      // Ensure parent comment belongs to the same issue
      if (parentComment.issue.toString() !== issueId) {
        return res.status(400).json({ message: 'Parent comment does not belong to the specified issue' });
      }
    }

    // Create new comment
    const newComment = new Comment({
      content,
      author: user._id,
      issue: issueId,
      parentComment: parentCommentId || null,
      mediaUrls: mediaUrls || [],
    });

    // If user is an official or admin, mark comment as official
    if ([UserRole.OFFICIAL, UserRole.ADMIN].includes(user.role)) {
      newComment.isOfficial = true;
    }

    // Save comment
    await newComment.save();

    // Populate author and parent comment (if any)
    await newComment.populate('author', 'firstName lastName profilePictureUrl role');
    if (parentCommentId) {
      await newComment.populate('parentComment', 'content author');
    }

    // Update issue's lastUpdatedBy
    await Issue.findByIdAndUpdate(issueId, {
      lastUpdatedBy: user._id,
    });

    // Notify subscribers about the new comment
    // In a real app, you would send notifications to subscribers
    console.log(`New comment added to issue ${issueId}. Notifying subscribers.`);

    res.status(201).json({
      comment: newComment,
      message: 'Comment created successfully',
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get comments for an issue
const getIssueComments = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'asc' } = req.query;

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get comments with pagination
    const comments = await Comment.find({ issue: issueId })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName profilePictureUrl role')
      .populate('parentComment', 'content author')
      .exec();

    // Count total comments for pagination
    const totalComments = await Comment.countDocuments({ issue: issueId });

    // Calculate total pages
    const totalPages = Math.ceil(totalComments / parseInt(limit));

    res.status(200).json({
      comments,
      pagination: {
        totalComments,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get comment by ID
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id)
      .populate('author', 'firstName lastName profilePictureUrl role')
      .populate('issue', 'title')
      .populate('parentComment', 'content author')
      .exec();

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json({ comment });
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    // Find comment
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is authorized to update the comment
    const isAuthor = comment.author.toString() === user._id.toString();
    const isAdmin = user.role === UserRole.ADMIN;
    const isModerator = user.role === UserRole.MODERATOR;

    if (!isAuthor && !isAdmin && !isModerator) {
      return res.status(403).json({ message: 'You do not have permission to update this comment' });
    }

    // Update comment
    comment.content = content;

    // Save updated comment
    await comment.save();

    // Populate author
    await comment.populate('author', 'firstName lastName profilePictureUrl role');

    res.status(200).json({
      comment,
      message: 'Comment updated successfully',
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Find comment
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is authorized to delete the comment
    const isAuthor = comment.author.toString() === user._id.toString();
    const isAdmin = user.role === UserRole.ADMIN;
    const isModerator = user.role === UserRole.MODERATOR;

    if (!isAuthor && !isAdmin && !isModerator) {
      return res.status(403).json({ message: 'You do not have permission to delete this comment' });
    }

    // Get issue ID before deleting comment (for cleanup)
    const issueId = comment.issue;

    // Delete comment
    await Comment.deleteOne({ _id: id });

    // Remove comment from issue's comments array
    await Issue.findByIdAndUpdate(issueId, {
      $pull: { comments: id },
    });

    // Remove comment from user's commentsPosted array
    await User.findByIdAndUpdate(comment.author, {
      $pull: { commentsPosted: id },
    });

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like a comment
const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Find comment
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user already liked the comment
    const alreadyLiked = comment.likes.includes(user._id);

    if (alreadyLiked) {
      // Unlike the comment
      comment.likes = comment.likes.filter(
        likeId => likeId.toString() !== user._id.toString()
      );
    } else {
      // Like the comment
      comment.likes.push(user._id);
    }

    // Save updated comment
    await comment.save();

    res.status(200).json({
      liked: !alreadyLiked,
      likesCount: comment.likes.length,
      message: alreadyLiked ? 'Comment unliked successfully' : 'Comment liked successfully',
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createComment,
  getIssueComments,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
};