const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const jwtSecret = env.WP_JWT_SECRET;
console.log('Using JWT Secret from .env...');

// 1. Generate Administrator Token
const adminPayload = {
  data: {
    user: {
      id: '1',
      user_login: 'admin',
      user_email: 'admin@pet-atlas.com'
    },
    roles: ['administrator']
  }
};
const adminToken = jwt.sign(adminPayload, jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });

// 2. Generate Client Token (To test that non-admins are blocked!)
const clientPayload = {
  data: {
    user: {
      id: '50',
      user_login: 'regular_client',
      user_email: 'client@example.com'
    },
    roles: ['customer']
  }
};
const clientToken = jwt.sign(clientPayload, jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });

const endpoints = [
  { name: 'Auth Admin Test', method: 'GET', url: '/auth/admin-test' },
  { name: 'Auth Admin Users', method: 'GET', url: '/auth/admin/users' },
  { name: 'Auth Admin Stats', method: 'GET', url: '/auth/admin/stats' },
  { name: 'Subscription Admin Stats', method: 'GET', url: '/subscriptions/admin/stats' },
  { name: 'Booking Admin Bookings', method: 'GET', url: '/bookings/admin/all' },
  { name: 'Chat Admin Chats', method: 'GET', url: '/chats/admin/all' },
];

async function runTests() {
  console.log('\n--- TESTING ADMIN ENDPOINTS WITH ADMIN ACCESS ---');
  for (const ep of endpoints) {
    try {
      const response = await axios({
        method: ep.method,
        url: `http://localhost:3000${ep.url}`,
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      console.log(`[PASS] ${ep.name} (${ep.url}) - Status: ${response.status}`);
      if (ep.url.includes('stats') || ep.url.includes('admin-test')) {
        console.log('      Sample Data:', JSON.stringify(response.data).substring(0, 150) + '...');
      }
    } catch (error) {
      console.error(`[FAIL] ${ep.name} (${ep.url}) - Error:`, error.response?.data || error.message);
    }
  }

  console.log('\n--- TESTING ADMIN ENDPOINTS WITH CLIENT ACCESS (SHOULD BE BLOCKED / 403) ---');
  for (const ep of endpoints) {
    try {
      const response = await axios({
        method: ep.method,
        url: `http://localhost:3000${ep.url}`,
        headers: {
          Authorization: `Bearer ${clientToken}`
        }
      });
      console.log(`[WARNING] ${ep.name} (${ep.url}) - Bypass Succeeded (This is a security issue!) Status: ${response.status}`);
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log(`[PASS] ${ep.name} (${ep.url}) - Successfully Blocked (Forbidden/Unauthorized) as expected. Status: ${error.response.status}`);
      } else {
        console.error(`[FAIL] ${ep.name} (${ep.url}) - Unexpected Error:`, error.response?.data || error.message);
      }
    }
  }
}

runTests();
