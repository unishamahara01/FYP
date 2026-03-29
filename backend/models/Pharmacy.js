const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: false }, // Optional for Nepal
    country: { type: String, default: 'Nepal' }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: false }, // Optional
    website: { type: String }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional
  },
  staff: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: {
      type: String,
      enum: ['Pharmacist', 'Assistant', 'Cashier', 'Technician'],
      default: 'Pharmacist'
    },
    joinDate: {
      type: Date,
      default: Date.now
    }
  }],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  license: {
    number: { type: String, required: true },
    issueDate: { type: Date, required: false }, // Optional
    expiryDate: { type: Date, required: false }, // Optional
    authority: { type: String, default: 'Department of Drug Administration (DDA)' }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Maintenance'],
    default: 'Active'
  },
  metrics: {
    totalProducts: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    monthlyRevenue: { type: Number, default: 0 },
    customerCount: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
pharmacySchema.index({ code: 1 });
pharmacySchema.index({ 'address.city': 1 });
pharmacySchema.index({ department: 1 });
pharmacySchema.index({ status: 1 });

// Virtual for full address
pharmacySchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

module.exports = Pharmacy;