const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Storage space title is required'],
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
    required: [true, 'Storage type is required'],
    enum: ['garage', 'basement', 'attic', 'shed', 'warehouse', 'other'],
    default: 'other'
  },
  size: {
    // Size in square feet
    width: {
      type: Number,
      required: [true, 'Width is required']
    },
    length: {
      type: Number,
      required: [true, 'Length is required']
    },
    height: {
      type: Number,
      required: [true, 'Height is required']
    }
  },
  features: {
    isClimate: {
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
    }
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
      enum: ['daily', 'weekly', 'monthly'],
      default: 'monthly'
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
storageSchema.virtual('totalSize').get(function() {
  return this.size.width * this.size.length;
});

// Index for location-based searches
storageSchema.index({ 'address.location': '2dsphere' });

const Storage = mongoose.model('Storage', storageSchema);

module.exports = Storage; 