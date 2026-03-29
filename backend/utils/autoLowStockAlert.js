const nodemailer = require('nodemailer');
const Product = require('../models/Product');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
    }
  });
};

// Send automatic low stock alert to a specific user
const sendAutoLowStockAlert = async (userEmail, userName, lowStockProducts) => {
  try {
    if (!userEmail || lowStockProducts.length === 0) {
      return { success: false, message: 'No email or products to alert' };
    }

    // Separate out of stock and low stock items
    const outOfStock = lowStockProducts.filter(p => p.quantity === 0);
    const lowStock = lowStockProducts.filter(p => p.quantity > 0);

    // Generate HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🏥 MediTrust - Automatic Low Stock Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Pharmacy Inventory Management System</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <p style="margin-top: 0;">Hello <strong>${userName}</strong>,</p>
          
          <p>This is an <strong>automatic notification</strong> from your MediTrust pharmacy management system.</p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="color: #856404; margin: 0;">
              <strong>⚠️ Automatic Alert Triggered</strong><br>
              The system detected that one or more products have reached or fallen below their reorder level.
            </p>
          </div>
          
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
                  <br><small style="color: #666;">Manufacturer: ${product.manufacturer || 'N/A'} | Price: Rs ${product.price} | Reorder at: ${product.reorderLevel}</small>
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
            This is an <strong>automatic notification</strong>. Generated on: ${new Date().toLocaleString()}<br>
            Low Stock Threshold: Reorder Level (default 50 units)<br>
            <em>You received this email because you are logged in as a user with inventory management access.</em>
          </p>
        </div>
      </div>
    `;

    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"MediTrust Pharmacy System" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🚨 Automatic Low Stock Alert - ${outOfStock.length} Out of Stock, ${lowStock.length} Low Stock Items`,
      html: htmlContent
    });

    console.log(`✅ Automatic low stock alert sent to: ${userEmail}`);
    
    // Mark products as alerted
    const productIds = lowStockProducts.map(p => p._id);
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { lowStockAlertSent: true } }
    );

    return { success: true, message: 'Alert sent successfully' };
  } catch (error) {
    console.error(`❌ Failed to send automatic alert to ${userEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Check and send alerts for low stock products
const checkAndSendAlerts = async (userEmail, userName) => {
  try {
    // Find products that are low stock and haven't been alerted yet
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
      lowStockAlertSent: false
    }).lean();

    if (lowStockProducts.length === 0) {
      return { success: true, message: 'No new low stock items', alertsSent: 0 };
    }

    console.log(`📊 Found ${lowStockProducts.length} new low stock items for ${userEmail}`);

    const result = await sendAutoLowStockAlert(userEmail, userName, lowStockProducts);
    
    return {
      success: result.success,
      message: result.message,
      alertsSent: result.success ? 1 : 0,
      productsCount: lowStockProducts.length
    };
  } catch (error) {
    console.error('Error in checkAndSendAlerts:', error);
    return { success: false, error: error.message, alertsSent: 0 };
  }
};

module.exports = {
  sendAutoLowStockAlert,
  checkAndSendAlerts
};
