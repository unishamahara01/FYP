const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required for Google OAuth users
    }
  },
  role: {
    type: String,
    enum: ['Admin', 'Pharmacist', 'Staff'],
    default: 'Pharmacist'
  },
  permissions: {
    type: [String],
    default: []
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  avatar: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  // User Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      loginAlerts: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['everyone', 'team', 'private'], default: 'team' },
      activityStatus: { type: Boolean, default: true },
      dataCollection: { type: Boolean, default: true }
    }
  },
  // Login History
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    browser: String,
    device: String,
    success: { type: Boolean, default: true }
  }],
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Method to get user without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
