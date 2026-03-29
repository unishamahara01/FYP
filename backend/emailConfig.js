// Email Notification Configuration
const emailConfig = {
  // Production settings (for real pharmacy)
  production: {
    enabled: true,
    maxRecipients: 3,
    allowedDomains: ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'],
    excludePatterns: [
      /^(admin@meditrust|test|demo|sample)/i,
      /^youba/i,
      /^temp/i
    ],
    frequency: 'immediate', // 'immediate', 'daily', 'weekly'
    onlyRealEmails: true
  },
  
  // Development/Demo settings (for FYP demonstration)
  development: {
    enabled: true,  // Enable emails since they're working
    maxRecipients: 1,
    testEmail: 'unishamahara01@gmail.com',  // Your working email
    allowedDomains: ['gmail.com'],
    excludePatterns: [
      /^(admin@meditrust|test|demo|sample)/i  // Exclude fake emails
    ],
    frequency: 'immediate',
    onlyRealEmails: true
  }
};

// Get current environment (default to development for FYP)
const currentEnv = process.env.NODE_ENV || 'development';
const config = emailConfig[currentEnv];

// Helper function to validate email
function isValidEmail(email) {
  // Check basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Check against excluded patterns
  for (const pattern of config.excludePatterns) {
    if (pattern.test(email)) return false;
  }
  
  // Check allowed domains (if specified)
  if (config.allowedDomains && config.allowedDomains.length > 0) {
    const domain = email.split('@')[1];
    if (!config.allowedDomains.includes(domain)) return false;
  }
  
  return true;
}

// Helper function to get notification recipients
function getNotificationQuery() {
  const query = {
    role: { $in: ['Admin', 'Pharmacist'] },
    email: { $exists: true, $ne: '' }
  };
  
  // In development mode with test email, use specific email
  if (currentEnv === 'development' && config.testEmail) {
    query.email = config.testEmail;
  } else {
    // Use all admin users
    query.role = 'Admin';
  }
  
  return query;
}

module.exports = {
  config,
  currentEnv,
  isValidEmail,
  getNotificationQuery
};