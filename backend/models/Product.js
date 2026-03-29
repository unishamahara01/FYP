const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Antibiotic',
      'Antibiotics',
      'Painkiller',
      'Painkillers', 
      'Diabetes',
      'Heart & Blood Pressure',
      'Digestive',
      'Respiratory',
      'Vitamin',
      'Vitamins',
      'Antacid',
      'Antacids',
      'Antiseptic',
      'Antiseptics',
      'Cold & Flu',
      'Mental Health',
      'Thyroid',
      'Eye & Ear Care',
      'Contraceptives',
      'Contraceptive',
      'Skin Care',
      'Allergy',
      'Cardiovascular',
      'Other'
    ]
  },
  manufacturer: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  manufactureDate: {
    type: Date,
    required: true
  },
  reorderLevel: {
    type: Number,
    default: 50
  },
  lowStockAlertSent: {
    type: Boolean,
    default: false
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Expiring Soon', 'Expired'],
    default: 'In Stock'
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update status based on quantity and expiry
productSchema.pre('save', function(next) {
  const today = new Date();
  const daysUntilExpiry = Math.floor((this.expiryDate - today) / (1000 * 60 * 60 * 24));
  
  // Automatically reset the Anti-Spam tracker if stock goes back to healthy levels
  if (this.quantity > this.reorderLevel) {
    this.lowStockAlertSent = false;
  }
  
  // Status priority: Expired > Out of Stock > Low Stock > Expiring Soon > In Stock
  if (daysUntilExpiry < 0) {
    this.status = 'Expired';
  } else if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.reorderLevel) {
    this.status = 'Low Stock';
  } else if (daysUntilExpiry <= 90) {
    this.status = 'Expiring Soon';
  } else {
    this.status = 'In Stock';
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
