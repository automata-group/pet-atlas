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

// 1. Generate Consultant Token (Role 2)
const consultantPayload = {
  data: {
    user: {
      id: '2', // Default vet/consultant ID
      user_login: 'vet_consultant',
      user_email: 'consultant@pet-atlas.com'
    },
    roles: ['veterinarian'] // Maps to Role 2 (Consultant)
  }
};
const consultantToken = jwt.sign(consultantPayload, jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });

// 2. Generate Client Token (Role 5)
const clientPayload = {
  data: {
    user: {
      id: '50',
      user_login: 'regular_client',
      user_email: 'client@example.com'
    },
    roles: ['customer'] // Maps to Role 5 (Client)
  }
};
const clientToken = jwt.sign(clientPayload, jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });

async function runTests() {
  console.log('\n--- TESTING CONSULTANT ACCESS (ROLE 2) ---');
  
  // 1. Auth check (Should pass)
  try {
    const res = await axios.get('http://localhost:3000/auth/consultant-check', {
      headers: { Authorization: `Bearer ${consultantToken}` }
    });
    console.log('[PASS] Auth Consultant Check - Status:', res.status);
  } catch (error) {
    console.error('[FAIL] Auth Consultant Check - Error:', error.response?.data || error.message);
  }

  // 2. Booking consultant bookings (Should be blocked / 403)
  try {
    const res = await axios.get('http://localhost:3000/bookings/consultant', {
      headers: { Authorization: `Bearer ${consultantToken}` }
    });
    console.log('[WARNING] Booking Consultant Bookings - Succeeded (Expected 403 Block)! Status:', res.status);
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('[PASS] Booking Consultant Bookings - Successfully Blocked (Forbidden) as expected. Status: 403');
    } else {
      console.error('[FAIL] Booking Consultant Bookings - Unexpected Error:', error.response?.data || error.message);
    }
  }

  // 3. Booking patch status (Should be blocked / 403)
  try {
    const res = await axios.patch('http://localhost:3000/bookings/9999/status', { status: 'CONFIRMED' }, {
      headers: { Authorization: `Bearer ${consultantToken}` }
    });
    console.log('[WARNING] Booking Patch Status - Succeeded (Expected 403 Block)! Status:', res.status);
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('[PASS] Booking Patch Status - Successfully Blocked (Forbidden) as expected. Status: 403');
    } else {
      console.error('[FAIL] Booking Patch Status - Unexpected Error:', error.response?.data || error.message);
    }
  }

  console.log('\n--- TESTING CLIENT ACCESS (ROLE 5) ---');
  
  // 1. Auth check (Should be blocked)
  try {
    const res = await axios.get('http://localhost:3000/auth/consultant-check', {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    console.log('[WARNING] Client Auth Check - Succeeded (Expected 403 Block)! Status:', res.status);
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('[PASS] Client Auth Check - Successfully Blocked (Forbidden) as expected. Status: 403');
    } else {
      console.error('[FAIL] Client Auth Check - Unexpected Error:', error.response?.data || error.message);
    }
  }
}

runTests();
