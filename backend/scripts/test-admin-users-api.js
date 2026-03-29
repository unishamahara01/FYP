const { default: fetch } = require('node-fetch');

async function testUsersAPI() {
  try {
    console.log('🔐 Testing Admin Users API...');
    
    // Login as cherry
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'cherry01@gmail.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful as:', loginData.user.fullName, '- Role:', loginData.user.role);

    // Test users API
    console.log('\n👥 Testing /api/admin/users endpoint...');
    const usersResponse = await fetch('http://localhost:3001/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', usersResponse.status);
    console.log('Response ok:', usersResponse.ok);

    if (!usersResponse.ok) {
      const errorText = await usersResponse.text();
      console.error('❌ Users API failed:', errorText);
      return;
    }

    const usersData = await usersResponse.json();
    console.log('✅ Users API successful');
    console.log('Response structure:', Object.keys(usersData));
    console.log('Users array exists:', !!usersData.users);
    console.log('Users count:', usersData.users ? usersData.users.length : 'No users array');
    
    if (usersData.users) {
      console.log('\n📋 Users found:');
      usersData.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName} (${user.email}) - Role: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUsersAPI();