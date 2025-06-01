const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Station name is required'],
    trim: true,
    maxlength: [100, 'Station name cannot exceed 100 characters'],
    minlength: [2, 'Station name must be at least 2 characters']
  },
  location: {
    type: {
      type: String,
      enum: {
        values: ['Point'],
        message: 'Location type must be "Point"'
      },
      default: 'Point',
      required: [true, 'Location type is required']
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function(coords) {
          // Basic array structure check
          if (!Array.isArray(coords)) return false;
          if (coords.length !== 2) return false;
          
          // Type checking
          const [lng, lat] = coords;
          if (typeof lng !== 'number' || typeof lat !== 'number') return false;
          if (isNaN(lng) || isNaN(lat)) return false;
          
          // Range validation
          if (lng < -180 || lng > 180) return false;
          if (lat < -90 || lat > 90) return false;
          
          return true;
        },
        message: props => `Invalid coordinates: ${props.value}. Must be [longitude, latitude] numbers with longitude between -180 and 180, latitude between -90 and 90`
      }
    }
  },
  status: {
    type: String,
    enum: {
      values: ['Active', 'Inactive', 'Maintenance', 'Fault'],
      message: 'Status must be one of: Active, Inactive, Maintenance, Fault'
    },
    required: [true, 'Status is required'],
    default: 'Active'
  },
  powerOutput: {
    type: Number,
    required: [true, 'Power output is required'],
    min: [0, 'Power output must be positive'],
    max: [1000, 'Power output cannot exceed 1000 kW'],
    set: v => parseFloat(v.toFixed(2)) // Store with 2 decimal places
  },
  connectorType: {
    type: String,
    required: [true, 'Connector type is required'],
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required'],
    immutable: true // Prevent modification after creation
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 2dsphere index for geospatial queries
stationSchema.index({ location: '2dsphere' });

// Pre-save hook for additional validation
stationSchema.pre('save', function(next) {
  // Ensure coordinates are properly formatted
  if (this.location?.coordinates) {
    this.location.coordinates = [
      parseFloat(this.location.coordinates[0].toFixed(6)),
      parseFloat(this.location.coordinates[1].toFixed(6))
    ];
  }

  // Additional business logic validation
  if (this.status === 'Active' && this.powerOutput <= 0) {
    throw new Error('Active stations must have positive power output');
  }

  next();
});

// Static method for coordinate validation
stationSchema.statics.validateCoordinates = function(coords) {
  if (!Array.isArray(coords)) {
    throw new Error('Coordinates must be an array');
  }
  if (coords.length !== 2) {
    throw new Error('Coordinates must contain exactly 2 values');
  }

  const [lng, lat] = coords.map(Number);
  
  if (isNaN(lng) || isNaN(lat)) {
    throw new Error('Coordinates must be valid numbers');
  }
  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }

  return [lng, lat];
};

// Instance method to get formatted location
stationSchema.methods.getFormattedLocation = function() {
  return {
    type: this.location.type,
    coordinates: [
      parseFloat(this.location.coordinates[0].toFixed(6)),
      parseFloat(this.location.coordinates[1].toFixed(6))
    ]
  };
};

// Query helper for active stations
stationSchema.query.active = function() {
  return this.where({ status: 'Active' });
};

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;