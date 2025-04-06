const jwt = require('jsonwebtoken');
const { getAuth } = require('../config/firebase');
const { User, UserRole } = require('../models/User');

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Add user data to request
    req.user = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };
    
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user in database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add user data to request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Error authenticating token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin role:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user is moderator or admin
const isModerator = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (req.user.role !== UserRole.MODERATOR && req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Access denied. Moderator role required.' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking moderator role:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user is an official representative
const isOfficial = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (req.user.role !== UserRole.OFFICIAL && req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Access denied. Official role required.' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking official role:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user is verified
const isVerified = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!req.user.isVerified) {
      return res.status(403).json({ message: 'Account not verified. Please verify your account.' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking verification status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user can modify an issue
const canModifyIssue = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { Issue } = require('../models/Issue');
    const issueId = req.params.id;
    
    const issue = await Issue.findById(issueId);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // Check if user is the author of the issue
    const isAuthor = issue.author.toString() === req.user._id.toString();
    
    // Check if user has admin/moderator/official role
    const hasPrivilegeRole = [
      UserRole.ADMIN,
      UserRole.MODERATOR,
      UserRole.OFFICIAL,
    ].includes(req.user.role);
    
    if (!isAuthor && !hasPrivilegeRole) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to modify this issue.' });
    }
    
    // Add issue to request for convenience
    req.issue = issue;
    
    next();
  } catch (error) {
    console.error('Error checking issue modification permission:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyFirebaseToken,
  authenticateToken,
  isAdmin,
  isModerator,
  isOfficial,
  isVerified,
  canModifyIssue,
};