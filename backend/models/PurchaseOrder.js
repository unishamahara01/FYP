const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  suggestedOrderQty: {
    type: Number,
    required: true
  },
  estimatedCost: Number,
  status: {
    type: String,
    enum: ['Pending', 'Received'],
    default: 'Pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  receivedAt: Date,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
