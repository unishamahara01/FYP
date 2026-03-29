const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('supplier', 'name company')
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating product', 
      error: error.message 
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating product', 
      error: error.message 
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting product', 
      error: error.message 
    });
  }
};

// QR Code lookup
exports.qrLookup = async (req, res) => {
  try {
    const { qrData } = req.body;

    // Try to find product by batch number or name
    const product = await Product.findOne({
      $or: [
        { batchNumber: qrData },
        { name: { $regex: qrData, $options: 'i' } }
      ]
    }).populate('supplier');

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error in QR lookup:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error in QR lookup', 
      error: error.message 
    });
  }
};

// QR Add to inventory
exports.qrAddToInventory = async (req, res) => {
  try {
    const { qrData, quantity } = req.body;

    // Find product
    const product = await Product.findOne({
      $or: [
        { batchNumber: qrData },
        { name: { $regex: qrData, $options: 'i' } }
      ]
    });

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Update quantity
    product.quantity += parseInt(quantity);
    await product.save();

    res.json({
      success: true,
      message: `Added ${quantity} units to ${product.name}`,
      product
    });
  } catch (error) {
    console.error('Error adding to inventory:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding to inventory', 
      error: error.message 
    });
  }
};
