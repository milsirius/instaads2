const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  ig_username: {
    type: String,
    required: true
  },
  followers: {
    type: Number,
    required: true
  },
  niche: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  hours:{
    type: Number,
    required: true,
    default: -1
  },
  payment: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  username: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Ad = mongoose.model('Ad', AdSchema);

module.exports = Ad;
