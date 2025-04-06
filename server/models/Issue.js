const mongoose = require('mongoose');

// Define issue priority levels
const IssuePriority = {
  IMPORTANT: 'Important',
  VERY_IMPORTANT: 'Very Important',
  URGENT: 'Urgent',
};

// Define issue status types
const IssueStatus = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

// Resolution step schema
const resolutionStepSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  date: {
    type: Date,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Issue schema
const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 20,
  },
  location: {
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
    },
    isNationwide: {
      type: Boolean,
      default: false,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  status: {
    type: String,
    enum: Object.values(IssueStatus),
    default: IssueStatus.PENDING,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  votes: {
    [IssuePriority.IMPORTANT]: {
      type: Number,
      default: 0,
    },
    [IssuePriority.VERY_IMPORTANT]: {
      type: Number,
      default: 0,
    },
    [IssuePriority.URGENT]: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    users: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      priority: {
        type: String,
        enum: Object.values(IssuePriority),
      },
    }],
  },
  mediaUrls: [{
    type: String,
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  responseTimeExpected: {
    type: Date,
  },
  isEscalated: {
    type: Boolean,
    default: false,
  },
  resolutionSteps: [resolutionStepSchema],
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for searching
issueSchema.index({ title: 'text', description: 'text' });

// Calculate expected response time based on votes
issueSchema.methods.calculateResponseTime = function() {
  let days = 7; // Default: 7 days for response
  
  // Adjust based on priority votes
  if (this.votes[IssuePriority.URGENT] > this.votes.total * 0.5) {
    days = 1; // 1 day for urgent issues (if >50% urgent votes)
  } else if (this.votes[IssuePriority.VERY_IMPORTANT] > this.votes.total * 0.5) {
    days = 3; // 3 days for very important issues
  } else if (this.votes[IssuePriority.IMPORTANT] > this.votes.total * 0.5) {
    days = 5; // 5 days for important issues
  }
  
  // Adjust based on total votes volume
  if (this.votes.total > 100) {
    days = Math.max(days - 1, 1); // Reduce by 1 day, minimum 1 day
  }
  if (this.votes.total > 500) {
    days = Math.max(days - 1, 1); // Reduce by another day
  }
  
  // Set expected response time
  this.responseTimeExpected = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  
  return this.responseTimeExpected;
};

// Check if issue should be escalated (beyond response time)
issueSchema.methods.checkEscalation = function() {
  if (
    this.status !== IssueStatus.RESOLVED &&
    this.responseTimeExpected &&
    new Date() > this.responseTimeExpected
  ) {
    this.isEscalated = true;
  }
  
  return this.isEscalated;
};

// Create Issue model
const Issue = mongoose.model('Issue', issueSchema);

module.exports = { Issue, IssuePriority, IssueStatus };