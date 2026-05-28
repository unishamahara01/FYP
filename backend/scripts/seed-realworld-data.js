const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Order = require('../models/Order');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

console.log('🔗 Connecting to MongoDB Atlas...');

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas\n');
    console.log('═══════════════════════════════════════════════');
    console.log('   REAL-WORLD PHARMACY DATA SEEDING');
    console.log('   MediTrust - Intelligent Pharmacy Management');
    console.log('═══════════════════════════════════════════════\n');

    try {
      // Clear existing data (except Users)
      console.log('🗑️  Clearing existing data (keeping users)...');
      await Promise.all([
        Product.deleteMany({}),
        Order.deleteMany({}),
        Sale.deleteMany({}),
        Customer.deleteMany({}),
        Supplier.deleteMany({}),
        PurchaseOrder.deleteMany({})
      ]);
      console.log('   ✓ All collections cleared\n');

      // ============================================
      // 1. SUPPLIERS
      // ============================================
      console.log('📦 Creating Suppliers...');
      const suppliers = await Supplier.insertMany([
        {
          name: 'Rajesh Kumar Agrawal', company: 'Nepal Pharma Pvt. Ltd.',
          email: 'rajesh@nepalpharma.com.np', phone: '+977-9841234567',
          address: { city: 'Kathmandu', country: 'Nepal' },
          productsSupplied: ['Amoxicillin', 'Paracetamol', 'Metronidazole', 'Glimepiride', 'Atorvastatin', 'Omeprazole', 'Montelukast'],
          status: 'Active', rating: 5
        },
        {
          name: 'Sunita Shrestha', company: 'Himal Drug House',
          email: 'sunita@himaldrughouse.com.np', phone: '+977-9851345678',
          address: { city: 'Kathmandu', country: 'Nepal' },
          productsSupplied: ['Azithromycin', 'Ibuprofen', 'Metformin', 'Amlodipine', 'Pantoprazole', 'Vitamin D3'],
          status: 'Active', rating: 4
        },
        {
          name: 'Hari Prasad Pokharel', company: 'Pokharel Medical Suppliers',
          email: 'hari@pokharelmedical.com.np', phone: '+977-9861456789',
          address: { city: 'Pokhara', country: 'Nepal' },
          productsSupplied: ['Aspirin', 'Domperidone', 'Vitamin C', 'Calcium + Vitamin D', 'Cough Syrup'],
          status: 'Active', rating: 5
        },
        {
          name: 'Anita Tamang', company: 'Everest Pharmaceuticals',
          email: 'anita@everestpharma.com.np', phone: '+977-9871567890',
          address: { city: 'Lalitpur', country: 'Nepal' },
          productsSupplied: ['Ciprofloxacin', 'Diclofenac', 'Insulin', 'Losartan', 'Cetirizine', 'Salbutamol', 'Betadine'],
          status: 'Active', rating: 4
        },
        {
          name: 'Bikram Thapa', company: 'National Healthcare Distributors',
          email: 'bikram@nhcdistributors.com.np', phone: '+977-9801678901',
          address: { city: 'Biratnagar', country: 'Nepal' },
          productsSupplied: ['Tramadol', 'ORS', 'Iron + Folic Acid'],
          status: 'Active', rating: 3
        }
      ]);
      console.log(`   ✓ Created ${suppliers.length} suppliers\n`);

      // ============================================
      // 2. CUSTOMERS
      // ============================================
      console.log('👥 Creating Customers...');
      const customers = await Customer.insertMany([
        {
          fullName: 'Ram Prasad Sharma', email: 'ram.sharma@gmail.com', phone: '+977-9841111001',
          address: { city: 'Kathmandu' }, gender: 'Male', dateOfBirth: new Date('1965-03-15'),
          allergies: 'Penicillin', chronicConditions: 'Hypertension, Type 2 Diabetes',
          totalPurchases: 32, loyaltyPoints: 450, totalPointsEarned: 1200, status: 'Active'
        },
        {
          fullName: 'Sita Devi Adhikari', email: 'sita.adhikari@gmail.com', phone: '+977-9841111002',
          address: { city: 'Lalitpur' }, gender: 'Female', dateOfBirth: new Date('1978-07-22'),
          allergies: '', chronicConditions: 'Asthma',
          totalPurchases: 18, loyaltyPoints: 280, totalPointsEarned: 750, status: 'Active'
        },
        {
          fullName: 'Krishna Bahadur Rai', email: 'krishna.rai@yahoo.com', phone: '+977-9841111003',
          address: { city: 'Bhaktapur' }, gender: 'Male', dateOfBirth: new Date('1982-11-05'),
          allergies: 'Sulfa drugs', chronicConditions: '',
          totalPurchases: 8, loyaltyPoints: 120, totalPointsEarned: 320, status: 'Active'
        },
        {
          fullName: 'Maya Gurung', email: 'maya.gurung@hotmail.com', phone: '+977-9841111004',
          address: { city: 'Kathmandu' }, gender: 'Female', dateOfBirth: new Date('1990-01-30'),
          allergies: '', chronicConditions: 'Migraine',
          totalPurchases: 5, loyaltyPoints: 75, totalPointsEarned: 200, status: 'Active'
        },
        {
          fullName: 'Bikash Tamang', email: 'bikash.tamang@gmail.com', phone: '+977-9841111005',
          address: { city: 'Kathmandu' }, gender: 'Male', dateOfBirth: new Date('1975-09-12'),
          allergies: '', chronicConditions: 'Cholesterol, Gastritis',
          totalPurchases: 22, loyaltyPoints: 310, totalPointsEarned: 900, status: 'Active'
        },
        {
          fullName: 'Parvati Thapa Magar', email: 'parvati.magar@gmail.com', phone: '+977-9841111006',
          address: { city: 'Kathmandu' }, gender: 'Female', dateOfBirth: new Date('1988-04-18'),
          allergies: 'Aspirin', chronicConditions: 'Thyroid',
          totalPurchases: 12, loyaltyPoints: 190, totalPointsEarned: 580, status: 'Active'
        },
        {
          fullName: 'Deepak Karki', email: 'deepak.karki@gmail.com', phone: '+977-9841111007',
          address: { city: 'Kathmandu' }, gender: 'Male', dateOfBirth: new Date('1958-12-25'),
          allergies: '', chronicConditions: 'Arthritis, Hypertension',
          totalPurchases: 45, loyaltyPoints: 520, totalPointsEarned: 5200, status: 'Active'
        },
        {
          fullName: 'Laxmi Pandey', email: 'laxmi.pandey@gmail.com', phone: '+977-9841111008',
          address: { city: 'Kathmandu' }, gender: 'Female', dateOfBirth: new Date('1995-06-08'),
          allergies: '', chronicConditions: '',
          totalPurchases: 3, loyaltyPoints: 60, totalPointsEarned: 90, status: 'Active'
        },
        {
          fullName: 'Suresh Maharjan', email: 'suresh.maharjan@gmail.com', phone: '+977-9841111009',
          address: { city: 'Lalitpur' }, gender: 'Male', dateOfBirth: new Date('1970-02-14'),
          allergies: 'Ibuprofen', chronicConditions: 'Type 2 Diabetes, Neuropathy',
          totalPurchases: 55, loyaltyPoints: 680, totalPointsEarned: 6800, status: 'Active'
        },
        {
          fullName: 'Kamala Bhandari', email: 'kamala.bhandari@gmail.com', phone: '+977-9841111010',
          address: { city: 'Kathmandu' }, gender: 'Female', dateOfBirth: new Date('1985-10-20'),
          allergies: '', chronicConditions: 'PCOS',
          totalPurchases: 9, loyaltyPoints: 145, totalPointsEarned: 400, status: 'Active'
        },
        {
          fullName: 'Narayan Poudel', email: 'narayan.poudel@gmail.com', phone: '+977-9841111011',
          address: { city: 'Kathmandu' }, gender: 'Male', dateOfBirth: new Date('1960-08-03'),
          allergies: '', chronicConditions: 'COPD, Hypertension',
          totalPurchases: 38, loyaltyPoints: 890, totalPointsEarned: 4500, status: 'Active'
        },
        {
          fullName: 'Saraswati Dhakal', email: 'saraswati.dhakal@gmail.com', phone: '+977-9841111012',
          address: { city: 'Bhaktapur' }, gender: 'Female', dateOfBirth: new Date('1992-11-15'),
          allergies: '', chronicConditions: '',
          totalPurchases: 6, loyaltyPoints: 95, totalPointsEarned: 180, status: 'Active'
        }
      ]);
      console.log(`   ✓ Created ${customers.length} customers\n`);

      // ============================================
      // 3. PRODUCTS (30 real medicines)
      // ============================================
      console.log('💊 Creating Products (30 medicines)...');
      const today = new Date();

      const productData = [
        // === ANTIBIOTICS (some expiring soon, one expired) ===
        { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'Nepal Pharma Pvt. Ltd.', batchNumber: 'AMX-2024-001', quantity: 85, price: 15, expiryDate: daysFromNow(25), manufactureDate: daysFromNow(-540), reorderLevel: 100, supplier: suppliers[0]._id },
        { name: 'Azithromycin 250mg', genericName: 'Azithromycin', category: 'Antibiotic', manufacturer: 'Himal Drug House', batchNumber: 'AZI-2024-002', quantity: 320, price: 30, expiryDate: daysFromNow(180), manufactureDate: daysFromNow(-365), reorderLevel: 80, supplier: suppliers[1]._id },
        { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', category: 'Antibiotic', manufacturer: 'Everest Pharmaceuticals', batchNumber: 'CIP-2024-003', quantity: 45, price: 22, expiryDate: daysFromNow(-10), manufactureDate: daysFromNow(-730), reorderLevel: 70, supplier: suppliers[3]._id },
        { name: 'Metronidazole 400mg', genericName: 'Metronidazole', category: 'Antibiotic', manufacturer: 'Nepal Pharma Pvt. Ltd.', batchNumber: 'MET-2025-004', quantity: 260, price: 12, expiryDate: daysFromNow(300), manufactureDate: daysFromNow(-60), reorderLevel: 60, supplier: suppliers[0]._id },

        // === PAINKILLERS ===
        { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Painkiller', manufacturer: 'Nepal Pharma Pvt. Ltd.', batchNumber: 'PCM-2025-010', quantity: 1200, price: 3, expiryDate: daysFromNow(450), manufactureDate: daysFromNow(-90), reorderLevel: 300, supplier: suppliers[0]._id },
        { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Painkiller', manufacturer: 'Himal Drug House', batchNumber: 'IBU-2025-011', quantity: 520, price: 8, expiryDate: daysFromNow(365), manufactureDate: daysFromNow(-120), reorderLevel: 150, supplier: suppliers[1]._id },
        { name: 'Diclofenac 50mg', genericName: 'Diclofenac Sodium', category: 'Painkiller', manufacturer: 'Everest Pharmaceuticals', batchNumber: 'DIC-2025-012', quantity: 180, price: 10, expiryDate: daysFromNow(60), manufactureDate: daysFromNow(-300), reorderLevel: 80, supplier: suppliers[3]._id },
        { name: 'Tramadol 50mg', genericName: 'Tramadol HCl', category: 'Painkiller', manufacturer: 'National Healthcare Distributors', batchNumber: 'TRM-2025-013', quantity: 90, price: 18, expiryDate: daysFromNow(200), manufactureDate: daysFromNow(-150), reorderLevel: 40, supplier: suppliers[4]._id },

        // === DIABETES ===
        { name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Diabetes', manufacturer: 'Himal Drug House', batchNumber: 'MTF-2025-020', quantity: 650, price: 8, expiryDate: daysFromNow(270), manufactureDate: daysFromNow(-90), reorderLevel: 150, supplier: suppliers[1]._id },
        { name: 'Glimepiride 2mg', genericName: 'Glimepiride', category: 'Diabetes', manufacturer: 'Nepal Pharma Pvt. Ltd.', batchNumber: 'GLI-2025-021', quantity: 30, price: 15, expiryDate: daysFromNow(45), manufactureDate: daysFromNow(-320), reorderLevel: 60, supplier: suppliers[0]._id },
        { name: 'Insulin Glargine 100IU/ml', genericName: 'Insulin Glargine', category: 'Diabetes', manufacturer: 'Everest Pharmaceuticals', batchNumber: 'INS-2025-022', quantity: 40, price: 850, expiryDate: daysFromNow(90), manufactureDate: daysFromNow(-180), reorderLevel: 20, supplier: suppliers[3]._id },

        // === HEART & BLOOD PRESSURE ===
        { name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Heart & Blood Pressure', manufacturer: 'Himal Drug House', batchNumber: 'AML-2025-030', quantity: 380, price: 12, expiryDate: daysFromNow(400), manufactureDate: daysFromNow(-60), reorderLevel: 90, supplier: suppliers[1]._id },
        { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin Calcium', category: 'Heart & Blood Pressure', manufacturer: 'Nepal Pharma Pvt. Ltd.', batchNumber: 'ATV-2025-031', quantity: 290, price: 18, expiryDate: daysFromNow(330), manufactureDate: daysFromNow(-35), reorderLevel: 70, supplier: suppliers[0]._id },
        { name: 'Losartan 50mg', genericName: 'Losartan Potassium', category: 'Heart & Blood Pressure', manufacturer: 'Everest Pharmaceuticals', batchNumber: 'LOS-2025-032', quantity: 210, price: 14, expiryDate: daysFromNow(250), manufactureDate: daysFromNow(-100), reorderLevel: 60, supplier: suppliers[3]._id },
        { name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', category: 'Heart & Blood Pressure', manufacturer: 'Pokharel Medical Suppliers', batchNumber: 'ASP-2025-033', quantity: 500, price: 4, expiryDate: daysFromNow(500), manufactureDate: daysFromNow(-30), reorderLevel: 120, supplier: suppliers[2]._id },

        // === DIGESTIVE ===
        { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Digestive', manufacturer: 'Nepal Pharma Pvt. Ltd.', batchNumber: 'OMP-2025-040', quantity: 440, price: 10, expiryDate: daysFromNow(350), manufactureDate: daysFromNow(-15), reorderLevel: 100, supplier: suppliers[0]._id },
        { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'Digestive', manufacturer: 'Himal Drug House', batchNumber: 'PAN-2025-041', quantity: 15, price: 14, expiryDate: daysFromNow(20), manufactureDate: daysFromNow(-345), reorderLevel: 80, supplier: suppliers[1]._id },
        { name: 'Domperidone 10mg', genericName: 'Domperidone', category: 'Digestive', manufacturer: 'Pokharel Medical Suppliers', batchNumber: 'DOM-2025-042', quantity: 350, price: 7, expiryDate: daysFromNow(280), manufactureDate: daysFromNow(-85), reorderLevel: 80, supplier: suppliers[2]._id },
        { name: 'ORS Sachets', genericName: 'Oral Rehydration Salts', category: 'Digestive', manufacturer: 'National Healthcare Distributors', batchNumber: 'ORS-2025-043', quantity: 800, price: 5, expiryDate: daysFromNow(600), manufactureDate: daysFromNow(-30), reorderLevel: 200, supplier: suppliers[4]._id },

        // === RESPIRATORY ===
        { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'Respiratory', manufacturer: 'Everest Pharmaceuticals', batchNumber: 'CET-2025-050', quantity: 480, price: 6, expiryDate: daysFromNow(380), manufactureDate: daysFromNow(-20), reorderLevel: 120, supplier: suppliers[3]._id },
        { name: 'Montelukast 10mg', genericName: 'Montelukast Sodium', category: 'Respiratory', manufacturer: 'Nepal Pharma Pvt. Ltd.', batchNumber: 'MON-2025-051', quantity: 55, price: 22, expiryDate: daysFromNow(35), manufactureDate: daysFromNow(-330), reorderLevel: 60, supplier: suppliers[0]._id },
        { name: 'Salbutamol Inhaler 100mcg', genericName: 'Salbutamol', category: 'Respiratory', manufacturer: 'Everest Pharmaceuticals', batchNumber: 'SAL-2025-052', quantity: 65, price: 180, expiryDate: daysFromNow(240), manufactureDate: daysFromNow(-125), reorderLevel: 30, supplier: suppliers[3]._id },
        { name: 'Cough Syrup (Dextromethorphan)', genericName: 'Dextromethorphan HBr', category: 'Respiratory', manufacturer: 'Pokharel Medical Suppliers', batchNumber: 'COU-2025-053', quantity: 150, price: 85, expiryDate: daysFromNow(150), manufactureDate: daysFromNow(-215), reorderLevel: 40, supplier: suppliers[2]._id },

        // === VITAMINS ===
        { name: 'Vitamin C 500mg', genericName: 'Ascorbic Acid', category: 'Vitamin', manufacturer: 'Pokharel Medical Suppliers', batchNumber: 'VTC-2025-060', quantity: 700, price: 8, expiryDate: daysFromNow(500), manufactureDate: daysFromNow(-60), reorderLevel: 150, supplier: suppliers[2]._id },
        { name: 'Vitamin D3 60000 IU', genericName: 'Cholecalciferol', category: 'Vitamin', manufacturer: 'Himal Drug House', batchNumber: 'VTD-2025-061', quantity: 200, price: 40, expiryDate: daysFromNow(420), manufactureDate: daysFromNow(-45), reorderLevel: 50, supplier: suppliers[1]._id },
        { name: 'Iron + Folic Acid', genericName: 'Ferrous Sulfate + Folic Acid', category: 'Vitamin', manufacturer: 'National Healthcare Distributors', batchNumber: 'IFA-2025-062', quantity: 400, price: 6, expiryDate: daysFromNow(360), manufactureDate: daysFromNow(-5), reorderLevel: 100, supplier: suppliers[4]._id },
        { name: 'Calcium + Vitamin D', genericName: 'Calcium Carbonate + Cholecalciferol', category: 'Vitamin', manufacturer: 'Pokharel Medical Suppliers', batchNumber: 'CAL-2025-063', quantity: 350, price: 12, expiryDate: daysFromNow(480), manufactureDate: daysFromNow(-20), reorderLevel: 80, supplier: suppliers[2]._id },

        // === OTHER ===
        { name: 'Betadine Solution 50ml', genericName: 'Povidone Iodine', category: 'Antiseptic', manufacturer: 'Everest Pharmaceuticals', batchNumber: 'BET-2025-070', quantity: 120, price: 95, expiryDate: daysFromNow(700), manufactureDate: daysFromNow(-60), reorderLevel: 30, supplier: suppliers[3]._id },
        { name: 'Fluconazole 150mg', genericName: 'Fluconazole', category: 'Other', manufacturer: 'Nepal Pharma Pvt. Ltd.', batchNumber: 'FLU-2025-071', quantity: 110, price: 35, expiryDate: daysFromNow(290), manufactureDate: daysFromNow(-75), reorderLevel: 30, supplier: suppliers[0]._id },
        { name: 'Loperamide 2mg', genericName: 'Loperamide HCl', category: 'Digestive', manufacturer: 'National Healthcare Distributors', batchNumber: 'LOP-2025-072', quantity: 250, price: 8, expiryDate: daysFromNow(310), manufactureDate: daysFromNow(-55), reorderLevel: 60, supplier: suppliers[4]._id },
      ];

      // Use Product.create to trigger pre-save hook for status
      const products = [];
      for (const pd of productData) {
        const p = await Product.create(pd);
        products.push(p);
      }
      console.log(`   ✓ Created ${products.length} products`);

      const lowStock = products.filter(p => p.quantity <= p.reorderLevel);
      const expiringSoon = products.filter(p => p.status === 'Expiring Soon');
      const expired = products.filter(p => p.status === 'Expired');
      console.log(`   ⚠️  ${lowStock.length} low stock | ${expiringSoon.length} expiring soon | ${expired.length} expired\n`);

      // ============================================
      // 4. ORDERS & SALES (6 months of data)
      // ============================================
      console.log('📋 Creating Orders & Sales (6 months)...');

      const paymentMethods = ['Cash', 'Cash', 'Cash', 'Card', 'Card', 'QR Payment'];
      const productWeights = products.map(p => {
        const w = { 'Painkiller': 5, 'Vitamin': 4, 'Digestive': 3, 'Respiratory': 3, 'Antibiotic': 2, 'Heart & Blood Pressure': 2, 'Diabetes': 2 };
        return w[p.category] || 1;
      });

      function weightedRandomProduct() {
        const total = productWeights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < products.length; i++) {
          r -= productWeights[i];
          if (r <= 0) return products[i];
        }
        return products[0];
      }

      let orderNumber = 1001;
      let totalOrders = 0;
      let totalRevenue = 0;
      const allOrders = [];
      const allSales = [];

      for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
        const monthDate = new Date(today);
        monthDate.setMonth(monthDate.getMonth() - monthsAgo);
        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

        // More orders in recent months + seasonal variation
        const baseOrders = 18 + Math.floor(Math.random() * 8);
        const recencyBoost = (5 - monthsAgo) * 4;
        const ordersThisMonth = baseOrders + recencyBoost;

        let monthRevenue = 0;

        for (let i = 0; i < ordersThisMonth; i++) {
          const day = Math.min(Math.floor(Math.random() * daysInMonth) + 1, daysInMonth);
          const orderDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
          if (orderDate > today) continue;
          orderDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);

          const customer = customers[Math.floor(Math.random() * customers.length)];
          const numItems = Math.floor(Math.random() * 4) + 1;
          const orderItems = [];
          const usedProducts = new Set();
          let orderTotal = 0;

          for (let j = 0; j < numItems; j++) {
            let product;
            let attempts = 0;
            do { product = weightedRandomProduct(); attempts++; } while (usedProducts.has(product._id.toString()) && attempts < 10);
            if (usedProducts.has(product._id.toString())) continue;
            usedProducts.add(product._id.toString());

            const quantity = Math.floor(Math.random() * 5) + 1;
            const subtotal = product.price * quantity;
            orderItems.push({ product: product._id, productName: product.name, quantity, price: product.price, subtotal });
            orderTotal += subtotal;
          }
          if (orderItems.length === 0) continue;

          const status = Math.random() < 0.92 ? 'Completed' : (Math.random() < 0.5 ? 'Pending' : 'Cancelled');

          allOrders.push({
            orderNumber: `ORD-${orderNumber++}`,
            customerName: customer.fullName,
            customer: customer._id,
            items: orderItems,
            totalAmount: orderTotal,
            paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            status,
            createdAt: orderDate,
            updatedAt: orderDate
          });

          if (status === 'Completed') {
            allSales.push({
              amount: orderTotal,
              date: orderDate,
              month: orderDate.toLocaleString('default', { month: 'long' }),
              year: orderDate.getFullYear(),
              paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
              createdAt: orderDate
            });
            monthRevenue += orderTotal;
          }
          totalOrders++;
          totalRevenue += orderTotal;
        }

        const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        console.log(`   📅 ${monthName}: ${ordersThisMonth} orders, Rs ${monthRevenue.toLocaleString()}`);
      }

      const insertedOrders = await Order.insertMany(allOrders);

      // Link sales to orders
      let saleIdx = 0;
      for (const order of insertedOrders) {
        if (order.status === 'Completed' && saleIdx < allSales.length) {
          allSales[saleIdx].order = order._id;
          saleIdx++;
        }
      }
      await Sale.insertMany(allSales);
      console.log(`   ✓ Created ${totalOrders} orders and ${allSales.length} sales\n`);

      // ============================================
      // 5. PURCHASE ORDERS (matches actual PO schema)
      // ============================================
      console.log('🚚 Creating Purchase Orders...');
      const poData = [];
      let poNum = 5001;

      // Pending POs for low-stock items
      for (const product of lowStock) {
        const reorderQty = product.reorderLevel * 2;
        poData.push({
          poNumber: `PO-${poNum++}`,
          product: product._id,
          productName: product.name,
          suggestedOrderQty: reorderQty,
          estimatedCost: reorderQty * product.price * 0.7,
          status: 'Pending',
          orderDate: new Date()
        });
      }

      // Historical received POs
      for (let i = 0; i < 10; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 200) + 50;
        const receivedDate = daysFromNow(-Math.floor(Math.random() * 60) - 5);
        poData.push({
          poNumber: `PO-${poNum++}`,
          product: product._id,
          productName: product.name,
          suggestedOrderQty: qty,
          estimatedCost: qty * product.price * 0.7,
          status: 'Received',
          orderDate: new Date(receivedDate.getTime() - 7 * 24 * 60 * 60 * 1000),
          receivedAt: receivedDate
        });
      }

      await PurchaseOrder.insertMany(poData);
      console.log(`   ✓ Created ${poData.length} purchase orders\n`);

      // ============================================
      // SUMMARY
      // ============================================
      console.log('═══════════════════════════════════════════════');
      console.log('   ✅ DATA SEEDING COMPLETE!');
      console.log('═══════════════════════════════════════════════\n');
      console.log('📊 Summary:');
      console.log(`   Suppliers:        ${suppliers.length}`);
      console.log(`   Customers:        ${customers.length}`);
      console.log(`   Products:         ${products.length}`);
      console.log(`   Orders:           ${totalOrders}`);
      console.log(`   Sales:            ${allSales.length}`);
      console.log(`   Purchase Orders:  ${poData.length}`);
      console.log(`   Total Revenue:    Rs ${totalRevenue.toLocaleString()}\n`);

      console.log('🤖 AI Prediction Data:');
      console.log(`   ❌ Expired:            ${expired.map(p => p.name).join(', ') || 'None'}`);
      console.log(`   ⏰ Expiring Soon:      ${expiringSoon.map(p => p.name).join(', ') || 'None'}`);
      console.log(`   📉 Low Stock:          ${lowStock.map(p => p.name).join(', ') || 'None'}`);
      console.log(`   📈 Sales History:      6 months (~${totalOrders} orders)`);
      console.log(`   🔄 Pending POs:        ${poData.filter(po => po.status === 'Pending').length}\n`);

      console.log('✨ Dashboard should now show real data!');
      console.log('   Go to AI Analytics → Train Models to activate predictions.\n');

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

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
