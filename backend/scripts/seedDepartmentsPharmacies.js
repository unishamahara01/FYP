const mongoose = require('mongoose');
const Department = require('./models/Department');
const Pharmacy = require('./models/Pharmacy');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/meditrust', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedDepartmentsAndPharmacies() {
  try {
    console.log('🏥 Seeding Departments and Pharmacies...');

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'Admin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please run seedUsers.js first.');
      return;
    }

    // Get pharmacist users for managers
    const pharmacists = await User.find({ role: 'Pharmacist' });
    if (pharmacists.length === 0) {
      console.error('❌ No pharmacist users found. Please run seedUsers.js first.');
      return;
    }

    // Clear existing data
    await Department.deleteMany({});
    await Pharmacy.deleteMany({});
    console.log('🗑️ Cleared existing departments and pharmacies');

    // Create Departments
    const departments = [
      {
        name: 'Central Operations',
        description: 'Main operational department overseeing all pharmacy activities',
        manager: pharmacists[0]._id,
        budget: 500000,
        createdBy: adminUser._id
      },
      {
        name: 'Regional North',
        description: 'Northern region pharmacy operations',
        manager: pharmacists[1] ? pharmacists[1]._id : pharmacists[0]._id,
        budget: 300000,
        createdBy: adminUser._id
      },
      {
        name: 'Regional South',
        description: 'Southern region pharmacy operations',
        manager: pharmacists[2] ? pharmacists[2]._id : pharmacists[0]._id,
        budget: 250000,
        createdBy: adminUser._id
      }
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepartments.length} departments`);

    // Create Pharmacies
    const pharmacies = [
      {
        name: 'MediTrust Central Pharmacy',
        code: 'MTC001',
        address: {
          street: 'New Road, Kathmandu',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          country: 'Nepal'
        },
        contact: {
          phone: '+977-1-4123456',
          email: 'central@meditrust.com',
          website: 'www.meditrust.com'
        },
        manager: pharmacists[0]._id,
        department: createdDepartments[0]._id,
        license: {
          number: 'DDA-KTM-2024-001',
          issueDate: new Date('2024-01-15'),
          expiryDate: new Date('2026-01-15'),
          authority: 'Department of Drug Administration (DDA)'
        },
        operatingHours: {
          monday: { open: '08:00', close: '20:00' },
          tuesday: { open: '08:00', close: '20:00' },
          wednesday: { open: '08:00', close: '20:00' },
          thursday: { open: '08:00', close: '20:00' },
          friday: { open: '08:00', close: '20:00' },
          saturday: { open: '09:00', close: '18:00' },
          sunday: { open: '10:00', close: '16:00' }
        },
        metrics: {
          totalProducts: 1250,
          totalSales: 2500000,
          monthlyRevenue: 450000,
          customerCount: 850
        },
        createdBy: adminUser._id
      },
      {
        name: 'MediTrust Pokhara Branch',
        code: 'MTP002',
        address: {
          street: 'Lakeside, Pokhara',
          city: 'Pokhara',
          state: 'Gandaki',
          zipCode: '33700',
          country: 'Nepal'
        },
        contact: {
          phone: '+977-61-123456',
          email: 'pokhara@meditrust.com'
        },
        manager: pharmacists[1] ? pharmacists[1]._id : pharmacists[0]._id,
        department: createdDepartments[1]._id,
        license: {
          number: 'DDA-PKR-2024-002',
          issueDate: new Date('2024-02-01'),
          expiryDate: new Date('2026-02-01'),
          authority: 'Department of Drug Administration (DDA)'
        },
        operatingHours: {
          monday: { open: '08:30', close: '19:30' },
          tuesday: { open: '08:30', close: '19:30' },
          wednesday: { open: '08:30', close: '19:30' },
          thursday: { open: '08:30', close: '19:30' },
          friday: { open: '08:30', close: '19:30' },
          saturday: { open: '09:00', close: '17:00' },
          sunday: { open: '10:00', close: '15:00' }
        },
        metrics: {
          totalProducts: 980,
          totalSales: 1800000,
          monthlyRevenue: 320000,
          customerCount: 620
        },
        createdBy: adminUser._id
      },
      {
        name: 'MediTrust Chitwan Outlet',
        code: 'MTC003',
        address: {
          street: 'Bharatpur-10, Chitwan',
          city: 'Bharatpur',
          state: 'Bagmati',
          zipCode: '44200',
          country: 'Nepal'
        },
        contact: {
          phone: '+977-56-123456',
          email: 'chitwan@meditrust.com'
        },
        manager: pharmacists[2] ? pharmacists[2]._id : pharmacists[0]._id,
        department: createdDepartments[2]._id,
        license: {
          number: 'DDA-CHT-2024-003',
          issueDate: new Date('2024-03-01'),
          expiryDate: new Date('2026-03-01'),
          authority: 'Department of Drug Administration (DDA)'
        },
        operatingHours: {
          monday: { open: '08:00', close: '19:00' },
          tuesday: { open: '08:00', close: '19:00' },
          wednesday: { open: '08:00', close: '19:00' },
          thursday: { open: '08:00', close: '19:00' },
          friday: { open: '08:00', close: '19:00' },
          saturday: { open: '09:00', close: '17:00' },
          sunday: { open: 'Closed', close: 'Closed' }
        },
        metrics: {
          totalProducts: 750,
          totalSales: 1200000,
          monthlyRevenue: 220000,
          customerCount: 450
        },
        createdBy: adminUser._id
      },
      {
        name: 'MediTrust Express Thamel',
        code: 'MTE004',
        address: {
          street: 'Thamel Marg, Kathmandu',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          country: 'Nepal'
        },
        contact: {
          phone: '+977-1-4987654',
          email: 'thamel@meditrust.com'
        },
        manager: pharmacists[3] ? pharmacists[3]._id : pharmacists[0]._id,
        department: createdDepartments[0]._id,
        license: {
          number: 'DDA-TML-2024-004',
          issueDate: new Date('2024-04-01'),
          expiryDate: new Date('2026-04-01'),
          authority: 'Department of Drug Administration (DDA)'
        },
        operatingHours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '09:00', close: '21:00' },
          sunday: { open: '10:00', close: '20:00' }
        },
        metrics: {
          totalProducts: 650,
          totalSales: 950000,
          monthlyRevenue: 180000,
          customerCount: 380
        },
        createdBy: adminUser._id
      }
    ];

    const createdPharmacies = await Pharmacy.insertMany(pharmacies);
    console.log(`✅ Created ${createdPharmacies.length} pharmacies`);

    // Update departments with pharmacy references
    for (let i = 0; i < createdDepartments.length; i++) {
      const dept = createdDepartments[i];
      const deptPharmacies = createdPharmacies.filter(p => p.department.toString() === dept._id.toString());
      
      await Department.findByIdAndUpdate(dept._id, {
        $push: { pharmacies: { $each: deptPharmacies.map(p => p._id) } }
      });
    }

    console.log('🔗 Updated department-pharmacy relationships');

    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${createdDepartments.length} Departments`);
    console.log(`   • ${createdPharmacies.length} Pharmacies`);
    console.log('\n🚀 You can now test the multi-pharmacy admin dashboard!');
    console.log('\n📝 Login as admin@meditrust.com to access the admin dashboard');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding
seedDepartmentsAndPharmacies();