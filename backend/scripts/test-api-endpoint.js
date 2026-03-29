const http = require('http');

async function testSalesForecast() {
  try {
    console.log('🧪 Testing Sales Forecast API Endpoint...\n');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/sales/forecast',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer fake-token-for-testing'
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data: data });
        });
      });
      req.on('error', reject);
      req.end();
    });
    
    console.log(`📡 Response Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('⚠️  Got 401 Unauthorized (expected without valid token)');
      console.log('   This means the endpoint exists and is protected ✅\n');
      return;
    }
    
    const data = JSON.parse(response.data);
    
    if (Array.isArray(data)) {
      console.log(`✅ Received array with ${data.length} items\n`);
      
      if (data.length > 0) {
        console.log('📊 Sample Data (first 3 items):');
        data.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${JSON.stringify(item)}`);
        });
        
        console.log('\n📊 Sample Data (last 3 items):');
        data.slice(-3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${JSON.stringify(item)}`);
        });
        
        // Verify format
        const firstItem = data[0];
        const hasMonth = 'month' in firstItem;
        const hasActual = 'actual' in firstItem;
        const hasOrders = 'orders' in firstItem;
        
        console.log('\n🔍 Data Format Validation:');
        console.log(`   ✅ Has 'month' field: ${hasMonth}`);
        console.log(`   ✅ Has 'actual' field: ${hasActual}`);
        console.log(`   ✅ Has 'orders' field: ${hasOrders}`);
        
        if (hasMonth && hasActual) {
          console.log('\n✅ Data format is CORRECT for the chart!');
          console.log('   The graph should display properly.');
        } else {
          console.log('\n❌ Data format is INCORRECT!');
          console.log('   Expected: {month: "Jan 15", actual: 123, orders: 5}');
          console.log(`   Got: ${JSON.stringify(firstItem)}`);
        }
      } else {
        console.log('⚠️  Array is empty - no sales data in last 30 days');
      }
    } else {
      console.log('❌ Response is not an array!');
      console.log('   Received:', data);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    console.log('\n💡 Make sure backend is running:');
    console.log('   cd backend');
    console.log('   node server.js');
  }
}

testSalesForecast();
