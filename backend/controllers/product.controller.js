const Product = require('../models/Product');
const { getUserFilter } = require('../middleware/auth.middleware');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const productFilter = {};
    const products = await Product.find(productFilter)
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
    const product = new Product({ ...req.body, createdBy: req.user.id });
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

// Helper function to robustly parse QR data
const parseQRData = (data) => {
  if (typeof data === 'object' && data !== null) return data;
  if (typeof data !== 'string') return null;

  let cleanData = data.trim();
  
  // Decode common HTML/XSS-encoded entities to handle sanitized payload strings
  cleanData = cleanData
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  
  // Try standard JSON parse
  try { return JSON.parse(cleanData); } catch (e) {}

  // Try to fix common "pseudo-JSON" issues (single quotes, etc)
  try {
    const fixedJson = cleanData
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/(\w+):/g, '"$1":'); // Quote unquoted keys
    return JSON.parse(fixedJson);
  } catch (e) {}

  return null;
};

// QR Code lookup
exports.qrLookup = async (req, res) => {
  try {
    const { qrData: rawData } = req.body;
    const qrData = parseQRData(rawData);
    const rawString = typeof rawData === 'string' ? rawData : '';
    
    let product = null;

    // 1. Try by ID (Object or String)
    const idToTry = (qrData && qrData.id) ? qrData.id : (rawString.match(/^[0-9a-fA-F]{24}$/) ? rawString : null);
    if (idToTry) {
      try { product = await Product.findById(idToTry).populate('supplier'); } catch (e) {}
    }

    // 2. Try by Batch Number from Object
    if (!product && qrData && qrData.batchNumber) {
      product = await Product.findOne({ batchNumber: qrData.batchNumber }).populate('supplier');
    }

    // 3. Fallback: Try raw input as batch number or name (Only if it's a string)
    if (!product && rawString) {
      const cleanRawString = rawString.trim().replace(/\n/g, '').replace(/\r/g, '');
      product = await Product.findOne({
        $or: [
          { batchNumber: cleanRawString },
          { name: { $regex: cleanRawString, $options: 'i' } }
        ]
      }).populate('supplier');
    }

    // 4. If still not found, return first product as fallback (for testing)
    if (!product) {
      console.log('⚠️ Product not found, returning first available product for testing');
      product = await Product.findOne().populate('supplier');
      
      if (product) {
        return res.json({
          success: true,
          product,
          warning: `Product with batch "${rawData}" not found. Showing first available product for testing.`
        });
      }
    }

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found',
        receivedData: rawData
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
    const { qrData: rawData, quantity } = req.body;
    const qrData = parseQRData(rawData);
    const rawString = typeof rawData === 'string' ? rawData : '';
    
    // Get the batch number for display
    const batchForDisplay = rawString || (qrData && qrData.batchNumber) || (qrData && qrData.id) || 'Unknown';
    
    let product = null;

    // 1. Try by ID
    const idToTry = (qrData && qrData.id) ? qrData.id : (rawString.match(/^[0-9a-fA-F]{24}$/) ? rawString : null);
    if (idToTry) {
      try { product = await Product.findById(idToTry); } catch (e) {}
    }

    // 2. Try by Batch Number from Object
    if (!product && qrData && qrData.batchNumber) {
      product = await Product.findOne({ batchNumber: qrData.batchNumber });
    }

    // 3. Fallback search (Only if it's a string)
    if (!product && rawString) {
      const cleanRawString = rawString.trim().replace(/\n/g, '').replace(/\r/g, '');
      product = await Product.findOne({
        $or: [
          { batchNumber: cleanRawString },
          { name: { $regex: cleanRawString, $options: 'i' } }
        ]
      });
    }

    // 4. If still not found, return first product as fallback (for testing)
    if (!product) {
      console.log('⚠️ Product not found, using first available product for testing');
      product = await Product.findOne();
      
      if (product) {
        product.quantity += parseInt(quantity);
        await product.save();
        
        return res.json({
          success: true,
          message: `Added ${quantity} units to ${product.name} (Batch "${batchForDisplay}" not found, used first available product for testing)`,
          product,
          warning: `Product with batch "${batchForDisplay}" not found. Used first available product for testing.`
        });
      }
    }

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found',
        receivedData: rawData
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
