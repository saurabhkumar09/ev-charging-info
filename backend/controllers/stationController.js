const Station = require('../models/Station');

// Get all stations
exports.getStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (err) {
    console.error('Error fetching stations:', err);
    res.status(500).json({ message: 'Error fetching stations', error: err.message });
  }
};

// Get single station
exports.getStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.json(station);
  } catch (err) {
    console.error('Error fetching station:', err);
    res.status(500).json({ message: 'Error fetching station', error: err.message });
  }
};

// Create station
exports.createStation = async (req, res) => {
  try {
    // Debug raw incoming data
    console.log('Raw request body:', JSON.stringify(req.body));

    // Validate location structure
    if (!req.body.location || typeof req.body.location !== 'object') {
      return res.status(400).json({
        message: 'Location data is required',
        example: {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude] // numbers only
          }
        }
      });
    }

    // Force number conversion and validate
    const coords = req.body.location.coordinates || [];
    const [longitude, latitude] = coords.map(coord => {
      const num = Number(coord);
      return isNaN(num) ? null : num;
    });

    // Detailed coordinate validation
    if (coords.length !== 2 || longitude === null || latitude === null) {
      return res.status(400).json({
        message: 'Invalid coordinates format',
        details: {
          required: 'Array with 2 numbers [longitude, latitude]',
          received: req.body.location.coordinates,
          converted: [longitude, latitude]
        }
      });
    }

    // Create station with validated data
    const station = new Station({
      ...req.body,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // validated numbers
      }
    });

    const savedStation = await station.save();
    res.status(201).json(savedStation);

  } catch (err) {
    console.error('Database error:', {
      error: err.message,
      receivedData: req.body,
      stack: err.stack
    });

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && {
        error: err.message
      })
    });
  }
};

// Update station
exports.updateStation = async (req, res) => {
  try {
    const { name, location, status, powerOutput, connectorType } = req.body;

    // Validate required fields
    if (!name || !location || !status || !powerOutput || !connectorType) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'All fields are required'
      });
    }

    // Validate location format
    if (!location.type || !location.coordinates || !Array.isArray(location.coordinates)) {
      return res.status(400).json({
        message: 'Invalid location format',
        error: 'Location must have type and coordinates array'
      });
    }

    // Validate coordinates
    const [longitude, latitude] = location.coordinates;
    if (typeof longitude !== 'number' || typeof latitude !== 'number' ||
        isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({
        message: 'Invalid coordinates',
        error: 'Coordinates must be valid numbers'
      });
    }

    // Validate coordinate ranges
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        message: 'Invalid longitude',
        error: 'Longitude must be between -180 and 180'
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        message: 'Invalid latitude',
        error: 'Latitude must be between -90 and 90'
      });
    }

    const station = await Station.findByIdAndUpdate(
      req.params.id,
      {
        name,
        location: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)]
        },
        status,
        powerOutput: Number(powerOutput),
        connectorType
      },
      { new: true, runValidators: true }
    );

    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    res.json(station);
  } catch (err) {
    console.error('Error updating station:', err);
    res.status(400).json({
      message: 'Error updating station',
      error: err.message
    });
  }
};

// Delete station
exports.deleteStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.json({ message: 'Station deleted successfully' });
  } catch (err) {
    console.error('Error deleting station:', err);
    res.status(500).json({
      message: 'Error deleting station',
      error: err.message
    });
  }
}; 