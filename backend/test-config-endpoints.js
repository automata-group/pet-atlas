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

// 2. Generate Client Token
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

async function runTests() {
  console.log('\n--- TESTING DIRECTORY CONFIG ENDPOINTS ---');

  // Test 1: Public GET /directory/config
  try {
    const res = await axios.get('http://localhost:3000/directory/config');
    console.log('[PASS] GET /directory/config (Public) succeeded.');
    console.log('       Current Config:', res.data);
  } catch (error) {
    console.error('[FAIL] GET /directory/config (Public) failed:', error.response?.data || error.message);
  }

  // Test 2: Admin updates config to false
  try {
    const res = await axios.post(
      'http://localhost:3000/directory/config',
      { clinicsEnabled: false },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('[PASS] POST /directory/config (Admin -> false) succeeded.');
    console.log('       Response Config:', res.data);
  } catch (error) {
    console.error('[FAIL] POST /directory/config (Admin -> false) failed:', error.response?.data || error.message);
  }

  // Test 3: Public GET /directory/config checks if updated to false
  try {
    const res = await axios.get('http://localhost:3000/directory/config');
    if (res.data.clinicsEnabled === false) {
      console.log('[PASS] GET /directory/config accurately returns clinicsEnabled: false.');
    } else {
      console.error('[FAIL] GET /directory/config did not reflect updated false status:', res.data);
    }
  } catch (error) {
    console.error('[FAIL] GET /directory/config failed:', error.response?.data || error.message);
  }

  // Test 4: Client tries to update config (should be blocked)
  try {
    await axios.post(
      'http://localhost:3000/directory/config',
      { clinicsEnabled: true },
      { headers: { Authorization: `Bearer ${clientToken}` } }
    );
    console.error('[FAIL] POST /directory/config (Client) bypassed security controls! This is a security issue!');
  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log(`[PASS] POST /directory/config (Client) successfully blocked (Status ${error.response.status}).`);
    } else {
      console.error('[FAIL] POST /directory/config (Client) failed with unexpected error:', error.response?.data || error.message);
    }
  }

  // Test 5: Admin updates config back to true
  try {
    const res = await axios.post(
      'http://localhost:3000/directory/config',
      { clinicsEnabled: true },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('[PASS] POST /directory/config (Admin -> true) restored setting succeeded.');
    console.log('       Response Config:', res.data);
  } catch (error) {
    console.error('[FAIL] POST /directory/config (Admin -> true) restoration failed:', error.response?.data || error.message);
  }
}

runTests();
