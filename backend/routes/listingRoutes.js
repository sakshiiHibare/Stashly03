const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private
router.post('/', authenticateToken, [
  // Common validation for all listings
  check('title')
    .trim()
    .not().isEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    
  check('description')
    .trim()
    .not().isEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
    
  check('location.address')
    .trim()
    .not().isEmpty().withMessage('Address is required'),
    
  check('location.city')
    .trim()
    .not().isEmpty().withMessage('City is required'),
    
  check('location.state')
    .trim()
    .not().isEmpty().withMessage('State is required'),
    
  check('location.zipCode')
    .trim()
    .not().isEmpty().withMessage('Zip code is required')
    .matches(/^\d{6}$/).withMessage('Zip code must be 6 digits'),
    
  check('listingType')
    .isIn(['parking', 'storage']).withMessage('Listing type must be either parking or storage'),
    
  check('price.amount')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative'),
    
  check('price.interval')
    .isIn(['hourly', 'daily', 'weekly', 'monthly']).withMessage('Invalid price interval'),
    
  // Conditional validation based on listing type
  check('storageType')
    .if(check('listingType').equals('storage'))
    .isIn(['garage', 'basement', 'attic', 'shed', 'warehouse', 'other']).withMessage('Invalid storage type'),
    
  check('spaceSize')
    .if(check('listingType').equals('storage'))
    .isNumeric().withMessage('Space size must be a number')
    .isFloat({ min: 1 }).withMessage('Space size must be at least 1 sq.ft'),
    
  check('parkingType')
    .if(check('listingType').equals('parking'))
    .isIn(['garage', 'driveway', 'lot', 'street', 'underground', 'other']).withMessage('Invalid parking type')
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

    // Create new listing with owner reference
    const newListing = new Listing({
      ...req.body,
      owner: req.user._id,
      status: 'pending_verification' // All new listings require verification
    });

    await newListing.save();

    res.status(201).json({
      status: 'success',
      message: 'Listing created successfully and pending verification',
      listing: {
        id: newListing._id,
        title: newListing.title,
        listingType: newListing.listingType,
        status: newListing.status
      }
    });
  } catch (err) {
    console.error('Create listing error:', err.message);
    
    // Handle validation errors from Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => ({
        param: error.path,
        msg: error.message
      }));
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error creating listing'
    });
  }
});

// @route   GET /api/listings
// @desc    Get all active listings with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { status: 'active' }; // Only return active listings
    
    // Filter by listing type
    if (req.query.type && ['parking', 'storage'].includes(req.query.type)) {
      filter.listingType = req.query.type;
    }
    
    // Filter by location
    if (req.query.city) {
      filter['location.city'] = { $regex: new RegExp(req.query.city, 'i') };
    }
    
    if (req.query.state) {
      filter['location.state'] = { $regex: new RegExp(req.query.state, 'i') };
    }
    
    if (req.query.zipCode) {
      filter['location.zipCode'] = req.query.zipCode;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter['price.amount'] = {};
      if (req.query.minPrice) {
        filter['price.amount'].$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter['price.amount'].$lte = parseFloat(req.query.maxPrice);
      }
    }
    
    // Filter by amenities
    if (req.query.amenities) {
      const amenities = req.query.amenities.split(',');
      if (req.query.type === 'storage') {
        filter.storageAmenities = { $in: amenities };
      } else if (req.query.type === 'parking') {
        filter.parkingAmenities = { $in: amenities };
      }
    }
    
    // Sorting
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      // Default sort by creation date, newest first
      sort.createdAt = -1;
    }
    
    // Select fields to return (exclude sensitive information)
    const selectedFields = 'title description location listingType storageType parkingType spaceSize price images averageRating reviewCount createdAt';
    
    // Execute query with pagination
    const listings = await Listing.find(filter)
      .select(selectedFields)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Listing.countDocuments(filter);
    
    res.json({
      status: 'success',
      results: listings.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalListings: total,
      listings
    });
  } catch (err) {
    console.error('Get listings error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving listings'
    });
  }
});

// @route   GET /api/listings/:id
// @desc    Get a listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid listing ID format'
      });
    }
    
    const listing = await Listing.findOne({
      _id: req.params.id,
      status: 'active' // Only return active listings
    }).select('-owner -__v');
    
    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found or not active'
      });
    }
    
    res.json({
      status: 'success',
      listing
    });
  } catch (err) {
    console.error('Get listing error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving listing'
    });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private (owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid listing ID format'
      });
    }
    
    // Find listing and check ownership
    let listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }
    
    // Check if user is the owner
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this listing'
      });
    }
    
    // If trying to update listing type, prevent it
    if (req.body.listingType && req.body.listingType !== listing.listingType) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot change the listing type. Please create a new listing instead.'
      });
    }
    
    // Fields that can be updated
    const allowedUpdates = [
      'title', 'description', 'location', 'price',
      'storageType', 'spaceSize', 'storageAmenities',
      'parkingType', 'vehicleTypes', 'parkingAmenities',
      'images', 'availabilityCalendar', 'status'
    ];
    
    // Admin-only fields
    const adminOnlyUpdates = ['status', 'isVerified'];
    
    // Filter out fields that are not allowed to be updated
    const updates = {};
    Object.keys(req.body).forEach(key => {
      // Check if this is an admin-only field
      if (adminOnlyUpdates.includes(key) && req.user.role !== 'admin') {
        return;
      }
      
      // Check if this is an allowed field
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    // If significant changes were made, reset verification status
    const significantFields = [
      'title', 'description', 'location', 'price',
      'storageType', 'parkingType', 'spaceSize'
    ];
    
    const hasSignificantChanges = Object.keys(updates).some(key => 
      significantFields.includes(key));
    
    if (hasSignificantChanges && req.user.role !== 'admin') {
      updates.status = 'pending_verification';
      updates.isVerified = false;
    }
    
    // Set updated timestamp
    updates.updatedAt = Date.now();
    
    // Update the listing
    listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    res.json({
      status: 'success',
      message: hasSignificantChanges && req.user.role !== 'admin'
        ? 'Listing updated successfully and pending verification'
        : 'Listing updated successfully',
      listing: {
        id: listing._id,
        title: listing.title,
        status: listing.status,
        isVerified: listing.isVerified
      }
    });
  } catch (err) {
    console.error('Update listing error:', err.message);
    
    // Handle validation errors from Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => ({
        param: error.path,
        msg: error.message
      }));
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server error updating listing'
    });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private (owner or admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid listing ID format'
      });
    }
    
    // Find listing
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }
    
    // Check if user is the owner or admin
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this listing'
      });
    }
    
    // Check if there are active bookings for this listing
    const Booking = require('../models/Booking');
    const activeBookings = await Booking.countDocuments({
      listingId: req.params.id,
      status: { $ne: 'cancelled' },
      endDate: { $gte: new Date() }
    });
    
    if (activeBookings > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete listing with active bookings. Please cancel all bookings first.'
      });
    }
    
    await listing.remove();
    
    res.json({
      status: 'success',
      message: 'Listing deleted successfully'
    });
  } catch (err) {
    console.error('Delete listing error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Server error deleting listing'
    });
  }
});

// @route   GET /api/listings/user/me
// @desc    Get listings for current user
// @access  Private
router.get('/user/me', authenticateToken, async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      count: listings.length,
      listings
    });
  } catch (err) {
    console.error('Get user listings error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving your listings'
    });
  }
});

// @route   PUT /api/listings/:id/verify
// @desc    Verify a listing (admin only)
// @access  Private/Admin
router.put('/:id/verify', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid listing ID format'
      });
    }
    
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        status: 'error',
        message: 'Listing not found'
      });
    }
    
    listing.isVerified = true;
    listing.status = 'active';
    listing.updatedAt = Date.now();
    
    await listing.save();
    
    res.json({
      status: 'success',
      message: 'Listing verified successfully',
      listing: {
        id: listing._id,
        title: listing.title,
        status: listing.status,
        isVerified: listing.isVerified
      }
    });
  } catch (err) {
    console.error('Verify listing error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Server error verifying listing'
    });
  }
});

// @route   GET /api/listings/pending
// @desc    Get all pending listings (admin only)
// @access  Private/Admin
router.get('/status/pending', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'pending_verification' })
      .sort({ createdAt: 1 }) // Oldest first
      .populate('owner', 'name email');
    
    res.json({
      status: 'success',
      count: listings.length,
      listings
    });
  } catch (err) {
    console.error('Get pending listings error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving pending listings'
    });
  }
});

module.exports = router; 