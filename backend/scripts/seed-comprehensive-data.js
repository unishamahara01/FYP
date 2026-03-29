const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════');
    console.log('   COMPREHENSIVE DATA SEEDING');
    console.log('═══════════════════════════════════════\n');
    
    try {
      // 1. Create Suppliers
      console.log('📦 Creating Suppliers...');
      const suppliers = await Supplier.insertMany([
        {
          name: 'Rajesh Kumar',
          company: 'Cipla Pharmaceuticals',
          email: 'rajesh@cipla.com',
          phone: '+977-9841234567',
          address: {
            street: 'Teku Road',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            country: 'Nepal'
          },
          status: 'Active',
          rating: 5
        },
        {
          name: 'Sita Sharma',
          company: 'Sun Pharma Nepal',
          email: 'sita@sunpharma.com.np',
          phone: '+977-9851234568',
          address: {
            street: 'Lazimpat',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            country: 'Nepal'
          },
          status: 'Active',
          rating: 4
        },
        {
          name: 'Hari Bahadur',
          company: 'Himalayan Medicines',
          email: 'hari@himalayan.com.np',
          phone: '+977-9861234569',
          address: {
            street: 'Dillibazar',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            country: 'Nepal'
          },
          status: 'Active',
          rating: 5
        }
      ]);
      console.log(`✅ Created ${suppliers.length} suppliers\n`);

      // 2. Create Customers
      console.log('👥 Creating Customers...');
      const customers = await Customer.insertMany([
        {
          fullName: 'Ram Prasad Sharma',
          email: 'ram.sharma@email.com',
          phone: '+977-9841111111',
          address: {
            street: 'Baneshwor',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600'
          },
          gender: 'Male'
        },
        {
          fullName: 'Sita Devi Thapa',
          email: 'sita.thapa@email.com',
          phone: '+977-9841111112',
          address: {
            street: 'Patan Dhoka',
            city: 'Lalitpur',
            state: 'Bagmati',
            zipCode: '44700'
          },
          gender: 'Female'
        },
        {
          fullName: 'Krishna Bahadur Rai',
          email: 'krishna.rai@email.com',
          phone: '+977-9841111113',
          address: {
            street: 'Bhaktapur Durbar',
            city: 'Bhaktapur',
            state: 'Bagmati',
            zipCode: '44800'
          },
          gender: 'Male'
        },
        {
          fullName: 'Maya Gurung',
          email: 'maya.gurung@email.com',
          phone: '+977-9841111114',
          address: {
            street: 'Thamel',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600'
          },
          gender: 'Female'
        },
        {
          fullName: 'Bikash Tamang',
          email: 'bikash.tamang@email.com',
          phone: '+977-9841111115',
          address: {
            street: 'Boudha',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600'
          },
          gender: 'Male'
        }
      ]);
      console.log(`✅ Created ${customers.length} customers\n`);

      // 3. Create Products (20 common medicines)
      console.log('💊 Creating Products...');
      const products = await Product.insertMany([
        // Antibiotics
        {
          name: 'Amoxicillin 500mg',
          genericName: 'Amoxicillin',
          category: 'Antibiotic',
          manufacturer: 'Cipla Ltd.',
          batchNumber: 'AMX-2024-001',
          quantity: 450,
          price: 15,
          expiryDate: new Date('2025-08-15'),
          manufactureDate: new Date('2024-02-15'),
          reorderLevel: 100,
          supplier: suppliers[0]._id
        },
        {
          name: 'Azithromycin 250mg',
          genericName: 'Azithromycin',
          category: 'Antibiotic',
          manufacturer: 'Sun Pharma',
          batchNumber: 'AZI-2024-002',
          quantity: 320,
          price: 25,
          expiryDate: new Date('2025-09-20'),
          manufactureDate: new Date('2024-03-20'),
          reorderLevel: 80,
          supplier: suppliers[1]._id
        },
        {
          name: 'Ciprofloxacin 500mg',
          genericName: 'Ciprofloxacin',
          category: 'Antibiotic',
          manufacturer: 'Himalayan Medicines',
          batchNumber: 'CIP-2024-003',
          quantity: 280,
          price: 20,
          expiryDate: new Date('2025-07-10'),
          manufactureDate: new Date('2024-01-10'),
          reorderLevel: 70,
          supplier: suppliers[2]._id
        },
        // Painkillers
        {
          name: 'Paracetamol 500mg',
          genericName: 'Acetaminophen',
          category: 'Painkiller',
          manufacturer: 'GlaxoSmithKline',
          batchNumber: 'PCM-2024-012',
          quantity: 800,
          price: 5,
          expiryDate: new Date('2026-04-26'),
          manufactureDate: new Date('2024-10-26'),
          reorderLevel: 200,
          supplier: suppliers[0]._id
        },
        {
          name: 'Ibuprofen 400mg',
          genericName: 'Ibuprofen',
          category: 'Painkiller',
          manufacturer: 'Pfizer',
          batchNumber: 'IBU-2024-019',
          quantity: 520,
          price: 8,
          expiryDate: new Date('2026-07-04'),
          manufactureDate: new Date('2025-01-04'),
          reorderLevel: 150,
          supplier: suppliers[1]._id
        },
        {
          name: 'Aspirin 75mg',
          genericName: 'Acetylsalicylic Acid',
          category: 'Painkiller',
          manufacturer: 'Bayer',
          batchNumber: 'ASP-2024-015',
          quantity: 420,
          price: 6,
          expiryDate: new Date('2026-07-20'),
          manufactureDate: new Date('2025-01-20'),
          reorderLevel: 100,
          supplier: suppliers[2]._id
        },
        // Diabetes
        {
          name: 'Metformin 500mg',
          genericName: 'Metformin HCl',
          category: 'Diabetes',
          manufacturer: 'Sun Pharma',
          batchNumber: 'MET-2024-025',
          quantity: 380,
          price: 12,
          expiryDate: new Date('2026-03-31'),
          manufactureDate: new Date('2024-09-30'),
          reorderLevel: 90,
          supplier: suppliers[1]._id
        },
        {
          name: 'Glimepiride 2mg',
          genericName: 'Glimepiride',
          category: 'Diabetes',
          manufacturer: 'Cipla Ltd.',
          batchNumber: 'GLI-2024-026',
          quantity: 240,
          price: 18,
          expiryDate: new Date('2025-11-15'),
          manufactureDate: new Date('2024-05-15'),
          reorderLevel: 60,
          supplier: suppliers[0]._id
        },
        // Heart
        {
          name: 'Atorvastatin 10mg',
          genericName: 'Atorvastatin',
          category: 'Heart',
          manufacturer: 'Pfizer',
          batchNumber: 'ATO-2024-030',
          quantity: 350,
          price: 22,
          expiryDate: new Date('2025-12-20'),
          manufactureDate: new Date('2024-06-20'),
          reorderLevel: 80,
          supplier: suppliers[1]._id
        },
        {
          name: 'Amlodipine 5mg',
          genericName: 'Amlodipine',
          category: 'Heart',
          manufacturer: 'Sun Pharma',
          batchNumber: 'AML-2024-031',
          quantity: 290,
          price: 16,
          expiryDate: new Date('2026-01-10'),
          manufactureDate: new Date('2024-07-10'),
          reorderLevel: 70,
          supplier: suppliers[1]._id
        },
        // Digestive
        {
          name: 'Omeprazole 20mg',
          genericName: 'Omeprazole',
          category: 'Digestive',
          manufacturer: 'AstraZeneca',
          batchNumber: 'OMP-2024-008',
          quantity: 410,
          price: 10,
          expiryDate: new Date('2026-05-29'),
          manufactureDate: new Date('2024-11-29'),
          reorderLevel: 100,
          supplier: suppliers[2]._id
        },
        {
          name: 'Ranitidine 150mg',
          genericName: 'Ranitidine',
          category: 'Digestive',
          manufacturer: 'GlaxoSmithKline',
          batchNumber: 'RAN-2024-009',
          quantity: 330,
          price: 9,
          expiryDate: new Date('2025-10-15'),
          manufactureDate: new Date('2024-04-15'),
          reorderLevel: 80,
          supplier: suppliers[0]._id
        },
        // Respiratory
        {
          name: 'Cetirizine 10mg',
          genericName: 'Cetirizine HCl',
          category: 'Respiratory',
          manufacturer: 'Johnson & Johnson',
          batchNumber: 'CET-2024-022',
          quantity: 460,
          price: 7,
          expiryDate: new Date('2026-05-15'),
          manufactureDate: new Date('2024-11-15'),
          reorderLevel: 120,
          supplier: suppliers[2]._id
        },
        {
          name: 'Montelukast 10mg',
          genericName: 'Montelukast',
          category: 'Respiratory',
          manufacturer: 'Merck',
          batchNumber: 'MON-2024-023',
          quantity: 270,
          price: 24,
          expiryDate: new Date('2025-09-30'),
          manufactureDate: new Date('2024-03-30'),
          reorderLevel: 60,
          supplier: suppliers[1]._id
        },
        // Vitamins
        {
          name: 'Vitamin C 1000mg',
          genericName: 'Ascorbic Acid',
          category: 'Vitamin',
          manufacturer: 'Nature Made',
          batchNumber: 'VIT-2024-003',
          quantity: 550,
          price: 10,
          expiryDate: new Date('2026-10-20'),
          manufactureDate: new Date('2025-04-20'),
          reorderLevel: 150,
          supplier: suppliers[0]._id
        },
        {
          name: 'Vitamin D3 60000 IU',
          genericName: 'Cholecalciferol',
          category: 'Vitamin',
          manufacturer: 'Sun Pharma',
          batchNumber: 'VID-2024-004',
          quantity: 380,
          price: 15,
          expiryDate: new Date('2026-08-15'),
          manufactureDate: new Date('2025-02-15'),
          reorderLevel: 100,
          supplier: suppliers[1]._id
        },
        {
          name: 'Multivitamin Tablets',
          genericName: 'Multivitamin',
          category: 'Vitamin',
          manufacturer: 'Himalayan Medicines',
          batchNumber: 'MUL-2024-005',
          quantity: 490,
          price: 12,
          expiryDate: new Date('2026-06-30'),
          manufactureDate: new Date('2024-12-30'),
          reorderLevel: 130,
          supplier: suppliers[2]._id
        },
        // Other
        {
          name: 'Diclofenac Gel 30g',
          genericName: 'Diclofenac',
          category: 'Other',
          manufacturer: 'Novartis',
          batchNumber: 'DIC-2024-040',
          quantity: 180,
          price: 35,
          expiryDate: new Date('2025-08-20'),
          manufactureDate: new Date('2024-02-20'),
          reorderLevel: 50,
          supplier: suppliers[0]._id
        },
        {
          name: 'Betadine Solution 100ml',
          genericName: 'Povidone Iodine',
          category: 'Other',
          manufacturer: 'Mundipharma',
          batchNumber: 'BET-2024-041',
          quantity: 220,
          price: 45,
          expiryDate: new Date('2026-12-31'),
          manufactureDate: new Date('2025-06-30'),
          reorderLevel: 60,
          supplier: suppliers[2]._id
        },
        {
          name: 'Cough Syrup 100ml',
          genericName: 'Dextromethorphan',
          category: 'Respiratory',
          manufacturer: 'Cipla Ltd.',
          batchNumber: 'COU-2024-042',
          quantity: 310,
          price: 28,
          expiryDate: new Date('2025-07-15'),
          manufactureDate: new Date('2024-01-15'),
          reorderLevel: 80,
          supplier: suppliers[0]._id
        }
      ]);
      console.log(`✅ Created ${products.length} products\n`);

      // 4. Create Orders and Sales (Last 6 months with realistic patterns)
      console.log('📋 Creating Orders and Sales...');
      
      const paymentMethods = ['Cash', 'Card', 'QR Payment'];
      const today = new Date();
      let orderNumber = 1001;
      let totalOrders = 0;
      let totalRevenue = 0;

      // Generate orders for last 6 months
      for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
        const monthDate = new Date(today);
        monthDate.setMonth(monthDate.getMonth() - monthsAgo);
        
        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        
        // Generate 15-25 orders per month (more recent months have more orders)
        const ordersThisMonth = 15 + Math.floor(Math.random() * 10) + (5 - monthsAgo) * 2;
        
        for (let i = 0; i < ordersThisMonth; i++) {
          const orderDate = new Date(monthDate);
          orderDate.setDate(Math.floor(Math.random() * daysInMonth) + 1);
          orderDate.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM
          orderDate.setMinutes(Math.floor(Math.random() * 60));
          
          // Select random customer
          const customer = customers[Math.floor(Math.random() * customers.length)];
          
          // Select 1-4 random products
          const numItems = Math.floor(Math.random() * 3) + 1;
          const orderItems = [];
          let orderTotal = 0;
          
          for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 units
            const subtotal = product.price * quantity;
            
            orderItems.push({
              product: product._id,
              productName: product.name,
              quantity: quantity,
              price: product.price,
              subtotal: subtotal
            });
            
            orderTotal += subtotal;
          }
          
          // Create order
          const order = await Order.create({
            orderNumber: `ORD-${orderNumber++}`,
            customerName: customer.fullName,
            customer: customer._id,
            items: orderItems,
            totalAmount: orderTotal,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            status: 'Completed',
            createdAt: orderDate,
            updatedAt: orderDate
          });
          
          // Create corresponding sale
          await Sale.create({
            order: order._id,
            amount: orderTotal,
            date: orderDate,
            month: orderDate.toLocaleString('default', { month: 'long' }),
            year: orderDate.getFullYear(),
            paymentMethod: order.paymentMethod,
            createdAt: orderDate
          });
          
          totalOrders++;
          totalRevenue += orderTotal;
        }
      }
      
      console.log(`✅ Created ${totalOrders} orders and sales\n`);
      
      // Summary
      console.log('═══════════════════════════════════════');
      console.log('✅ DATA SEEDING COMPLETE!');
      console.log('═══════════════════════════════════════\n');
      
      console.log('📊 Summary:');
      console.log(`   Suppliers: ${suppliers.length}`);
      console.log(`   Customers: ${customers.length}`);
      console.log(`   Products: ${products.length}`);
      console.log(`   Orders: ${totalOrders}`);
      console.log(`   Total Revenue: Rs ${totalRevenue.toLocaleString()}`);
      console.log('');
      
      console.log('📅 Date Range:');
      console.log(`   From: ${new Date(today.getFullYear(), today.getMonth() - 5, 1).toLocaleDateString()}`);
      console.log(`   To: ${today.toLocaleDateString()}`);
      console.log('');
      
      console.log('💡 Features Ready:');
      console.log('   ✅ Sales Analytics (6 months of data)');
      console.log('   ✅ Daily Sales Trend Graph');
      console.log('   ✅ Top Products Analysis');
      console.log('   ✅ Customer History');
      console.log('   ✅ Inventory Management');
      console.log('   ✅ AI Predictions (enough data to train)');
      console.log('');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error seeding data:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
