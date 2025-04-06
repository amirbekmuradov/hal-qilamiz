const { getAuth } = require('../config/firebase');
const { User, UserRole } = require('../models/User');
const { Region } = require('../models/Region');

// Register new user
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, regionId, firebaseUid } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { phone },
        { firebaseUid }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Validate region
    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(400).json({ message: 'Invalid region' });
    }
    
    // Create new user
    const newUser = new User({
      firebaseUid,
      firstName,
      lastName,
      email,
      phone,
      region: regionId,
      isEmailVerified: req.user?.emailVerified || false, // From Firebase token
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = newUser.generateAuthToken();
    
    // Get user data without sensitive information
    const userData = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      region: {
        id: region._id,
        name: region.name,
      },
      role: newUser.role,
      trustScore: newUser.trustScore,
      badges: newUser.badges,
      isVerified: newUser.isVerified,
      isPhoneVerified: newUser.isPhoneVerified,
      isEmailVerified: newUser.isEmailVerified,
      createdAt: newUser.createdAt,
    };
    
    res.status(201).json({
      user: userData,
      token,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    
    // Find user by Firebase UID
    const user = await User.findOne({ firebaseUid }).populate('region', 'name code');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save();
    
    // Generate JWT token
    const token = user.generateAuthToken();
    
    // Get user data without sensitive information
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      region: {
        id: user.region._id,
        name: user.region.name,
      },
      role: user.role,
      trustScore: user.trustScore,
      badges: user.badges,
      isVerified: user.isVerified,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
    };
    
    res.status(200).json({
      user: userData,
      token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('region', 'name code');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user data without sensitive information
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      region: {
        id: user.region._id,
        name: user.region.name,
      },
      role: user.role,
      trustScore: user.trustScore,
      badges: user.badges,
      isVerified: user.isVerified,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
      profilePictureUrl: user.profilePictureUrl,
      bio: user.bio,
      organization: user.organization,
      position: user.position,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    };
    
    res.status(200).json({ user: userData });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send phone verification code
const sendPhoneVerification = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // In a real implementation, you would integrate with an SMS service like Twilio
    // For now, we'll simulate sending a verification code
    
    // Generate a random 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app, send the code via SMS
    console.log(`Sending verification code ${verificationCode} to ${phone}`);
    
    // Store the code in the session or database
    // In a production app, you'd want to store this securely, possibly encrypted
    // and with an expiration time
    
    res.status(200).json({ 
      message: 'Verification code sent',
      // For demo purposes only, don't do this in production!
      code: verificationCode,
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify phone code
const verifyPhoneCode = async (req, res) => {
  try {
    const { code, phone } = req.body;
    
    // In a real implementation, you would verify the code against what was sent
    // For now, we'll accept any 6-digit code for demo purposes
    
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Update user's phone verification status
    await User.findByIdAndUpdate(req.user._id, { 
      isPhoneVerified: true,
      // Set overall verification status if both phone and email are verified
      $set: { 
        isVerified: req.user.isEmailVerified 
      }
    });
    
    res.status(200).json({ message: 'Phone verified successfully' });
  } catch (error) {
    console.error('Error verifying phone:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  sendPhoneVerification,
  verifyPhoneCode,
};