const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define user roles
const UserRole = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  OFFICIAL: 'official', // Government representatives
};

// Define badge types
const BadgeType = {
  COMMUNITY_HERO: 'Community Hero',
  REGIONAL_ADVOCATE: 'Regional Advocate',
  ISSUE_SOLVER: 'Issue Solver',
  ACTIVE_VOTER: 'Active Voter',
  VERIFIED_RESIDENT: 'Verified Resident',
};

// User schema
const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    trustScore: {
      type: Number,
      default: 0,
    },
    badges: [{
      type: String,
      enum: Object.values(BadgeType),
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isIdVerified: {
      type: Boolean,
      default: false,
    },
    profilePictureUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    organization: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      default: '',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    issuesCreated: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
    }],
    issuesVotedOn: [{
      issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
      },
      priority: {
        type: String,
        enum: ['Important', 'Very Important', 'Urgent'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    issuesSubscribed: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
    }],
    commentsPosted: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    }],
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for user statistics
userSchema.virtual('statistics').get(function() {
  return {
    issuesCreated: this.issuesCreated.length,
    issuesVotedOn: this.issuesVotedOn.length,
    commentsPosted: this.commentsPosted.length,
    totalActivity: this.issuesCreated.length + this.issuesVotedOn.length + this.commentsPosted.length,
  };
});

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      firebaseUid: this.firebaseUid,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Update lastActive timestamp
userSchema.methods.updateActivity = async function() {
  this.lastActive = Date.now();
  await this.save();
};

// Calculate trust score based on user activity and verification
userSchema.methods.calculateTrustScore = async function() {
  let score = 0;
  
  // Base score for verified accounts
  if (this.isEmailVerified) score += 10;
  if (this.isPhoneVerified) score += 15;
  if (this.isIdVerified) score += 25;
  
  // Activity score
  score += Math.min(this.issuesCreated.length * 2, 20); // Up to 20 points for creating issues
  score += Math.min(this.commentsPosted.length * 0.5, 15); // Up to 15 points for comments
  score += Math.min(this.issuesVotedOn.length * 0.2, 10); // Up to 10 points for voting
  
  // Account age (in days)
  const accountAge = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  score += Math.min(accountAge * 0.1, 10); // Up to 10 points for account age
  
  // Badges
  score += this.badges.length * 5; // 5 points per badge
  
  // Update trust score
  this.trustScore = Math.min(Math.round(score), 100); // Max 100 points
  await this.save();
  
  return this.trustScore;
};

// Create User model
const User = mongoose.model('User', userSchema);

module.exports = { User, UserRole, BadgeType };