const express = require('express');
const router = express.Router();
const ChargingStation = require('../models/ChargingStation');
const auth = require('../middleware/auth');

// Create a new charging station
router.post('/', auth, async (req, res) => {
  try {
    const { name, location, status, powerOutput, connectorType } = req.body;
    
    const station = new ChargingStation({
      name,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      status,
      powerOutput,
      connectorType,
      createdBy: req.user._id
    });

    await station.save();
    res.status(201).json(station);
  } catch (error) {
    res.status(400).json({ message: 'Error creating station', error: error.message });
  }
});

// Get all charging stations
router.get('/', async (req, res) => {
  try {
    const { status, powerOutput, connectorType } = req.query;
    const query = {};

    if (status) query.status = status;
    if (powerOutput) query.powerOutput = powerOutput;
    if (connectorType) query.connectorType = connectorType;

    const stations = await ChargingStation.find(query);
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stations', error: error.message });
  }
});

// Get a specific charging station
router.get('/:id', async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.json(station);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching station', error: error.message });
  }
});

// Update a charging station
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, location, status, powerOutput, connectorType } = req.body;
    
    const station = await ChargingStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    // Check if user is the creator of the station
    if (station.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this station' });
    }

    const updates = {
      name,
      status,
      powerOutput,
      connectorType
    };

    if (location) {
      updates.location = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      };
    }

    const updatedStation = await ChargingStation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updatedStation);
  } catch (error) {
    res.status(400).json({ message: 'Error updating station', error: error.message });
  }
});

// Delete a charging station
router.delete('/:id', auth, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    // Check if user is the creator of the station
    if (station.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this station' });
    }

    await ChargingStation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ message: 'Error deleting station', error: error.message });
  }
});

module.exports = router; 