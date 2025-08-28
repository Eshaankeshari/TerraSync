const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    required: true,
    // [longitude, latitude]
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length === 2,
      message: 'coordinates must be [lng, lat]'
    }
  },
});

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    description: { type: String, required: true, maxlength: 1000 },
    photoUrl: { type: String },
    location: { type: pointSchema, required: true, index: '2dsphere' },
    status: { type: String, enum: ['Submitted', 'In Progress', 'Resolved'], default: 'Submitted', index: true },
    concernCount: { type: Number, default: 0 },
    resolutionPhotoUrl: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
