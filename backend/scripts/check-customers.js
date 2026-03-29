const mongoose = require('mongoose');
const Customer = require('./models/Customer');

async function checkCustomers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    
    const customers = await Customer.find();
    console.log(`\n📋 Customers in database: ${customers.length}\n`);
    
    if (customers.length > 0) {
      customers.forEach(c => {
        console.log(`  - ${c.fullName} (${c.email || 'No email'})`);
      });
    } else {
      console.log('  No customers found');
    }
    
    console.log('');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
}

checkCustomers();
