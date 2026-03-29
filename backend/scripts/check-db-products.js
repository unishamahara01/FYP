require('dotenv').config();
const mongoose = require('mongoose');

const checkDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/meditrust');
    console.log('Connected to DB');
    
    const Product = require('./models/Product');
    const PurchaseOrder = require('./models/PurchaseOrder');
    
    // Find specific PO from user screenshot
    const poNumber = 'PO-1774361806327-103';
    const po = await PurchaseOrder.findOne({ poNumber: poNumber }).populate('product');
    
    if (!po) {
      console.log(`PO ${poNumber} not found`);
      mongoose.disconnect();
      return;
    }
    
    console.log(`\nChecking PO: ${po.poNumber} for product ${po.product ? po.product.name : 'null'}`);
    const error = po.validateSync();
    if (error) {
      console.log('Validation Error:', error.message);
    } else {
      console.log('PO passes validation');
      if (po.product) {
        console.log('Validating product...');
        const prodError = po.product.validateSync();
        if (prodError) console.log('Product Validation Error:', prodError.message);
        else console.log('Product passes validation');
      }
    }
    
    mongoose.disconnect();
  } catch (e) {
    console.error(e);
    mongoose.disconnect();
  }
};

checkDB();
