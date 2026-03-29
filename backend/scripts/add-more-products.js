const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meditrust')
  .then(async () => {
    console.log('✓ Connected to MongoDB\n');
    console.log('═══════════════════════════════════════');
    console.log('   ADDING MORE PRODUCTS TO INVENTORY');
    console.log('═══════════════════════════════════════\n');
    
    try {
      // Get existing suppliers
      const suppliers = await Supplier.find().lean();
      
      if (suppliers.length === 0) {
        console.log('❌ No suppliers found! Please run seed-comprehensive-data.js first.');
        process.exit(1);
      }
      
      // Get existing products to avoid duplicates
      const existingProducts = await Product.find().lean();
      const existingNames = existingProducts.map(p => p.name);
      
      console.log(`📊 Current inventory: ${existingProducts.length} products`);
      console.log('');
      
      // Helper function to generate dates
      const getRandomDate = (start, end) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      };
      
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const twoYearsFromNow = new Date(today);
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      
      // Products to add (only those not already in inventory)
      const newProducts = [
        // More Antibiotics
        { name: "Cephalexin 250mg", genericName: "Cephalexin", category: "Antibiotics", manufacturer: "Sun Pharma", quantity: 180, price: 18, reorderLevel: 50 },
        { name: "Doxycycline 100mg", genericName: "Doxycycline", category: "Antibiotics", manufacturer: "Cipla Ltd.", quantity: 220, price: 22, reorderLevel: 60 },
        { name: "Clindamycin 150mg", genericName: "Clindamycin", category: "Antibiotics", manufacturer: "Himalayan Medicines", quantity: 150, price: 28, reorderLevel: 40 },
        { name: "Erythromycin 250mg", genericName: "Erythromycin", category: "Antibiotics", manufacturer: "Sun Pharma", quantity: 190, price: 20, reorderLevel: 50 },
        { name: "Cefixime 200mg", genericName: "Cefixime", category: "Antibiotics", manufacturer: "Cipla Ltd.", quantity: 160, price: 32, reorderLevel: 45 },
        { name: "Norfloxacin 400mg", genericName: "Norfloxacin", category: "Antibiotics", manufacturer: "Himalayan Medicines", quantity: 140, price: 24, reorderLevel: 40 },
        
        // More Painkillers
        { name: "Aspirin 150mg", genericName: "Acetylsalicylic Acid", category: "Painkillers", manufacturer: "Bayer", quantity: 380, price: 7, reorderLevel: 100 },
        { name: "Naproxen 250mg", genericName: "Naproxen", category: "Painkillers", manufacturer: "Sun Pharma", quantity: 210, price: 14, reorderLevel: 60 },
        { name: "Tramadol 50mg", genericName: "Tramadol", category: "Painkillers", manufacturer: "Cipla Ltd.", quantity: 120, price: 35, reorderLevel: 30 },
        { name: "Ketorolac 10mg", genericName: "Ketorolac", category: "Painkillers", manufacturer: "Himalayan Medicines", quantity: 95, price: 26, reorderLevel: 25 },
        { name: "Mefenamic Acid 250mg", genericName: "Mefenamic Acid", category: "Painkillers", manufacturer: "Sun Pharma", quantity: 170, price: 16, reorderLevel: 50 },
        
        // Diabetes
        { name: "Metformin 850mg", genericName: "Metformin HCl", category: "Diabetes", manufacturer: "Cipla Ltd.", quantity: 290, price: 14, reorderLevel: 70 },
        { name: "Glimepiride 1mg", genericName: "Glimepiride", category: "Diabetes", manufacturer: "Sun Pharma", quantity: 180, price: 16, reorderLevel: 50 },
        { name: "Glibenclamide 5mg", genericName: "Glibenclamide", category: "Diabetes", manufacturer: "Himalayan Medicines", quantity: 160, price: 12, reorderLevel: 45 },
        { name: "Sitagliptin 50mg", genericName: "Sitagliptin", category: "Diabetes", manufacturer: "Sun Pharma", quantity: 110, price: 45, reorderLevel: 30 },
        { name: "Insulin Glargine 100IU/ml", genericName: "Insulin Glargine", category: "Diabetes", manufacturer: "Novo Nordisk", quantity: 45, price: 850, reorderLevel: 15 },
        { name: "Insulin Regular 100IU/ml", genericName: "Insulin Regular", category: "Diabetes", manufacturer: "Novo Nordisk", quantity: 38, price: 720, reorderLevel: 12 },
        
        // Heart & Blood Pressure
        { name: "Atorvastatin 20mg", genericName: "Atorvastatin", category: "Heart & Blood Pressure", manufacturer: "Pfizer", quantity: 280, price: 26, reorderLevel: 70 },
        { name: "Amlodipine 10mg", genericName: "Amlodipine", category: "Heart & Blood Pressure", manufacturer: "Sun Pharma", quantity: 240, price: 19, reorderLevel: 60 },
        { name: "Losartan 50mg", genericName: "Losartan", category: "Heart & Blood Pressure", manufacturer: "Cipla Ltd.", quantity: 220, price: 22, reorderLevel: 55 },
        { name: "Enalapril 5mg", genericName: "Enalapril", category: "Heart & Blood Pressure", manufacturer: "Himalayan Medicines", quantity: 190, price: 15, reorderLevel: 50 },
        { name: "Bisoprolol 5mg", genericName: "Bisoprolol", category: "Heart & Blood Pressure", manufacturer: "Sun Pharma", quantity: 170, price: 20, reorderLevel: 45 },
        { name: "Carvedilol 6.25mg", genericName: "Carvedilol", category: "Heart & Blood Pressure", manufacturer: "Cipla Ltd.", quantity: 150, price: 24, reorderLevel: 40 },
        { name: "Clopidogrel 75mg", genericName: "Clopidogrel", category: "Heart & Blood Pressure", manufacturer: "Sun Pharma", quantity: 200, price: 28, reorderLevel: 50 },
        { name: "Digoxin 0.25mg", genericName: "Digoxin", category: "Heart & Blood Pressure", manufacturer: "Himalayan Medicines", quantity: 85, price: 18, reorderLevel: 25 },
        { name: "Furosemide 40mg", genericName: "Furosemide", category: "Heart & Blood Pressure", manufacturer: "Cipla Ltd.", quantity: 210, price: 12, reorderLevel: 55 },
        
        // Digestive
        { name: "Omeprazole 40mg", genericName: "Omeprazole", category: "Digestive", manufacturer: "AstraZeneca", quantity: 320, price: 14, reorderLevel: 80 },
        { name: "Pantoprazole 40mg", genericName: "Pantoprazole", category: "Digestive", manufacturer: "Sun Pharma", quantity: 280, price: 16, reorderLevel: 70 },
        { name: "Esomeprazole 40mg", genericName: "Esomeprazole", category: "Digestive", manufacturer: "Cipla Ltd.", quantity: 240, price: 18, reorderLevel: 60 },
        { name: "Domperidone 10mg", genericName: "Domperidone", category: "Digestive", manufacturer: "Himalayan Medicines", quantity: 260, price: 11, reorderLevel: 65 },
        { name: "Ondansetron 4mg", genericName: "Ondansetron", category: "Digestive", manufacturer: "Sun Pharma", quantity: 180, price: 22, reorderLevel: 45 },
        { name: "Loperamide 2mg", genericName: "Loperamide", category: "Digestive", manufacturer: "Cipla Ltd.", quantity: 200, price: 9, reorderLevel: 50 },
        { name: "Antacid Syrup 200ml", genericName: "Aluminum Hydroxide", category: "Digestive", manufacturer: "Himalayan Medicines", quantity: 150, price: 45, reorderLevel: 40 },
        
        // Respiratory
        { name: "Loratadine 10mg", genericName: "Loratadine", category: "Respiratory", manufacturer: "Sun Pharma", quantity: 340, price: 8, reorderLevel: 85 },
        { name: "Salbutamol Inhaler 100mcg", genericName: "Salbutamol", category: "Respiratory", manufacturer: "GSK", quantity: 75, price: 180, reorderLevel: 20 },
        { name: "Budesonide Inhaler 200mcg", genericName: "Budesonide", category: "Respiratory", manufacturer: "AstraZeneca", quantity: 55, price: 320, reorderLevel: 15 },
        { name: "Ambroxol 30mg", genericName: "Ambroxol", category: "Respiratory", manufacturer: "Cipla Ltd.", quantity: 220, price: 13, reorderLevel: 55 },
        { name: "Chlorpheniramine 4mg", genericName: "Chlorpheniramine", category: "Respiratory", manufacturer: "Himalayan Medicines", quantity: 280, price: 6, reorderLevel: 70 },
        { name: "Pseudoephedrine 60mg", genericName: "Pseudoephedrine", category: "Respiratory", manufacturer: "Sun Pharma", quantity: 190, price: 11, reorderLevel: 50 },
        
        // Vitamins
        { name: "Vitamin D3 1000 IU", genericName: "Cholecalciferol", category: "Vitamins", manufacturer: "Nature Made", quantity: 420, price: 12, reorderLevel: 110 },
        { name: "Vitamin B Complex", genericName: "B Vitamins", category: "Vitamins", manufacturer: "Sun Pharma", quantity: 380, price: 14, reorderLevel: 95 },
        { name: "Vitamin E 400 IU", genericName: "Tocopherol", category: "Vitamins", manufacturer: "Himalayan Medicines", quantity: 290, price: 18, reorderLevel: 75 },
        { name: "Calcium 500mg", genericName: "Calcium Carbonate", category: "Vitamins", manufacturer: "Cipla Ltd.", quantity: 350, price: 11, reorderLevel: 90 },
        { name: "Iron 65mg", genericName: "Ferrous Sulfate", category: "Vitamins", manufacturer: "Sun Pharma", quantity: 260, price: 9, reorderLevel: 65 },
        { name: "Zinc 50mg", genericName: "Zinc Sulfate", category: "Vitamins", manufacturer: "Himalayan Medicines", quantity: 310, price: 10, reorderLevel: 80 },
        { name: "Omega-3 Fish Oil 1000mg", genericName: "Omega-3 Fatty Acids", category: "Vitamins", manufacturer: "Nature Made", quantity: 180, price: 35, reorderLevel: 45 },
        { name: "Folic Acid 5mg", genericName: "Folic Acid", category: "Vitamins", manufacturer: "Cipla Ltd.", quantity: 270, price: 8, reorderLevel: 70 },
        
        // Antacids
        { name: "Digene Gel 200ml", genericName: "Magnesium Hydroxide", category: "Antacids", manufacturer: "Abbott", quantity: 140, price: 85, reorderLevel: 35 },
        { name: "Eno Powder 5g", genericName: "Sodium Bicarbonate", category: "Antacids", manufacturer: "GSK", quantity: 250, price: 15, reorderLevel: 65 },
        { name: "Gelusil Syrup 200ml", genericName: "Aluminum Hydroxide", category: "Antacids", manufacturer: "Pfizer", quantity: 120, price: 75, reorderLevel: 30 },
        { name: "Pancreatin Tablets", genericName: "Pancreatin", category: "Antacids", manufacturer: "Sun Pharma", quantity: 160, price: 22, reorderLevel: 40 },
        
        // Antiseptics
        { name: "Hydrogen Peroxide 100ml", genericName: "Hydrogen Peroxide", category: "Antiseptics", manufacturer: "Local Pharma", quantity: 180, price: 35, reorderLevel: 45 },
        { name: "Dettol Liquid 500ml", genericName: "Chloroxylenol", category: "Antiseptics", manufacturer: "Reckitt Benckiser", quantity: 95, price: 180, reorderLevel: 25 },
        { name: "Neosporin Ointment 5g", genericName: "Neomycin", category: "Antiseptics", manufacturer: "Johnson & Johnson", quantity: 140, price: 65, reorderLevel: 35 },
        { name: "Clotrimazole Cream 15g", genericName: "Clotrimazole", category: "Antiseptics", manufacturer: "Cipla Ltd.", quantity: 160, price: 55, reorderLevel: 40 },
        { name: "Hydrocortisone Cream 15g", genericName: "Hydrocortisone", category: "Antiseptics", manufacturer: "Sun Pharma", quantity: 130, price: 48, reorderLevel: 35 },
        { name: "Mupirocin Ointment 5g", genericName: "Mupirocin", category: "Antiseptics", manufacturer: "GSK", quantity: 110, price: 72, reorderLevel: 30 },
        
        // Cold & Flu
        { name: "Paracetamol + Caffeine", genericName: "Paracetamol + Caffeine", category: "Cold & Flu", manufacturer: "Cipla Ltd.", quantity: 320, price: 8, reorderLevel: 80 },
        { name: "Cold Relief Tablets", genericName: "Multi-ingredient", category: "Cold & Flu", manufacturer: "Sun Pharma", quantity: 280, price: 12, reorderLevel: 70 },
        { name: "Sinarest Tablets", genericName: "Paracetamol + Phenylephrine", category: "Cold & Flu", manufacturer: "Centaur Pharma", quantity: 240, price: 10, reorderLevel: 60 },
        { name: "Vicks Vaporub 50ml", genericName: "Camphor + Menthol", category: "Cold & Flu", manufacturer: "P&G", quantity: 150, price: 95, reorderLevel: 40 },
        
        // Mental Health
        { name: "Fluoxetine 20mg", genericName: "Fluoxetine", category: "Mental Health", manufacturer: "Eli Lilly", quantity: 85, price: 42, reorderLevel: 25 },
        { name: "Sertraline 50mg", genericName: "Sertraline", category: "Mental Health", manufacturer: "Pfizer", quantity: 75, price: 38, reorderLevel: 20 },
        { name: "Escitalopram 10mg", genericName: "Escitalopram", category: "Mental Health", manufacturer: "Cipla Ltd.", quantity: 90, price: 45, reorderLevel: 25 },
        { name: "Alprazolam 0.5mg", genericName: "Alprazolam", category: "Mental Health", manufacturer: "Sun Pharma", quantity: 110, price: 18, reorderLevel: 30 },
        { name: "Clonazepam 0.5mg", genericName: "Clonazepam", category: "Mental Health", manufacturer: "Roche", quantity: 95, price: 22, reorderLevel: 25 },
        { name: "Diazepam 5mg", genericName: "Diazepam", category: "Mental Health", manufacturer: "Himalayan Medicines", quantity: 105, price: 16, reorderLevel: 30 },
        
        // Thyroid
        { name: "Levothyroxine 50mcg", genericName: "Levothyroxine", category: "Thyroid", manufacturer: "Abbott", quantity: 180, price: 28, reorderLevel: 45 },
        { name: "Levothyroxine 100mcg", genericName: "Levothyroxine", category: "Thyroid", manufacturer: "Abbott", quantity: 160, price: 32, reorderLevel: 40 },
        { name: "Carbimazole 5mg", genericName: "Carbimazole", category: "Thyroid", manufacturer: "Sun Pharma", quantity: 95, price: 35, reorderLevel: 25 },
        
        // Eye & Ear Care
        { name: "Moxifloxacin Eye Drops 5ml", genericName: "Moxifloxacin", category: "Eye & Ear Care", manufacturer: "Alcon", quantity: 65, price: 120, reorderLevel: 18 },
        { name: "Timolol Eye Drops 5ml", genericName: "Timolol", category: "Eye & Ear Care", manufacturer: "Bausch & Lomb", quantity: 55, price: 95, reorderLevel: 15 },
        { name: "Artificial Tears 10ml", genericName: "Carboxymethylcellulose", category: "Eye & Ear Care", manufacturer: "Allergan", quantity: 85, price: 75, reorderLevel: 22 },
        { name: "Ciprofloxacin Ear Drops 10ml", genericName: "Ciprofloxacin", category: "Eye & Ear Care", manufacturer: "Cipla Ltd.", quantity: 70, price: 85, reorderLevel: 20 },
        
        // Contraceptives
        { name: "Oral Contraceptive Pills", genericName: "Ethinyl Estradiol + Levonorgestrel", category: "Contraceptives", manufacturer: "Bayer", quantity: 120, price: 65, reorderLevel: 30 },
        { name: "Emergency Contraceptive", genericName: "Levonorgestrel", category: "Contraceptives", manufacturer: "Cipla Ltd.", quantity: 95, price: 45, reorderLevel: 25 },
        
        // Skin Care
        { name: "Tretinoin Cream 0.025%", genericName: "Tretinoin", category: "Skin Care", manufacturer: "Johnson & Johnson", quantity: 75, price: 180, reorderLevel: 20 },
        { name: "Benzoyl Peroxide Gel 2.5%", genericName: "Benzoyl Peroxide", category: "Skin Care", manufacturer: "Galderma", quantity: 85, price: 150, reorderLevel: 22 },
        { name: "Calamine Lotion 100ml", genericName: "Calamine", category: "Skin Care", manufacturer: "Local Pharma", quantity: 140, price: 55, reorderLevel: 35 },
        { name: "Moisturizing Cream 50g", genericName: "Glycerin + Paraffin", category: "Skin Care", manufacturer: "Nivea", quantity: 160, price: 95, reorderLevel: 40 },
        
        // Other
        { name: "Antihistamine Tablets", genericName: "Diphenhydramine", category: "Other", manufacturer: "Sun Pharma", quantity: 220, price: 14, reorderLevel: 55 },
        { name: "Antifungal Cream 15g", genericName: "Miconazole", category: "Other", manufacturer: "Cipla Ltd.", quantity: 130, price: 68, reorderLevel: 35 },
        { name: "Oral Rehydration Salts", genericName: "ORS", category: "Other", manufacturer: "WHO Formula", quantity: 280, price: 8, reorderLevel: 70 },
        { name: "Activated Charcoal 250mg", genericName: "Activated Charcoal", category: "Other", manufacturer: "Himalayan Medicines", quantity: 95, price: 22, reorderLevel: 25 },
        { name: "Glycerin Suppository", genericName: "Glycerin", category: "Other", manufacturer: "Local Pharma", quantity: 110, price: 18, reorderLevel: 30 }
      ];
      
      // Filter out products that already exist
      const productsToAdd = newProducts.filter(p => !existingNames.includes(p.name));
      
      console.log(`📦 Adding ${productsToAdd.length} new products...\n`);
      
      let addedCount = 0;
      let batchCounter = 1000;
      
      for (const productData of productsToAdd) {
        // Random supplier
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        
        // Generate dates
        const manufactureDate = getRandomDate(oneYearAgo, today);
        const expiryDate = getRandomDate(today, twoYearsFromNow);
        
        // Generate unique batch number
        const batchNumber = `${productData.category.substring(0, 3).toUpperCase()}-2024-${String(batchCounter++).padStart(3, '0')}`;
        
        try {
          await Product.create({
            ...productData,
            batchNumber,
            manufactureDate,
            expiryDate,
            supplier: supplier._id
          });
          
          addedCount++;
          console.log(`✓ Added: ${productData.name}`);
        } catch (error) {
          console.log(`✗ Failed to add ${productData.name}: ${error.message}`);
        }
      }
      
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('✅ PRODUCTS ADDED SUCCESSFULLY!');
      console.log('═══════════════════════════════════════\n');
      
      const finalCount = await Product.countDocuments();
      
      console.log('📊 Updated Inventory:');
      console.log(`   Total Products: ${finalCount}`);
      console.log(`   New Products Added: ${addedCount}`);
      console.log('');
      
      console.log('💡 All 80+ medicines are now in your inventory!');
      console.log('   Refresh your dashboard to see them.');
      console.log('');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error adding products:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
