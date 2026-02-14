const axios = require('axios');

async function testRegistration() {
    try {
        const email = `test_${Date.now()}@example.com`;
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: email,
            password: 'password123',
            organizationName: 'Test Org'
        });
        console.log('Registration Successful:', response.data);
    } catch (error) {
        console.error('Registration Failed:', error.response ? error.response.data : error.message);
    }
}

testRegistration();
