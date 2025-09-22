const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'airattix_jwt_secret');
    
    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. User not found.'
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
    
  } catch (err) {
    console.error('Authentication error:', err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired.'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error during authentication.'
    });
  }
};

/**
 * Middleware for role-based authorization
 * @param {string} role - Required role to access the resource
 */
const authorizeRole = (role) => {
  return (req, res, next) => {
    // Must be used after authenticateToken
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.'
      });
    }
    
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. ${role} role required.`
      });
    }
    
    next();
  };
};

module.exports = { authenticateToken, authorizeRole }; 