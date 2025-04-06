const mongoose = require('mongoose');

// Comment schema
const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
  },
  isOfficial: {
    type: Boolean,
    default: false,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  mediaUrls: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Virtual for checking if comment is a reply
commentSchema.virtual('isReply').get(function() {
  return this.parentComment !== null;
});

// Index for efficient querying
commentSchema.index({ issue: 1, createdAt: -1 });

// Pre-save middleware to check if author is an official
commentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.author);
      
      // Check if user is an official or admin
      if (user && (user.role === 'official' || user.role === 'admin')) {
        this.isOfficial = true;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Post-save middleware to update issue and user references
commentSchema.post('save', async function(doc) {
  try {
    // Add comment to issue's comments array
    const Issue = mongoose.model('Issue');
    await Issue.findByIdAndUpdate(
      doc.issue,
      { $addToSet: { comments: doc._id } }
    );
    
    // Add comment to user's commentsPosted array
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(
      doc.author,
      { $addToSet: { commentsPosted: doc._id } }
    );
    
    // If this is a reply to another comment, update the parent comment
    if (doc.parentComment) {
      const Comment = mongoose.model('Comment');
      await Comment.findByIdAndUpdate(
        doc.parentComment,
        { $addToSet: { replies: doc._id } }
      );
    }
  } catch (error) {
    console.error('Error updating references after comment save:', error);
  }
});

// Create Comment model
const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment };