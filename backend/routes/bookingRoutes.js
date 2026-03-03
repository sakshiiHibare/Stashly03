const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiter for booking creation
const createBookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 booking creations per window
  message: {
    status: 'error',
    message: 'Too many booking requests, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const isRangeOverlap = (startA, endA, startB, endB) => {
  return startA <= endB && endA >= startB;
};

const getScopeQuery = ({ listingId, bookingType }) => {
  if (listingId) {
    return { listingId };
  }
  return { bookingType };
};

const getConflicts = async ({ listingId, bookingType, bookingStart, bookingEnd }) => {
  const scopeQuery = getScopeQuery({ listingId, bookingType });

  return Booking.find({
    ...scopeQuery,
    status: { $ne: 'cancelled' },
    startDate: { $lte: bookingEnd },
    endDate: { $gte: bookingStart }
  })
    .select('startDate endDate bookingType listingId')
    .sort({ startDate: 1 });
};

const getSuggestedSlot = async ({ listingId, bookingType, bookingStart, bookingEnd }) => {
  const scopeQuery = getScopeQuery({ listingId, bookingType });

  const allRelevantBookings = await Booking.find({
    ...scopeQuery,
    status: { $ne: 'cancelled' },
    endDate: { $gte: startOfDay(bookingStart) }
  })
    .select('startDate endDate')
    .sort({ startDate: 1 });

  const durationMs = bookingEnd.getTime() - bookingStart.getTime();
  let candidateStart = startOfDay(bookingStart);
  let candidateEnd = new Date(candidateStart.getTime() + durationMs);

  for (const existingBooking of allRelevantBookings) {
    const existingStart = new Date(existingBooking.startDate);
    const existingEnd = new Date(existingBooking.endDate);

    if (isRangeOverlap(candidateStart, candidateEnd, existingStart, existingEnd)) {
      candidateStart = addDays(startOfDay(existingEnd), 1);
      candidateEnd = new Date(candidateStart.getTime() + durationMs);
    }
  }

  return {
    startDate: candidateStart,
    endDate: candidateEnd
  };
};

// Middleware to check for listing/slot availability
const checkAvailability = async (req, res, next) => {
  try {
    const { listingId, bookingType, startDate, endDate } = req.body;
    
    if (!listingId && !bookingType) {
      return res.status(400).json({
        status: 'error',
        message: 'bookingType is required when listingId is not provided'
      });
    }

    if (!listingId && !['parking', 'storage'].includes(bookingType)) {
      return res.status(400).json({
        status: 'error',
        message: 'bookingType must be either parking or storage'
      });
    }

if (typeof listingId === 'string' && listingId.trim().length > 0) {
  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid listing ID format'
    });
  }
}

      // Check if listing exists
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({
          status: 'error',
          message: 'Listing not found'
        });
      }

      // Check if listing is available
      if (listing.status !== 'active') {
        return res.status(400).json({
          status: 'error',
          message: 'This listing is not currently available for booking'
        });
      }
    }

    // Validate and convert dates
    let bookingStart, bookingEnd;
    try {
      bookingStart = new Date(startDate);
      bookingEnd = new Date(endDate);
      
      if (isNaN(bookingStart.getTime()) || isNaN(bookingEnd.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format. Please use YYYY-MM-DD format.'
      });
    }

    // Check for booking conflicts
    const conflictingBookings = await getConflicts({
      listingId,
      bookingType,
      bookingStart,
      bookingEnd
    });

    if (conflictingBookings.length > 0) {
      const suggestedSlot = await getSuggestedSlot({
        listingId,
        bookingType,
        bookingStart,
        bookingEnd
      });

      return res.status(409).json({
        status: 'error',
        message: 'Selected slot is already booked',
        scheduleAfterCurrent: true,
        suggestedSlot,
        conflicts: conflictingBookings.map(booking => ({
          startDate: booking.startDate,
          endDate: booking.endDate
        }))
      });
    }

    // If all checks pass, continue
    next();
  } catch (err) {
    console.error('Availability check error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Server error checking availability'
    });
  }
};

// @route   GET /api/bookings/availability
// @desc    Check availability for parking/storage bookings and suggest next slot if booked
// @access  Public
router.get('/availability', async (req, res) => {
  try {
    const { listingId, bookingType, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'startDate and endDate are required'
      });
    }

    if (!listingId && !bookingType) {
      return res.status(400).json({
        status: 'error',
        message: 'bookingType is required when listingId is not provided'
      });
    }

    if (!listingId && !['parking', 'storage'].includes(bookingType)) {
      return res.status(400).json({
        status: 'error',
        message: 'bookingType must be either parking or storage'
      });
    }

    if (listingId) {
      if (!mongoose.Types.ObjectId.isValid(listingId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid listing ID format'
        });
      }

      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({
          status: 'error',
          message: 'Listing not found'
        });
      }

      if (listing.status !== 'active') {
        return res.json({
          status: 'success',
          available: false,
          availabilityStatus: 'unavailable',
          scheduleAfterCurrent: false,
          message: 'This listing is not currently available for booking',
          conflicts: [],
          suggestedSlot: null
        });
      }
    }

    const bookingStart = new Date(startDate);
    const bookingEnd = new Date(endDate);

    if (isNaN(bookingStart.getTime()) || isNaN(bookingEnd.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format. Please use YYYY-MM-DD format.'
      });
    }

    if (bookingEnd < bookingStart) {
      return res.status(400).json({
        status: 'error',
        message: 'endDate must be after or equal to startDate'
      });
    }

    const conflictingBookings = await getConflicts({
      listingId,
      bookingType,
      bookingStart,
      bookingEnd
    });

    if (conflictingBookings.length === 0) {
      return res.json({
        status: 'success',
        available: true,
        availabilityStatus: 'available',
        scheduleAfterCurrent: false,
        message: 'Slot available for selected dates',
        conflicts: [],
        suggestedSlot: null
      });
    }

    const suggestedSlot = await getSuggestedSlot({
      listingId,
      bookingType,
      bookingStart,
      bookingEnd
    });

    return res.json({
      status: 'success',
      available: false,
      availabilityStatus: 'booked',
      scheduleAfterCurrent: true,
      message: 'Slot already booked for selected dates',
      conflicts: conflictingBookings.map(booking => ({
        startDate: booking.startDate,
        endDate: booking.endDate
      })),
      suggestedSlot
    });
  } catch (err) {
    console.error('Availability endpoint error:', err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Server error checking availability'
    });
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Public (to allow non-logged in users to book)
router.post('/', createBookingLimiter, [
  // Common validation for all bookings
  check('name')
    .trim()
    .not().isEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
  check('email')
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Please enter a valid email address'),
    
  check('phone')
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
    
  check('startDate')
    .isISO8601().withMessage('Start date must be a valid date')
    .custom((value) => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
    
  check('endDate')
    .isISO8601().withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (endDate < startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
    
  check('bookingType')
    .isIn(['parking', 'storage']).withMessage('Booking type must be either parking or storage'),
  
  // Conditional validation based on booking type
  check('vehicleType')
    .if(check('bookingType').equals('parking'))
    .not().isEmpty().withMessage('Vehicle type is required for parking bookings')
    .isLength({ min: 2, max: 50 }).withMessage('Vehicle type must be between 2 and 50 characters'),
    
  check('licenseNumber')
    .if(check('bookingType').equals('parking'))
    .not().isEmpty().withMessage('License number is required for parking bookings')
    .isLength({ min: 2, max: 20 }).withMessage('License number must be between 2 and 20 characters'),
    
  check('storageType')
    .if(check('bookingType').equals('storage'))
    .not().isEmpty().withMessage('Storage type is required for storage bookings')
    .isLength({ min: 2, max: 50 }).withMessage('Storage type must be between 2 and 50 characters'),
    
  check('spaceSize')
    .if(check('bookingType').equals('storage'))
    .isNumeric().withMessage('Space size must be a number')
    .isInt({ min: 1 }).withMessage('Space size must be at least 1 sq.ft'),
    
  // Optional listing ID validation
  check('listingId')
    .optional()
    .isMongoId().withMessage('Invalid listing ID format')
], checkAvailability, async (req, res) => {
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

    const { 
      name, 
      email, 
      phone, 
      startDate, 
      endDate, 
      notes,
      bookingType,
      // Parking specific fields
      vehicleType,
      licenseNumber,
      vehicleColor,
      // Storage specific fields
      storageType,
      spaceSize,
      itemsDescription,
      // Optional listing reference
      listingId
    } = req.body;

    // Create booking with the appropriate fields based on type
    const booking = new Booking({
      name,
      email,
      phone,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes,
      bookingType,
      // Set fields based on booking type
      ...(bookingType === 'parking' && {
        vehicleType,
        licenseNumber,
        vehicleColor: vehicleColor || ''
      }),
      ...(bookingType === 'storage' && {
        storageType,
        spaceSize,
        itemsDescription: itemsDescription || ''
      }),
      // If a listing ID was provided, reference it
      ...(listingId && { listingId })
    });

    await booking.save();

    // Return success with limited booking details for security
    res.status(201).json({ 
      status: 'success',
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        name: booking.name,
        email: booking.email,
        startDate: booking.startDate,
        endDate: booking.endDate,
        bookingType: booking.bookingType,
        status: booking.status
      }
    });
  } catch (err) {
    console.error('Booking creation error:', err.message);
    
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
      message: 'Server error creating booking'
    });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin only)
// @access  Private/Admin
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filtering
    const filter = {};
    if (req.query.bookingType) {
      filter.bookingType = req.query.bookingType;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.email) {
      filter.email = { $regex: new RegExp(req.query.email, 'i') };
    }
    
    // Date range filtering
    if (req.query.fromDate || req.query.toDate) {
      filter.startDate = {};
      if (req.query.fromDate) {
        filter.startDate.$gte = new Date(req.query.fromDate);
      }
      if (req.query.toDate) {
        filter.endDate = { $lte: new Date(req.query.toDate) };
      }
    }
    
    // Sorting
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by creation date, newest first
    }
    
    // Execute query with pagination and select specific fields for efficiency
    const bookings = await Booking.find(filter)
      .select('name email phone bookingType startDate endDate status paymentStatus createdAt listingId')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('listingId', 'title location price.amount'); // Populate listing details if available
    
    // Get total count for pagination
    const total = await Booking.countDocuments(filter);
    
    res.json({
      status: 'success',
      results: bookings.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalBookings: total,
      bookings
    });
  } catch (err) {
    console.error('Get bookings error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error while retrieving bookings'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get a booking by ID
// @access  Private (admin or booking owner)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid booking ID format'
      });
    }
    
    const booking = await Booking.findById(req.params.id)
      .populate('listingId', 'title location price.amount');
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized (admin or booking owner by email)
    const isAdmin = req.user.role === 'admin';
    const isOwner = booking.email === req.user.email;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this booking'
      });
    }
    
    res.json({
      status: 'success',
      booking
    });
  } catch (err) {
    console.error('Get booking error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error retrieving booking'
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update a booking (admin only)
// @access  Private/Admin
router.put('/:id', authenticateToken, authorizeRole('admin'), [
  // Only allow updating certain fields
  check('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled']).withMessage('Invalid status value'),
  check('paymentStatus')
    .optional()
    .isIn(['unpaid', 'paid', 'refunded']).withMessage('Invalid payment status value'),
  check('notes')
    .optional()
    .trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid booking ID format'
      });
    }
    
    // Extract allowed fields for update
    const { status, paymentStatus, notes } = req.body;
    
    // Build update object with only provided fields
    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus;
    if (notes !== undefined) updateFields.notes = notes;
    
    // Add updated timestamp
    updateFields.updatedAt = Date.now();
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Booking updated successfully',
      booking
    });
  } catch (err) {
    console.error('Update booking error:', err.message);
    
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
      message: 'Server error updating booking'
    });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking (admin or booking owner)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid booking ID format'
      });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized (admin or booking owner by email)
    const isAdmin = req.user.role === 'admin';
    const isOwner = booking.email === req.user.email;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking can be cancelled (e.g., not too close to start date)
    const today = new Date();
    const bookingStart = new Date(booking.startDate);
    const daysTillBooking = Math.ceil((bookingStart - today) / (1000 * 60 * 60 * 24));
    
    if (!isAdmin && daysTillBooking < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Bookings can only be cancelled at least 24 hours before the start date'
      });
    }
    
    // Don't actually delete, just mark as cancelled
    booking.status = 'cancelled';
    booking.updatedAt = Date.now();
    await booking.save();
    
    res.json({
      status: 'success',
      message: 'Booking cancelled successfully'
    });
  } catch (err) {
    console.error('Cancel booking error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error cancelling booking'
    });
  }
});

// @route   GET /api/bookings/user/me
// @desc    Get bookings for current user
// @access  Private
router.get('/user/me', authenticateToken, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    
    // Filtering by status if provided
    const filter = { email: req.user.email };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const bookings = await Booking.find(filter)
      .select('bookingType startDate endDate status paymentStatus createdAt listingId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('listingId', 'title location price.amount');
    
    // Get total count for pagination
    const total = await Booking.countDocuments(filter);
    
    res.json({
      status: 'success',
      results: bookings.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalBookings: total,
      bookings
    });
  } catch (err) {
    console.error('Get user bookings error:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server error retrieving your bookings'
    });
  }
});

module.exports = router; 
