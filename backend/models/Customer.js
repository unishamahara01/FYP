const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    city: String
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  allergies: {
    type: mongoose.Schema.Types.Mixed,
    default: ''
  },
  chronicConditions: {
    type: mongoose.Schema.Types.Mixed,
    default: ''
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  lastVisit: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Customer', customerSchema);
