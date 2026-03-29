const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/meditrust')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function testAIPrediction() {
  try {
    const products = await Product.find({ expiryDate: { $exists: true } })
      .select('name quantity price expiryDate')
      .lean();

    console.log(`\n📦 Found ${products.length} products with expiry dates\n`);

    const now = new Date();
    const predictions = [];

    for (const product of products) {
      const expiryDate = new Date(product.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

      // Only analyze products expiring within 90 days
      if (daysUntilExpiry <= 90) {
        const stockValue = product.quantity * product.price;

        // AI Scoring Algorithm
        let expiryScore = 0;
        if (daysUntilExpiry <= 0) expiryScore = 40;
        else if (daysUntilExpiry <= 15) expiryScore = 40;
        else if (daysUntilExpiry <= 30) expiryScore = 35;
        else if (daysUntilExpiry <= 60) expiryScore = 25;
        else expiryScore = 15;

        let stockScore = 0;
        if (product.quantity > 500) stockScore = 30;
        else if (product.quantity > 100) stockScore = 25;
        else if (product.quantity > 50) stockScore = 20;
        else if (product.quantity > 10) stockScore = 10;

        let valueScore = 0;
        if (stockValue > 20000) valueScore = 30;
        else if (stockValue > 10000) valueScore = 25;
        else if (stockValue > 5000) valueScore = 20;
        else if (stockValue > 2000) valueScore = 15;
        else if (stockValue > 500) valueScore = 10;

        const riskScore = Math.round(expiryScore + stockScore + valueScore);

        let riskLevel, urgency, recommendation;
        if (riskScore >= 70) {
          riskLevel = 'Critical';
          urgency = 'critical';
          if (daysUntilExpiry <= 0) recommendation = 'EXPIRED - Remove immediately from inventory';
          else if (daysUntilExpiry <= 7) recommendation = 'Urgent: Offer 30-50% discount or donate';
          else recommendation = 'High priority: Promote with 20-30% discount';
        } else if (riskScore >= 50) {
          riskLevel = 'High';
          urgency = 'high';
          recommendation = 'Promote product with 15-20% discount';
        } else if (riskScore >= 30) {
          riskLevel = 'Medium';
          urgency = 'medium';
          recommendation = 'Monitor closely, consider 10% discount';
        } else {
          riskLevel = 'Low';
          urgency = 'low';
          recommendation = 'Continue normal sales';
        }

        predictions.push({
          productName: product.name,
          daysUntilExpiry,
          currentStock: product.quantity,
          stockValue,
          riskScore,
          riskLevel,
          urgency,
          recommendation
        });

        console.log(`📊 ${product.name}`);
        console.log(`   Days until expiry: ${daysUntilExpiry}`);
        console.log(`   Stock: ${product.quantity}, Value: Rs ${stockValue}`);
        console.log(`   Risk Score: ${riskScore}/100 - ${riskLevel} Risk`);
        console.log(`   Recommendation: ${recommendation}\n`);
      }
    }

    predictions.sort((a, b) => b.riskScore - a.riskScore);

    const criticalRisk = predictions.filter(p => p.riskScore >= 70).length;
    const highRisk = predictions.filter(p => p.riskScore >= 50 && p.riskScore < 70).length;
    const totalValueAtRisk = predictions.reduce((sum, p) => sum + p.stockValue, 0);

    console.log('\n' + '='.repeat(60));
    console.log('📈 AI PREDICTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total products analyzed: ${products.length}`);
    console.log(`Products expiring within 90 days: ${predictions.length}`);
    console.log(`Critical Risk items: ${criticalRisk}`);
    console.log(`High Risk items: ${highRisk}`);
    console.log(`Total value at risk: Rs ${totalValueAtRisk.toLocaleString()}`);
    console.log('='.repeat(60));

    if (criticalRisk > 0) {
      console.log('\n✅ AI ALERT SHOULD SHOW - Critical risk items detected!');
    } else {
      console.log('\n❌ AI ALERT WILL NOT SHOW - No critical risk items');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAIPrediction();
