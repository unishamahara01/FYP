require('dotenv').config();
const http = require('http');

const testFulfill = async () => {
  try {
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    
    const User = require('./models/User');
    const Product = require('./models/Product');
    const PurchaseOrder = require('./models/PurchaseOrder');
    
    // Find an admin user to generate a token
    const user = await User.findOne({ role: 'Admin' });
    if (!user) {
      console.log('No admin user found');
      return;
    }
    
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'meditrust_secret_key_2024', { expiresIn: '1d' });
    
    // Create a product with 0 stock
    const product = new Product({
      name: 'Test Product 0 Stock',
      category: 'Vitamin',
      manufacturer: 'Test Mfg',
      batchNumber: 'TST-' + Date.now(),
      quantity: 0,
      price: 100,
      expiryDate: new Date(Date.now() + 100000000),
      manufactureDate: new Date()
    });
    await product.save();
    
    // Create a PO for this product
    const po = new PurchaseOrder({
      poNumber: 'PO-TEST-' + Date.now(),
      product: product._id,
      productName: product.name,
      suggestedOrderQty: 100,
      estimatedCost: 10000,
      status: 'Pending'
    });
    await po.save();
    
    console.log(`Created PO: ${po._id} for Product: ${product._id}`);
    
    // Call the server endpoint
    const postData = JSON.stringify({});
    
    const options = {
      hostname: '127.0.0.1',
      port: 3001,
      path: `/api/purchase-orders/${po._id}/fulfill`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        // Cleanup
        Product.findByIdAndDelete(product._id).then(() => {
          PurchaseOrder.findByIdAndDelete(po._id).then(() => {
            mongoose.disconnect();
          });
        });
      });
    });
    
    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      mongoose.disconnect();
    });
    
    req.write(postData);
    req.end();
    
  } catch (err) {
    console.error(err);
  }
};

testFulfill();
