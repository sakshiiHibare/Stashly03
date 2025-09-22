const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: { 
    status: 'error',
    message: 'Too many login attempts, please try again after 15 minutes' 
  }
});

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  // Input validation using express-validator
  check('username')
    .not().isEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  check('email')
    .isEmail().withMessage('Please enter a valid email address'),
  check('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain a number'),
  check('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, email, firstName, lastName, phone, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      if (user.email === email) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Email is already registered' 
        });
      } else {
        return res.status(400).json({ 
          status: 'error',
          message: 'Username is already taken' 
        });
      }
    }

    // Create new user
    user = new User({
      username,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      password // Will be hashed in the pre-save middleware
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();

    // Save user
    await user.save();

    // TODO: Send verification email
    // For now, we'll just log the token
    console.log(`Verification token for ${email}: ${verificationToken}`);

    // Create JWT token (for auto-login after registration)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      status: 'success',
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, [
  check('email').isEmail().withMessage('Please enter a valid email address'),
  check('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email and explicitly select password
    const user = await User.findOne({ email }).select('+password');
    
    // User doesn't exist
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(401).json({
        status: 'error',
        message: `Account locked. Try again in ${remainingTime} minutes`
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Handle failed login
      await user.handleFailedLogin();
      
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    res.json({
      status: 'success',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        profileImage: user.profileImage,
        address: user.address,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, [
  check('firstName').optional().trim(),
  check('lastName').optional().trim(),
  check('phone')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  check('address').optional(),
  check('preferences').optional()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    // Extract allowed fields for update
    const { firstName, lastName, phone, address, preferences } = req.body;
    
    // Build update object with only provided fields
    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (preferences !== undefined) updateFields.preferences = preferences;
    
    // Add updated timestamp
    updateFields.updatedAt = Date.now();

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        address: user.address,
        preferences: user.preferences
      }
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error while updating profile'
    });
  }
});

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, [
  check('currentPassword').exists().withMessage('Current password is required'),
  check('newPassword')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    .matches(/\d/).withMessage('New password must contain a number'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Find user and include password
    const user = await User.findById(req.user.userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Password change error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error while changing password'
    });
  }
});

// @route   POST /api/users/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', [
  check('email').isEmail().withMessage('Please enter a valid email address')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    // Don't reveal if user exists
    if (!user) {
      return res.json({
        status: 'success',
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send reset email
    // For now, we'll just log the token
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.json({
      status: 'success',
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error during password reset request'
    });
  }
});

// Admin routes

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    
    res.json({
      status: 'success',
      count: users.length,
      users
    });
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error while fetching users'
    });
  }
});

module.exports = router; 