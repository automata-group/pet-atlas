const axios = require('axios');

async function testUsers() {
    try {
        const res = await axios.get('http://localhost:3000/auth/admin/users');
        console.log('Success:', res.data.length, 'users');
    } catch (e) {
        console.error('Error Status:', e.response?.status);
        console.error('Error Data:', e.response?.data);
    }
}

testUsers();
