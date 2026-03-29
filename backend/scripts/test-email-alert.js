const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('═══════════════════════════════════════');
console.log('     TESTING EMAIL CONFIGURATION');
console.log('═══════════════════════════════════════\n');

// Check environment variables
console.log('📧 Email Configuration:');
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET'}`);
console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || '587'}`);
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('❌ Email credentials not configured!');
  console.log('   Please set EMAIL_USER and EMAIL_PASS in backend/.env');
  process.exit(1);
}

// Test email connection
async function testEmailConnection() {
  try {
    console.log('🔌 Testing email connection...\n');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Email connection successful!');
    console.log('   SMTP server is ready to send emails.\n');

    // Send test email
    console.log('📨 Sending test email...\n');
    
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '✅ MediTrust Email Test - Success!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✅ Email Test Successful!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">MediTrust Pharmacy System</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p>Congratulations! Your email configuration is working correctly.</p>
            
            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #155724; margin-top: 0;">✅ Email System Status</h3>
              <ul style="color: #155724; margin: 10px 0;">
                <li>SMTP Connection: <strong>Active</strong></li>
                <li>Email Service: <strong>Gmail</strong></li>
                <li>Sender: <strong>${process.env.EMAIL_USER}</strong></li>
                <li>Test Time: <strong>${new Date().toLocaleString()}</strong></li>
              </ul>
            </div>
            
            <p>You can now receive low stock alerts and other notifications from MediTrust.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                📱 Open Dashboard
              </a>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(testEmail);
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Recipient: ${process.env.EMAIL_USER}`);
    console.log('');
    console.log('📬 Check your inbox for the test email!');
    console.log('   (Check spam folder if you don\'t see it)\n');
    
    console.log('═══════════════════════════════════════');
    console.log('✅ EMAIL SYSTEM IS WORKING!');
    console.log('═══════════════════════════════════════\n');
    
    console.log('💡 Next Steps:');
    console.log('   1. Check your email inbox');
    console.log('   2. Click "Low Stock Alert" button in dashboard');
    console.log('   3. You should receive low stock notifications\n');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('');
    
    if (error.message.includes('Invalid login')) {
      console.log('🔐 Authentication Error:');
      console.log('   Your Gmail credentials are incorrect or you need an App Password.');
      console.log('');
      console.log('📝 To fix this:');
      console.log('   1. Go to https://myaccount.google.com/security');
      console.log('   2. Enable 2-Step Verification');
      console.log('   3. Go to https://myaccount.google.com/apppasswords');
      console.log('   4. Create an App Password for "Mail"');
      console.log('   5. Update EMAIL_PASS in backend/.env with the app password');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('🌐 Connection Error:');
      console.log('   Cannot connect to Gmail SMTP server.');
      console.log('   Check your internet connection.');
    } else {
      console.log('⚠️  Unknown Error:');
      console.log(`   ${error.message}`);
    }
    
    process.exit(1);
  }
}

testEmailConnection();
