const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Parking space title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Parking type is required'],
    enum: ['garage', 'driveway', 'street', 'underground', 'lot', 'other'],
    default: 'driveway'
  },
  size: {
    // Dimensions for the parking space
    width: {
      type: Number,
      required: [true, 'Width is required']
    },
    length: {
      type: Number,
      required: [true, 'Length is required']
    }
  },
  features: {
    isCovered: {
      type: Boolean,
      default: false
    },
    isSecure: {
      type: Boolean,
      default: false
    },
    hasElectricity: {
      type: Boolean,
      default: false
    },
    has24HrAccess: {
      type: Boolean,
      default: false
    },
    hasGate: {
      type: Boolean,
      default: false
    },
    hasSecurity: {
      type: Boolean,
      default: false
    },
    hasCharging: {
      type: Boolean,
      default: false
    }
  },
  vehicleTypes: {
    type: [String],
    enum: ['car', 'motorcycle', 'truck', 'rv', 'boat', 'other'],
    default: ['car']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'India'
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    }
  },
  pricing: {
    rate: {
      type: Number,
      required: [true, 'Rate is required']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    billingCycle: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      default: 'daily'
    }
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    availableDays: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true }
    },
    availableHours: {
      start: { type: String, default: '00:00' },
      end: { type: String, default: '23:59' }
    }
  },
  averageRating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for total square footage
parkingSchema.virtual('totalSize').get(function() {
  return this.size.width * this.size.length;
});

// Index for location-based searches
parkingSchema.index({ 'address.location': '2dsphere' });

const Parking = mongoose.model('Parking', parkingSchema);

module.exports = Parking; 