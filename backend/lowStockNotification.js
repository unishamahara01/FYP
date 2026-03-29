const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Import models
const Product = require('./models/Product');
const User = require('./models/User');

// Import email configuration
const { config, isValidEmail, getNotificationQuery } = require('./emailConfig');

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
});

// Note: MongoDB connection is handled by the main server.js file
// This file only exports functions for use by the server

async function checkLowStock() {
  try {
    console.log('\n📊 Checking for Low Stock Items...\n');
    
    // Define low stock threshold
    const LOW_STOCK_THRESHOLD = 50; // Products with quantity <= 50 are considered low stock
    
    // Find products with low stock
    const lowStockProducts = await Product.find({
      quantity: { $lte: LOW_STOCK_THRESHOLD }
    }).sort({ quantity: 1 }); // Sort by quantity (lowest first)
    
    if (lowStockProducts.length === 0) {
      console.log('✅ No low stock items found. All products are well stocked!');
      process.exit(0);
    }
    
    console.log(`⚠️  Found ${lowStockProducts.length} low stock items:`);
    lowStockProducts.forEach((product, index) => {
      const status = product.quantity === 0 ? '🔴 OUT OF STOCK' : '🟡 LOW STOCK';
      console.log(`${index + 1}. ${product.name} (${product.batchNumber}) - Qty: ${product.quantity} ${status}`);
    });
    
    // Get admin users to notify (SMART FILTERING)
    console.log(`📧 Email config: ${config.maxRecipients} max recipients, environment: ${process.env.NODE_ENV || 'development'}`);
    
    let adminUsers;
    if (config.testEmail) {
      // Development mode - use specific test email
      adminUsers = await User.find({ 
        email: config.testEmail,
        role: { $in: ['Admin', 'Pharmacist'] }
      });
      console.log(`🧪 Development mode: Using test email ${config.testEmail}`);
    } else {
      // Production mode - use filtered real emails
      adminUsers = await User.find(getNotificationQuery()).limit(config.maxRecipients);
    }
    
    // Additional filtering for valid emails
    adminUsers = adminUsers.filter(user => isValidEmail(user.email));
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found to send notifications to.');
      process.exit(0);
    }
    
    console.log(`\n📧 Sending notifications to ${adminUsers.length} admin users...`);
    
    // Send email notifications
    for (const admin of adminUsers) {
      await sendLowStockEmail(admin.email, admin.fullName, lowStockProducts);
      console.log(`✅ Email sent to: ${admin.email}`);
    }
    
    console.log('\n🎉 Low stock notifications sent successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking low stock:', error);
    process.exit(1);
  }
}

async function sendLowStockEmail(email, name, lowStockProducts) {
  // Separate out of stock and low stock items
  const outOfStock = lowStockProducts.filter(p => p.quantity === 0);
  const lowStock = lowStockProducts.filter(p => p.quantity > 0);
  
  // Generate HTML email content
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🏥 MediTrust - Low Stock Alert</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Pharmacy Inventory Management System</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <p style="margin-top: 0;">Hello <strong>${name}</strong>,</p>
        
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
          Low Stock Threshold: 50 units or below
        </p>
      </div>
    </div>
  `;
  
  const mailOptions = {
    from: `"MediTrust Pharmacy System" <${process.env.EMAIL_USER || 'noreply@meditrust.com'}>`,
    to: email,
    subject: `🚨 Low Stock Alert - ${outOfStock.length} Out of Stock, ${lowStock.length} Low Stock Items`,
    html: htmlContent,
    text: `
MediTrust - Low Stock Alert

Hello ${name},

This is an automated notification from your MediTrust pharmacy management system.

${outOfStock.length > 0 ? `
OUT OF STOCK (${outOfStock.length} items):
${outOfStock.map(p => `- ${p.name} (${p.batchNumber})`).join('\n')}
` : ''}

${lowStock.length > 0 ? `
LOW STOCK (${lowStock.length} items):
${lowStock.map(p => `- ${p.name} (${p.batchNumber}) - Qty: ${p.quantity}`).join('\n')}
` : ''}

Please take immediate action to restock these items.

Access your dashboard: http://localhost:3000

Generated on: ${new Date().toLocaleString()}
    `
  };
  
  try {
    await emailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    throw error;
  }
}

// Export for use in other files
module.exports = { checkLowStock, sendLowStockEmail };