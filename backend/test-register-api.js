const axios = require('axios');

async function testRegister() {
  const username = `testuser_${Date.now()}`;
  const email = `${username}@example.com`;
  const password = 'Pass123!@#';

  console.log(`Sending registration request for: ${username} (${email})`);

  try {
    const response = await axios.post('http://localhost:3000/auth/register', {
      username,
      email,
      password
    });
    console.log('Registration Response Status:', response.status);
    console.log('Registration Response Data:', response.data);
  } catch (error) {
    console.error('Registration Failed:', error.response?.data || error.message);
  }
}

testRegister();
