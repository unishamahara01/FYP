const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    
    console.log('🗄️  All MongoDB Databases:');
    console.log('═══════════════════════════════════════\n');
    
    for (const db of databases) {
      console.log(`   📁 ${db.name}`);
      console.log(`      Size: ${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`);
      console.log(`      Empty: ${db.empty ? 'Yes' : 'No'}`);
      console.log('');
    }
    
    console.log('═══════════════════════════════════════\n');
    console.log('Current database: meditrust');
    console.log('\nLooking for databases that might contain your previous data...\n');
    
    // Check for common database names
    const possibleNames = [
      'meditrust',
      'meditrust_backup',
      'meditrust_old',
      'pharmacy',
      'inventory',
      'test',
      'local'
    ];
    
    const foundDatabases = databases.filter(db => 
      possibleNames.some(name => db.name.toLowerCase().includes(name.toLowerCase()))
    );
    
    if (foundDatabases.length > 0) {
      console.log('📋 Potentially relevant databases:');
      foundDatabases.forEach(db => {
        console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
