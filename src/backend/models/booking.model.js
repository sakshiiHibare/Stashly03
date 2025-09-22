const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to either Storage or Parking (polymorphic)
  spaceType: {
    type: String,
    enum: ['storage', 'parking'],
    required: true
  },
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // This is polymorphic - could be a Storage or Parking id
    refPath: 'spaceType'
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  totalDays: {
    type: Number,
    required: true
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'netbanking', 'wallet', 'other'],
    default: 'credit_card'
  },
  transactionId: {
    type: String
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  cancellationReason: {
    type: String
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
  timestamps: true
});

// Calculate values before saving
bookingSchema.pre('save', function(next) {
  // Calculate total days
  if (this.startDate && this.endDate) {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.totalDays = diffDays;
    
    // Calculate total price
    this.totalPrice = this.pricePerDay * this.totalDays;
  }
  
  next();
});

// Index for faster booking searches
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ host: 1, status: 1 });
bookingSchema.index({ spaceId: 1, startDate: 1, endDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 