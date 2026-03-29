const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active'
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
