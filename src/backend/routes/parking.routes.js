const express = require('express');
const router = express.Router();
const Parking = require('../models/parking.model');
const Booking = require('../models/booking.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   GET /api/parking
// @desc    Get all parking spaces
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice, vehicleType, features } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (type) filter.type = type;
    
    if (minPrice || maxPrice) {
      filter.pricing = {};
      if (minPrice) filter.pricing.rate = { $gte: Number(minPrice) };
      if (maxPrice) filter.pricing.rate = { ...filter.pricing.rate, $lte: Number(maxPrice) };
    }
    
    if (vehicleType) {
      filter.vehicleTypes = vehicleType;
    }
    
    if (features) {
      const featuresList = features.split(',');
      featuresList.forEach(feature => {
        if (feature === 'covered') filter['features.isCovered'] = true;
        if (feature === 'secure') filter['features.isSecure'] = true;
        if (feature === 'electricity') filter['features.hasElectricity'] = true;
        if (feature === '24hr') filter['features.has24HrAccess'] = true;
        if (feature === 'gate') filter['features.hasGate'] = true;
        if (feature === 'security') filter['features.hasSecurity'] = true;
        if (feature === 'charging') filter['features.hasCharging'] = true;
      });
    }
    
    // Find parking spaces with filters
    const parkingSpaces = await Parking.find(filter)
      .populate('owner', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 });
    
    res.json(parkingSpaces);
  } catch (error) {
    console.error('Get parking spaces error:', error);
    res.status(500).json({ message: 'Server error fetching parking spaces', error: error.message });
  }
});

// @route   GET /api/parking/:id
// @desc    Get parking space by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const parkingSpace = await Parking.findById(req.params.id)
      .populate('owner', 'username firstName lastName profileImage');
    
    if (!parkingSpace) {
      return res.status(404).json({ message: 'Parking space not found' });
    }
    
    res.json(parkingSpace);
  } catch (error) {
    console.error('Get parking space error:', error);
    res.status(500).json({ message: 'Server error fetching parking space', error: error.message });
  }
});

// @route   POST /api/parking
// @desc    Create a parking space
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      size,
      features,
      vehicleTypes,
      address,
      pricing,
      images,
      availability
    } = req.body;
    
    const parkingSpace = new Parking({
      owner: req.user.id,
      title,
      description,
      type,
      size,
      features,
      vehicleTypes,
      address,
      pricing,
      images,
      availability
    });
    
    const createdParking = await parkingSpace.save();
    
    res.status(201).json(createdParking);
  } catch (error) {
    console.error('Create parking space error:', error);
    res.status(500).json({ message: 'Server error creating parking space', error: error.message });
  }
});

// @route   PUT /api/parking/:id
// @desc    Update a parking space
// @access  Private (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const parkingSpace = await Parking.findById(req.params.id);
    
    if (!parkingSpace) {
      return res.status(404).json({ message: 'Parking space not found' });
    }
    
    // Check ownership
    if (parkingSpace.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this parking space' });
    }
    
    const {
      title,
      description,
      type,
      size,
      features,
      vehicleTypes,
      address,
      pricing,
      images,
      availability
    } = req.body;
    
    // Update parking space
    parkingSpace.title = title || parkingSpace.title;
    parkingSpace.description = description || parkingSpace.description;
    parkingSpace.type = type || parkingSpace.type;
    parkingSpace.size = size || parkingSpace.size;
    parkingSpace.features = features || parkingSpace.features;
    parkingSpace.vehicleTypes = vehicleTypes || parkingSpace.vehicleTypes;
    parkingSpace.address = address || parkingSpace.address;
    parkingSpace.pricing = pricing || parkingSpace.pricing;
    parkingSpace.images = images || parkingSpace.images;
    parkingSpace.availability = availability || parkingSpace.availability;
    
    const updatedParking = await parkingSpace.save();
    
    res.json(updatedParking);
  } catch (error) {
    console.error('Update parking space error:', error);
    res.status(500).json({ message: 'Server error updating parking space', error: error.message });
  }
});

// @route   DELETE /api/parking/:id
// @desc    Delete a parking space
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const parkingSpace = await Parking.findById(req.params.id);
    
    if (!parkingSpace) {
      return res.status(404).json({ message: 'Parking space not found' });
    }
    
    // Check ownership
    if (parkingSpace.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this parking space' });
    }
    
    // Check if there are active bookings
    const activeBookings = await Booking.find({
      spaceId: req.params.id,
      spaceType: 'parking',
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete parking space with active bookings',
        activeBookings: activeBookings.length
      });
    }
    
    await parkingSpace.remove();
    
    res.json({ message: 'Parking space removed successfully' });
  } catch (error) {
    console.error('Delete parking space error:', error);
    res.status(500).json({ message: 'Server error deleting parking space', error: error.message });
  }
});

// @route   GET /api/parking/user/listings
// @desc    Get user's parking space listings
// @access  Private
router.get('/user/listings', protect, async (req, res) => {
  try {
    const parkingSpaces = await Parking.find({ owner: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(parkingSpaces);
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ message: 'Server error fetching user listings', error: error.message });
  }
});

module.exports = router; 