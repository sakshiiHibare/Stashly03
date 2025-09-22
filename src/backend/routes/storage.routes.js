const express = require('express');
const router = express.Router();
const Storage = require('../models/storage.model');
const Booking = require('../models/booking.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   GET /api/storage
// @desc    Get all storage spaces
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice, minSize, maxSize, features } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (type) filter.type = type;
    
    if (minPrice || maxPrice) {
      filter.pricing = {};
      if (minPrice) filter.pricing.rate = { $gte: Number(minPrice) };
      if (maxPrice) filter.pricing.rate = { ...filter.pricing.rate, $lte: Number(maxPrice) };
    }
    
    if (minSize || maxSize) {
      // We'll calculate this using aggregation later
    }
    
    if (features) {
      const featuresList = features.split(',');
      featuresList.forEach(feature => {
        if (feature === 'climate') filter['features.isClimate'] = true;
        if (feature === 'secure') filter['features.isSecure'] = true;
        if (feature === 'electricity') filter['features.hasElectricity'] = true;
        if (feature === '24hr') filter['features.has24HrAccess'] = true;
      });
    }
    
    // Find storage spaces with filters
    const storageSpaces = await Storage.find(filter)
      .populate('owner', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 });
    
    res.json(storageSpaces);
  } catch (error) {
    console.error('Get storage spaces error:', error);
    res.status(500).json({ message: 'Server error fetching storage spaces', error: error.message });
  }
});

// @route   GET /api/storage/:id
// @desc    Get storage space by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const storageSpace = await Storage.findById(req.params.id)
      .populate('owner', 'username firstName lastName profileImage');
    
    if (!storageSpace) {
      return res.status(404).json({ message: 'Storage space not found' });
    }
    
    res.json(storageSpace);
  } catch (error) {
    console.error('Get storage space error:', error);
    res.status(500).json({ message: 'Server error fetching storage space', error: error.message });
  }
});

// @route   POST /api/storage
// @desc    Create a storage space
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      size,
      features,
      address,
      pricing,
      images,
      availability
    } = req.body;
    
    const storageSpace = new Storage({
      owner: req.user.id,
      title,
      description,
      type,
      size,
      features,
      address,
      pricing,
      images,
      availability
    });
    
    const createdStorage = await storageSpace.save();
    
    res.status(201).json(createdStorage);
  } catch (error) {
    console.error('Create storage space error:', error);
    res.status(500).json({ message: 'Server error creating storage space', error: error.message });
  }
});

// @route   PUT /api/storage/:id
// @desc    Update a storage space
// @access  Private (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const storageSpace = await Storage.findById(req.params.id);
    
    if (!storageSpace) {
      return res.status(404).json({ message: 'Storage space not found' });
    }
    
    // Check ownership
    if (storageSpace.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this storage space' });
    }
    
    const {
      title,
      description,
      type,
      size,
      features,
      address,
      pricing,
      images,
      availability
    } = req.body;
    
    // Update storage space
    storageSpace.title = title || storageSpace.title;
    storageSpace.description = description || storageSpace.description;
    storageSpace.type = type || storageSpace.type;
    storageSpace.size = size || storageSpace.size;
    storageSpace.features = features || storageSpace.features;
    storageSpace.address = address || storageSpace.address;
    storageSpace.pricing = pricing || storageSpace.pricing;
    storageSpace.images = images || storageSpace.images;
    storageSpace.availability = availability || storageSpace.availability;
    
    const updatedStorage = await storageSpace.save();
    
    res.json(updatedStorage);
  } catch (error) {
    console.error('Update storage space error:', error);
    res.status(500).json({ message: 'Server error updating storage space', error: error.message });
  }
});

// @route   DELETE /api/storage/:id
// @desc    Delete a storage space
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const storageSpace = await Storage.findById(req.params.id);
    
    if (!storageSpace) {
      return res.status(404).json({ message: 'Storage space not found' });
    }
    
    // Check ownership
    if (storageSpace.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this storage space' });
    }
    
    // Check if there are active bookings
    const activeBookings = await Booking.find({
      spaceId: req.params.id,
      spaceType: 'storage',
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete storage space with active bookings',
        activeBookings: activeBookings.length
      });
    }
    
    await storageSpace.remove();
    
    res.json({ message: 'Storage space removed successfully' });
  } catch (error) {
    console.error('Delete storage space error:', error);
    res.status(500).json({ message: 'Server error deleting storage space', error: error.message });
  }
});

// @route   GET /api/storage/user/listings
// @desc    Get user's storage space listings
// @access  Private
router.get('/user/listings', protect, async (req, res) => {
  try {
    const storageSpaces = await Storage.find({ owner: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(storageSpaces);
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ message: 'Server error fetching user listings', error: error.message });
  }
});

module.exports = router; 