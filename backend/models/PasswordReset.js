const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - automatically deletes expired documents
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster lookups
passwordResetSchema.index({ email: 1, code: 1 });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
