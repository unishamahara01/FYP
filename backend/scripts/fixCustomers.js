const mongoose = require('mongoose');
const Customer = require('./models/Customer');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/meditrust', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixCustomers() {
  try {
    console.log('🔧 Fixing customer data...');
    
    // Get all customers
    const customers = await Customer.find();
    
    for (const customer of customers) {
      let updated = false;
      
      // Convert allergies array to string
      if (Array.isArray(customer.allergies)) {
        customer.allergies = customer.allergies.join(', ');
        updated = true;
      }
      
      // Convert chronicConditions array to string
      if (Array.isArray(customer.chronicConditions)) {
        customer.chronicConditions = customer.chronicConditions.join(', ');
        updated = true;
      }
      
      if (updated) {
        await customer.save();
        console.log(`✅ Fixed customer: ${customer.fullName}`);
      }
    }
    
    console.log('✅ All customers fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCustomers();
