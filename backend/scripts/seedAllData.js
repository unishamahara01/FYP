const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Sale = require('../models/Sale');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

async function seedDatabase() {
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data (except users)
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await Customer.deleteMany({});
    await Order.deleteMany({});
    await Sale.deleteMany({});
    console.log('✓ Cleared old data\n');

    // 1. SEED SUPPLIERS
    console.log('📦 Seeding Suppliers...');
    const suppliers = await Supplier.insertMany([
      {
        name: 'Rajesh Kumar',
        company: 'MediSupply Nepal Pvt. Ltd.',
        email: 'rajesh@medisupply.com.np',
        phone: '+977-1-4567890',
        address: {
          street: 'Teku Road',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          country: 'Nepal'
        },
        productsSupplied: ['Antibiotics', 'Painkillers', 'Vitamins'],
        rating: 5,
        status: 'Active'
      },
      {
        name: 'Sita Sharma',
        company: 'Pharma Distributors Nepal',
        email: 'sita@pharmadist.com.np',
        phone: '+977-1-4567891',
        address: {
          street: 'New Baneshwor',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          country: 'Nepal'
        },
        productsSupplied: ['Diabetes Medication', 'Heart Medication'],
        rating: 4,
        status: 'Active'
      },
      {
        name: 'Amit Thapa',
        company: 'HealthCare Supplies',
        email: 'amit@healthcare.com.np',
        phone: '+977-1-4567892',
        address: {
          street: 'Putalisadak',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600',
          country: 'Nepal'
        },
        productsSupplied: ['Respiratory', 'Digestive'],
        rating: 5,
        status: 'Active'
      }
    ]);
    console.log(`✓ Created ${suppliers.length} suppliers\n`);

    // 2. SEED PRODUCTS
    console.log('💊 Seeding Products...');
    const products = await Product.insertMany([
      {
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin',
        category: 'Antibiotic',
        manufacturer: 'Cipla Ltd.',
        batchNumber: 'AMX-2024-001',
        quantity: 450,
        price: 15,
        expiryDate: new Date('2025-08-15'),
        manufactureDate: new Date('2023-08-15'),
        reorderLevel: 100,
        supplier: suppliers[0]._id
      },
      {
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        category: 'Painkiller',
        manufacturer: 'GlaxoSmithKline',
        batchNumber: 'PCM-2024-012',
        quantity: 850,
        price: 5,
        expiryDate: new Date('2026-10-05'),
        manufactureDate: new Date('2024-10-05'),
        reorderLevel: 200,
        supplier: suppliers[0]._id
      },
      {
        name: 'Metformin 500mg',
        genericName: 'Metformin HCl',
        category: 'Diabetes',
        manufacturer: 'Sun Pharma',
        batchNumber: 'MET-2024-025',
        quantity: 320,
        price: 12,
        expiryDate: new Date('2025-09-01'),
        manufactureDate: new Date('2023-09-01'),
        reorderLevel: 80,
        supplier: suppliers[1]._id
      },
      {
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        category: 'Painkiller',
        manufacturer: 'Pfizer',
        batchNumber: 'IBU-2024-019',
        quantity: 520,
        price: 8,
        expiryDate: new Date('2025-09-28'),
        manufactureDate: new Date('2023-09-28'),
        reorderLevel: 150,
        supplier: suppliers[0]._id
      },
      {
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        category: 'Digestive',
        manufacturer: 'AstraZeneca',
        batchNumber: 'OMP-2024-008',
        quantity: 280,
        price: 18,
        expiryDate: new Date('2026-10-18'),
        manufactureDate: new Date('2024-10-18'),
        reorderLevel: 70,
        supplier: suppliers[2]._id
      },
      {
        name: 'Vitamin C 1000mg',
        genericName: 'Ascorbic Acid',
        category: 'Vitamin',
        manufacturer: 'Nature Made',
        batchNumber: 'VIT-2024-003',
        quantity: 650,
        price: 25,
        expiryDate: new Date('2026-11-01'),
        manufactureDate: new Date('2024-11-01'),
        reorderLevel: 100,
        supplier: suppliers[0]._id
      },
      {
        name: 'Aspirin 75mg',
        genericName: 'Acetylsalicylic Acid',
        category: 'Heart',
        manufacturer: 'Bayer',
        batchNumber: 'ASP-2024-015',
        quantity: 420,
        price: 6,
        expiryDate: new Date('2026-07-20'),
        manufactureDate: new Date('2024-07-20'),
        reorderLevel: 120,
        supplier: suppliers[1]._id
      },
      {
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine HCl',
        category: 'Respiratory',
        manufacturer: 'Johnson & Johnson',
        batchNumber: 'CET-2024-022',
        quantity: 380,
        price: 10,
        expiryDate: new Date('2026-05-15'),
        manufactureDate: new Date('2024-05-15'),
        reorderLevel: 90,
        supplier: suppliers[2]._id
      }
    ]);
    console.log(`✓ Created ${products.length} products\n`);

    // 3. SEED CUSTOMERS
    console.log('👥 Seeding Customers...');
    const customers = await Customer.insertMany([
      {
        fullName: 'Ram Bahadur Thapa',
        email: 'ram.thapa@email.com',
        phone: '+977-9841234567',
        address: {
          street: 'Lazimpat',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600'
        },
        dateOfBirth: new Date('1985-05-15'),
        gender: 'Male',
        allergies: ['Penicillin'],
        chronicConditions: ['Diabetes'],
        insuranceProvider: 'Nepal Life Insurance',
        insuranceNumber: 'NLI-2024-5678',
        totalPurchases: 15420,
        lastVisit: new Date('2026-01-15')
      },
      {
        fullName: 'Sita Devi Sharma',
        email: 'sita.sharma@email.com',
        phone: '+977-9841234568',
        address: {
          street: 'Baluwatar',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600'
        },
        dateOfBirth: new Date('1990-08-22'),
        gender: 'Female',
        allergies: [],
        chronicConditions: ['Hypertension'],
        insuranceProvider: 'Prime Life Insurance',
        insuranceNumber: 'PLI-2024-9012',
        totalPurchases: 8750,
        lastVisit: new Date('2026-01-16')
      },
      {
        fullName: 'Krishna Prasad Adhikari',
        email: 'krishna.adhikari@email.com',
        phone: '+977-9841234569',
        address: {
          street: 'Maharajgunj',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600'
        },
        dateOfBirth: new Date('1978-12-10'),
        gender: 'Male',
        allergies: ['Sulfa drugs'],
        chronicConditions: [],
        totalPurchases: 5230,
        lastVisit: new Date('2026-01-14')
      },
      {
        fullName: 'Maya Gurung',
        email: 'maya.gurung@email.com',
        phone: '+977-9841234570',
        address: {
          street: 'Boudha',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600'
        },
        dateOfBirth: new Date('1995-03-18'),
        gender: 'Female',
        allergies: [],
        chronicConditions: [],
        totalPurchases: 3450,
        lastVisit: new Date('2026-01-17')
      }
    ]);
    console.log(`✓ Created ${customers.length} customers\n`);

    // 4. SEED ORDERS & SALES
    console.log('🛒 Seeding Orders and Sales...');
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June'];
    let orderCounter = 1000;
    let totalOrders = 0;
    let totalSales = 0;

    // Get a pharmacist user for processedBy
    const pharmacist = await User.findOne({ role: 'Pharmacist' });

    // Create orders for last 6 months
    for (let monthIndex = 0; monthIndex < 6; monthIndex++) {
      const numOrders = Math.floor(Math.random() * 15) + 20; // 20-35 orders per month
      
      for (let i = 0; i < numOrders; i++) {
        orderCounter++;
        
        // Random date in the month
        const orderDate = new Date(2025, monthIndex, Math.floor(Math.random() * 28) + 1);
        
        // Random customer
        const customer = customers[Math.floor(Math.random() * customers.length)];
        
        // Random 1-3 products
        const numItems = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let orderTotal = 0;
        
        for (let j = 0; j < numItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 5) + 1;
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
          orderNumber: `ORD-${orderCounter}`,
          customer: customer._id,
          customerName: customer.fullName,
          items: orderItems,
          totalAmount: orderTotal,
          paymentMethod: ['Cash', 'Card', 'QR Payment'][Math.floor(Math.random() * 3)],
          status: 'Completed',
          prescriptionRequired: Math.random() > 0.7,
          processedBy: pharmacist ? pharmacist._id : null,
          createdAt: orderDate,
          completedAt: orderDate
        });
        
        // Create corresponding sale
        await Sale.create({
          order: order._id,
          amount: orderTotal,
          date: orderDate,
          month: monthNames[monthIndex],
          year: 2025,
          paymentMethod: order.paymentMethod,
          processedBy: pharmacist ? pharmacist._id : null
        });
        
        totalOrders++;
        totalSales += orderTotal;
      }
    }
    
    console.log(`✓ Created ${totalOrders} orders`);
    console.log(`✓ Created ${totalOrders} sales records`);
    console.log(`✓ Total sales value: ₨${totalSales.toFixed(2)}\n`);

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Suppliers: ${suppliers.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Orders: ${totalOrders}`);
    console.log(`   - Sales: ${totalOrders}`);
    console.log(`   - Total Revenue: ₨${totalSales.toFixed(2)}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
