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
  // Loyalty Points System
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  totalPointsEarned: {
    type: Number,
    default: 0
  },
  totalPointsRedeemed: {
    type: Number,
    default: 0
  },
  loyaltyTier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  pointsHistory: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'bonus']
    },
    points: Number,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  lastVisit: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate loyalty tier based on total points earned
customerSchema.pre('save', function(next) {
  if (this.totalPointsEarned >= 10000) {
    this.loyaltyTier = 'Platinum';
  } else if (this.totalPointsEarned >= 5000) {
    this.loyaltyTier = 'Gold';
  } else if (this.totalPointsEarned >= 1000) {
    this.loyaltyTier = 'Silver';
  } else {
    this.loyaltyTier = 'Bronze';
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
