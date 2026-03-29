const Order = require('../models/Order');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const orders = await Order.find()
      .populate('customer', 'fullName email phone')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('processedBy', 'name email')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { customer, customerName, items, paymentMethod, prescriptionRequired } = req.body;

    // Calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: `Product not found: ${item.product}` 
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
        });
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal
      });

      // Reduce stock
      product.quantity -= item.quantity;
      await product.save();
    }

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${(orderCount + 1).toString().padStart(6, '0')}`;

    // Create order
    const order = new Order({
      orderNumber,
      customer,
      customerName,
      items: orderItems,
      totalAmount,
      paymentMethod,
      prescriptionRequired,
      processedBy: req.user._id,
      status: 'Completed'
    });

    await order.save();

    // Create sale record
    const sale = new Sale({
      order: order._id,
      amount: totalAmount,
      date: new Date(),
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      paymentMethod,
      processedBy: req.user._id
    });

    await sale.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating order', 
      error: error.message 
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, completedAt: status === 'Completed' ? new Date() : null },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating order', 
      error: error.message 
    });
  }
};


// Update order
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating order', 
      error: error.message 
    });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Also delete associated sale
    await Sale.deleteOne({ order: order._id });

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting order', 
      error: error.message 
    });
  }
};
