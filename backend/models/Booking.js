const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Common fields for all bookings
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  notes: {
    type: String,
    trim: true
  },
  bookingType: {
    type: String,
    enum: {
      values: ['parking', 'storage'],
      message: '{VALUE} is not a valid booking type'
    },
    required: [true, 'Booking type is required']
  },
  
  // Fields for storage bookings
  storageType: {
    type: String,
    trim: true,
    required: function() { return this.bookingType === 'storage'; }
  },
  spaceSize: {
    type: Number,
    min: [1, 'Space size must be at least 1 sq.ft'],
    required: function() { return this.bookingType === 'storage'; }
  },
  itemsDescription: {
    type: String,
    trim: true
  },
  
  // Fields for parking bookings
  vehicleType: {
    type: String,
    trim: true,
    required: function() { return this.bookingType === 'parking'; }
  },
  licenseNumber: {
    type: String,
    trim: true,
    required: function() { return this.bookingType === 'parking'; }
  },
  vehicleColor: {
    type: String,
    trim: true
  },
  
  // Reference to the listing (either storage or parking)
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  
  // Payment tracking
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt field
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
bookingSchema.index({ email: 1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 