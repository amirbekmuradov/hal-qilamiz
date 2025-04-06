const mongoose = require('mongoose');

// Region schema
const regionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  population: {
    type: Number,
    default: 0,
  },
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
  boundary: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon',
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON format for polygon
      default: [],
    },
  },
  imageUrl: {
    type: String,
  },
  statisticsUrl: {
    type: String,
  },
  localGovernmentWebsite: {
    type: String,
  },
  officialRepresentatives: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    position: String,
    department: String,
  }],
  subRegions: [{
    name: String,
    code: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for issue counts
regionSchema.virtual('issueCounts', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'location.region',
  count: true,
});

// Virtual for pending issues count
regionSchema.virtual('pendingIssuesCount', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'location.region',
  count: true,
  match: { status: 'Pending' },
});

// Virtual for in-progress issues count
regionSchema.virtual('inProgressIssuesCount', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'location.region',
  count: true,
  match: { status: 'In Progress' },
});

// Virtual for resolved issues count
regionSchema.virtual('resolvedIssuesCount', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'location.region',
  count: true,
  match: { status: 'Resolved' },
});

// Index for efficient querying
regionSchema.index({ name: 1 });
regionSchema.index({ code: 1 });

// If using MongoDB 4.2+, you can add a geospatial index for the boundary
if (mongoose.connection.db) {
  mongoose.connection.db.once('open', () => {
    mongoose.connection.db.collection('regions').createIndex({ boundary: '2dsphere' });
  });
}

// Create Region model
const Region = mongoose.model('Region', regionSchema);

module.exports = { Region };