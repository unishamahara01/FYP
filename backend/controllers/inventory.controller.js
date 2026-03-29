const Product = require('../models/Product');
const { sendEmail } = require('../utils/email.util');

// Get low stock items
exports.getLowStockItems = async (req, res) => {
  try {
    // Get all products with quantity <= reorder level
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    })
    .populate('supplier', 'name company email phone')
    .sort({ quantity: 1 })
    .lean();

    // Separate into out of stock and low stock
    const outOfStock = lowStockProducts.filter(p => p.quantity === 0);
    const lowStock = lowStockProducts.filter(p => p.quantity > 0);

    res.json({
      success: true,
      count: lowStockProducts.length,
      outOfStock: outOfStock,
      lowStock: lowStock,
      products: lowStockProducts // Keep for backward compatibility
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching low stock items', 
      error: error.message 
    });
  }
};

// Send low stock alert email
exports.sendLowStockAlert = async (req, res) => {
  try {
    const User = require('../models/User');
    
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    })
    .populate('supplier', 'name company email')
    .sort({ quantity: 1 })
    .lean();

    if (lowStockProducts.length === 0) {
      return res.json({
        success: true,
        message: 'No low stock items to alert',
        emailsSent: 0,
        totalRecipients: 0
      });
    }

    // Separate out of stock and low stock items
    const outOfStock = lowStockProducts.filter(p => p.quantity === 0);
    const lowStock = lowStockProducts.filter(p => p.quantity > 0);

    // Send email only to the logged-in user
    const currentUser = req.user; // Get the logged-in user from auth middleware
    
    if (!currentUser || !currentUser.email) {
      return res.json({
        success: false,
        message: 'User email not found',
        emailsSent: 0,
        totalRecipients: 0
      });
    }

    let emailsSent = 0;
    const errors = [];

    // Send email only to the current logged-in user
    const adminUsers = [{ email: currentUser.email, fullName: currentUser.fullName }];
    
    for (const admin of adminUsers) {
      try {
        // Generate HTML email content
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🏥 MediTrust - Low Stock Alert</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Pharmacy Inventory Management System</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <p style="margin-top: 0;">Hello <strong>${admin.fullName}</strong>,</p>
              
              <p>This is an automated notification from your MediTrust pharmacy management system.</p>
              
              ${outOfStock.length > 0 ? `
              <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #c53030; margin-top: 0;">🔴 OUT OF STOCK (${outOfStock.length} items)</h3>
                <ul style="margin: 10px 0;">
                  ${outOfStock.map(product => `
                    <li style="margin: 5px 0;">
                      <strong>${product.name}</strong> (Batch: ${product.batchNumber})
                      <br><small style="color: #666;">Manufacturer: ${product.manufacturer || 'N/A'} | Price: Rs ${product.price}</small>
                    </li>
                  `).join('')}
                </ul>
                <p style="color: #c53030; font-weight: bold; margin-bottom: 0;">⚠️ Immediate restocking required!</p>
              </div>
              ` : ''}
              
              ${lowStock.length > 0 ? `
              <div style="background: #fffbf0; border-left: 4px solid #ed8936; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h3 style="color: #c05621; margin-top: 0;">🟡 LOW STOCK (${lowStock.length} items)</h3>
                <ul style="margin: 10px 0;">
                  ${lowStock.map(product => `
                    <li style="margin: 5px 0;">
                      <strong>${product.name}</strong> (Batch: ${product.batchNumber}) - <span style="color: #c05621; font-weight: bold;">Qty: ${product.quantity}</span>
                      <br><small style="color: #666;">Manufacturer: ${product.manufacturer || 'N/A'} | Price: Rs ${product.price}</small>
                    </li>
                  `).join('')}
                </ul>
                <p style="color: #c05621; font-weight: bold; margin-bottom: 0;">📋 Consider reordering soon</p>
              </div>
              ` : ''}
              
              <div style="background: #e6fffa; border-left: 4px solid #38b2ac; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <h4 style="color: #2c7a7b; margin-top: 0;">📊 Recommended Actions:</h4>
                <ul style="color: #2c7a7b; margin: 10px 0;">
                  <li>Contact suppliers for immediate restocking of out-of-stock items</li>
                  <li>Review sales patterns to optimize inventory levels</li>
                  <li>Update reorder points for frequently low-stock items</li>
                  <li>Check for alternative suppliers if needed</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                  📱 Open MediTrust Dashboard
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
              
              <p style="font-size: 12px; color: #666; margin-bottom: 0;">
                <strong>MediTrust Pharmacy Management System</strong><br>
                This is an automated notification. Generated on: ${new Date().toLocaleString()}<br>
                Low Stock Threshold: Reorder Level (default 50 units)
              </p>
            </div>
          </div>
        `;

        await sendEmail({
          to: admin.email,
          subject: `🚨 Low Stock Alert - ${outOfStock.length} Out of Stock, ${lowStock.length} Low Stock Items`,
          html: htmlContent
        });

        emailsSent++;
        console.log(`✅ Low stock alert sent to: ${admin.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${admin.email}:`, emailError.message);
        errors.push({ email: admin.email, error: emailError.message });
      }
    }

    res.json({
      success: emailsSent > 0,
      message: emailsSent > 0 
        ? `Low stock alert sent successfully to ${emailsSent} recipient(s)` 
        : 'Failed to send any emails',
      emailsSent: emailsSent,
      totalRecipients: adminUsers.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error sending low stock alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending low stock alert', 
      error: error.message 
    });
  }
};

// Check low stock (automated check)
exports.checkLowStock = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).lean();

    res.json({
      success: true,
      hasLowStock: lowStockProducts.length > 0,
      count: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (error) {
    console.error('Error checking low stock:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking low stock', 
      error: error.message 
    });
  }
};
