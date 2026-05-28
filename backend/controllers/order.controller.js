const Order = require('../models/Order');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { getUserFilter } = require('../middleware/auth.middleware');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const orderFilter = getUserFilter(req, 'processedBy');
    
    const orders = await Order.find(orderFilter)
      .populate('customer')
      .populate('processedBy', 'fullName name email')
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
      .populate('processedBy', 'fullName name email')
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

// Create order - FULL logic with customer auto-creation, loyalty, and low stock alerts
exports.createOrder = async (req, res) => {
  try {
    console.log("📦 Creating new order...");
    console.log("Request body:", req.body);
    
    const { customerName, customerPhone, customerEmail, customerCity, items, paymentMethod, prescriptionRequired } = req.body;
    
    // Calculate order details
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
      
      // Apply discount if product is promoted
      const priceToUse = product.isPromoted && product.discountPercentage > 0 
        ? product.price * (1 - product.discountPercentage / 100) 
        : product.price;

      const subtotal = priceToUse * item.quantity;
      totalAmount += subtotal;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        discountPercentage: product.isPromoted ? product.discountPercentage : 0,
        appliedPrice: priceToUse,
        subtotal: subtotal
      });
      
      // Update product quantity
      product.quantity -= item.quantity;
      console.log(`📦 Product ${product.name} updated: qty=${product.quantity}, reorderLevel=${product.reorderLevel}`);
      
      // AUTOMATED LOW STOCK EMAIL TRIGGER
      if (product.quantity <= product.reorderLevel && !product.lowStockAlertSent) {
        console.log(`🚨 LOW STOCK ALERT TRIGGERED for ${product.name} (qty: ${product.quantity}, reorder: ${product.reorderLevel})`);
        product.lowStockAlertSent = true;
        
        // Find Admins/Pharmacists to notify
        try {
          const { sendLowStockEmail } = require('../lowStockNotification');
          const { config, isValidEmail } = require('../emailConfig');
          
          let recipients = [];
          if (config && config.testEmail) {
            recipients = [{ email: config.testEmail, fullName: 'System Admin' }];
          } else {
            const adminUsers = await User.find({ role: { $in: ['Admin', 'Pharmacist'] }, email: { $exists: true, $ne: '' } });
            recipients = adminUsers.filter(u => isValidEmail(u.email)).map(u => ({ email: u.email, fullName: u.fullName }));
          }
          
          if (recipients.length === 0) {
            console.warn('⚠️ No admin/pharmacist users found to notify');
          } else {
            console.log(`📧 Sending low stock emails to ${recipients.length} admin(s)...`);
            
            // Fire and forget emails to prevent UI from hanging
            recipients.forEach(admin => {
              if (admin.email) {
                sendLowStockEmail(admin.email, admin.fullName, [product])
                  .then(() => console.log(`✅ Low stock email sent successfully to ${admin.email}`))
                  .catch(err => console.error(`❌ Failed to send email to ${admin.email}:`, err.message));
              }
            });
          }
        } catch (emailErr) {
          console.error("❌ Error in automated low stock email setup:", emailErr.message);
        }
      } else if (product.quantity <= product.reorderLevel && product.lowStockAlertSent) {
        console.log(`ℹ️ Low stock alert already sent for ${product.name}, skipping duplicate`);
      }
      
      await product.save();
    }
    
    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${(orderCount + 1001).toString()}`;
    
    // ==================== CUSTOMER AUTO-CREATION / UPDATE ====================
    // Find existing customer by name (case-insensitive)
    let customer = await Customer.findOne({ 
      fullName: { $regex: new RegExp(`^${customerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
    });
    
    if (customer) {
      // --- Update existing customer with loyalty points ---
      const safeTotal = (typeof totalAmount === 'number' && !isNaN(totalAmount)) ? totalAmount : 0;
      const pointsEarned = Math.floor(safeTotal / 100);
      customer.loyaltyPoints = ((typeof customer.loyaltyPoints === 'number' && !isNaN(customer.loyaltyPoints)) ? customer.loyaltyPoints : 0) + pointsEarned;
      
      // Update tier based on cumulative points
      if (customer.loyaltyPoints >= 1000) customer.loyaltyTier = 'Platinum';
      else if (customer.loyaltyPoints >= 500) customer.loyaltyTier = 'Gold';
      else customer.loyaltyTier = 'Silver';
      
      customer.totalPurchases = ((typeof customer.totalPurchases === 'number' && !isNaN(customer.totalPurchases)) ? customer.totalPurchases : 0) + safeTotal;
      customer.lastVisit = new Date();
      
      // Update contact info if provided and currently missing/N/A
      if (customerPhone && (!customer.phone || customer.phone === 'N/A')) {
        customer.phone = customerPhone;
      }
      if (customerEmail && !customer.email) {
        customer.email = customerEmail;
      }
      if (customerCity && (!customer.address || !customer.address.city)) {
        customer.address = { ...customer.address, city: customerCity };
      }
      
      await customer.save();
      console.log(`🪙 Added ${pointsEarned} loyalty points to ${customer.fullName}. Total: ${customer.loyaltyPoints}`);
    } else {
      // --- Auto-create new customer ---
      const safeTotal = (typeof totalAmount === 'number' && !isNaN(totalAmount)) ? totalAmount : 0;
      const pointsEarned = Math.floor(safeTotal / 100);
      let loyaltyTier = 'Silver';
      if (pointsEarned >= 1000) loyaltyTier = 'Platinum';
      else if (pointsEarned >= 500) loyaltyTier = 'Gold';
      
      customer = new Customer({
        fullName: customerName,
        phone: customerPhone || 'N/A',
        email: customerEmail || '',
        address: { city: customerCity || '' },
        loyaltyPoints: pointsEarned,
        loyaltyTier: loyaltyTier,
        totalPurchases: safeTotal,
        lastVisit: new Date(),
        createdAt: new Date(),
        createdBy: req.user.id
      });
      await customer.save();
      console.log(`✨ Auto-created new customer: ${customerName} with ${pointsEarned} loyalty points`);
      if (customerPhone) console.log(`   📞 Phone: ${customerPhone}`);
      if (customerEmail) console.log(`   📧 Email: ${customerEmail}`);
      if (customerCity) console.log(`   🏙️ City: ${customerCity}`);
    }
    
    // ==================== CREATE ORDER WITH CUSTOMER REFERENCE ====================
    const newOrder = new Order({
      orderNumber,
      customer: customer._id, // Link to customer document
      customerName,
      items: orderItems,
      totalAmount,
      paymentMethod,
      prescriptionRequired,
      status: 'Completed',
      processedBy: req.user.id, // JWT encodes 'id', not '_id'
      createdAt: new Date(),
      completedAt: new Date()
    });
    
    await newOrder.save();
    
    // ==================== CREATE SALE RECORD ====================
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    
    const newSale = new Sale({
      order: newOrder._id,
      amount: totalAmount,
      date: now,
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
      paymentMethod,
      processedBy: req.user.id
    });
    
    await newSale.save();
    
    console.log("✅ Order created successfully:", orderNumber);
    console.log("💰 Sale amount:", totalAmount);
    
    res.status(201).json({ 
      success: true,
      message: 'Order created successfully', 
      order: newOrder,
      sale: newSale
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
