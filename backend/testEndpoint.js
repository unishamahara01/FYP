const fetch = require('node-fetch');

async function testEndpoint() {
  try {
    // First, login to get a valid token
    console.log('🔐 Logging in...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'unishamahara01@gmail.com',
        password: 'password123'
      })
    });
    
    if (!loginRes.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    const loginData = await loginRes.json();
    console.log('✅ Login successful');
    console.log('Token:', loginData.token.substring(0, 20) + '...');
    
    const token = loginData.token;
    
    // Test AI endpoint immediately
    console.log('\n🤖 Testing AI Expiry Prediction endpoint...');
    const aiRes = await fetch('http://localhost:3001/api/ai/expiry-prediction', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', aiRes.status);
    
    if (aiRes.ok) {
      const aiData = await aiRes.json();
      console.log('\n✅ AI Endpoint Working!');
      console.log('Critical Risk Items:', aiData.criticalRisk);
      console.log('High Risk Items:', aiData.highRisk);
      console.log('Total Value at Risk: Rs', aiData.totalValueAtRisk);
      console.log('Total Predictions:', aiData.predictions?.length || 0);
      
      if (aiData.predictions && aiData.predictions.length > 0) {
        console.log('\nTop 3 Predictions:');
        aiData.predictions.slice(0, 3).forEach((pred, i) => {
          console.log(`${i + 1}. ${pred.productName} - Risk: ${pred.riskScore}/100 (${pred.riskLevel})`);
        });
      }
    } else {
      console.log('❌ AI Endpoint Failed');
      const error = await aiRes.text();
      console.log('Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEndpoint();
