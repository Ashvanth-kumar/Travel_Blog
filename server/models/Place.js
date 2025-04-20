const { Schema, model } = require('mongoose');

const placeSchema = new Schema({
  placeId: {
    type: String,
    required: true,
    unique: true, // Ensure placeId is unique
    trim: true,
  },
  placeName: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  rating: {
    type: String,
    trim: true,
  },
  tags: {
    type: String,
    trim: true,
  },
  thumbnail_url: {
    type: String,
    trim: true,
    validate: {
      validator: function (value) {
        if (!value) return true; // Allow empty values
        return /^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(value);
      },
      message: 'Invalid URL for thumbnail_url',
    },
  },
});

// Index for frequently queried field
placeSchema.index({ placeId: 1 });

const Place = model('Place', placeSchema);
module.exports = Place;