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

async function runTests() {
  console.log('\n--- TESTING CLINICS SECURITY BLOCK ---');

  // Step A: Disable Clinics
  try {
    const res = await axios.post(
      'http://localhost:3000/directory/config',
      { clinicsEnabled: false },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('[STEP A] Admin disabled clinics. Current setting:', res.data);
  } catch (error) {
    console.error('[FAIL] Failed to disable clinics:', error.response?.data || error.message);
    return;
  }

  // Step B: Attempt to fetch directory listings while disabled (should fail 403)
  try {
    console.log('Testing GET /directory (should return 403 Forbidden)...');
    await axios.get('http://localhost:3000/directory');
    console.error('[FAIL] GET /directory succeeded despite clinics being disabled! Security flaw!');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('[PASS] GET /directory blocked with 403 Forbidden.');
      console.log('       Error details:', error.response.data);
    } else {
      console.error('[FAIL] GET /directory returned unexpected status/error:', error.response?.status, error.response?.data || error.message);
    }
  }

  // Step C: Attempt to fetch nearest clinics while disabled (should fail 403)
  try {
    console.log('Testing GET /directory/nearest (should return 403 Forbidden)...');
    await axios.get('http://localhost:3000/directory/nearest?type=clinic&lat=30.0&lon=31.0&radius=50000');
    console.error('[FAIL] GET /directory/nearest succeeded despite clinics being disabled! Security flaw!');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('[PASS] GET /directory/nearest blocked with 403 Forbidden.');
    } else {
      console.error('[FAIL] GET /directory/nearest returned unexpected status/error:', error.response?.status, error.response?.data || error.message);
    }
  }

  // Step D: Re-enable Clinics
  try {
    const res = await axios.post(
      'http://localhost:3000/directory/config',
      { clinicsEnabled: true },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('[STEP D] Admin restored (enabled) clinics. Current setting:', res.data);
  } catch (error) {
    console.error('[FAIL] Failed to re-enable clinics:', error.response?.data || error.message);
    return;
  }

  // Step E: Verify listings fetch works normally after enabling
  try {
    console.log('Testing GET /directory after re-enabling (should succeed)...');
    const res = await axios.get('http://localhost:3000/directory');
    console.log('[PASS] GET /directory succeeded successfully! Listings fetched:', res.data.length);
  } catch (error) {
    console.error('[FAIL] GET /directory failed after clinics were enabled:', error.response?.data || error.message);
  }
}

runTests();
