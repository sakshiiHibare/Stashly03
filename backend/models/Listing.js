const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  listingType: {
    type: String,
    enum: {
      values: ['parking', 'storage'],
      message: '{VALUE} is not a valid listing type'
    },
    required: [true, 'Listing type is required']
  },
  
  // Storage-specific fields
  storageType: {
    type: String,
    enum: ['garage', 'basement', 'attic', 'shed', 'warehouse', 'other'],
    required: function() { return this.listingType === 'storage'; }
  },
  spaceSize: {
    type: Number,
    min: [1, 'Space size must be at least 1 sq.ft'],
    required: function() { return this.listingType === 'storage'; }
  },
  storageAmenities: [{
    type: String,
    enum: ['climate_control', 'security_camera', '24_7_access', 'dry_space', 'loading_dock', 'secure_access']
  }],
  
  // Parking-specific fields
  parkingType: {
    type: String,
    enum: ['garage', 'driveway', 'lot', 'street', 'underground', 'other'],
    required: function() { return this.listingType === 'parking'; }
  },
  vehicleTypes: [{
    type: String,
    enum: ['car', 'motorcycle', 'truck', 'rv', 'boat', 'other']
  }],
  parkingAmenities: [{
    type: String,
    enum: ['covered', 'security_camera', '24_7_access', 'gated', 'valet', 'charging_station']
  }],
  
  // Common fields
  price: {
    amount: {
      type: Number,
      required: [true, 'Price amount is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    interval: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      default: 'monthly'
    }
  },
  images: [{
    url: String,
    caption: String
  }],
  availabilityCalendar: [{
    date: Date,
    isAvailable: Boolean
  }],
  
  // Owner information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner reference is required']
  },
  
  // Status and verification
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'pending_verification'],
    default: 'pending_verification'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Average rating based on reviews
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
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
listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for faster queries
listingSchema.index({ 'location.city': 1, 'location.state': 1, 'location.zipCode': 1 });
listingSchema.index({ listingType: 1 });
listingSchema.index({ 'price.amount': 1 });
listingSchema.index({ owner: 1 });
listingSchema.index({ status: 1 });

// Geospatial index for location-based queries
listingSchema.index({ 'location.coordinates': '2dsphere' });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing; 