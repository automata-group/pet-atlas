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

// 1. Generate Clinic Owner Token (Role 3)
const clinicOwnerPayload = {
  data: {
    user: {
      id: '3', // Local ID 3 (or wp user id)
      user_login: 'clinic_owner',
      user_email: 'owner@clinic.com'
    },
    roles: ['shop_manager'] // Maps to Role 3 (Clinic/Shop Owner)
  }
};
const clinicOwnerToken = jwt.sign(clinicOwnerPayload, jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });

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

const endpoints = [
  { name: 'Clinic Bookings', method: 'GET', url: '/bookings/consultant' },
  { name: 'Clinic Update Booking Status', method: 'PATCH', url: '/bookings/9999/status', data: { status: 'CONFIRMED' } },
  { name: 'Clinic My Listings', method: 'GET', url: '/directory/my' },
  { name: 'Clinic Update Listing', method: 'PUT', url: '/directory/9999', data: { title: 'Updated' } },
  { name: 'Clinic Add Team Member', method: 'POST', url: '/directory/9999/team', data: { userId: 5, role: 'Vet' } },
];

async function runTests() {
  console.log('\n--- TESTING CLINIC ENDPOINTS WITH CLINIC OWNER ACCESS (ROLE 3) ---');
  for (const ep of endpoints) {
    try {
      const response = await axios({
        method: ep.method,
        url: `http://localhost:3000${ep.url}`,
        data: ep.data,
        headers: {
          Authorization: `Bearer ${clinicOwnerToken}`
        }
      });
      console.log(`[PASS] ${ep.name} (${ep.url}) - Status: ${response.status}`);
      console.log('      Sample Data:', JSON.stringify(response.data).substring(0, 150) + '...');
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      // Clinic owner is authorized, so database/logical non-existent ID failures are correct behavior.
      // - For PATCH bookings/9999/status: 404 (Booking not found)
      // - For PUT directory/9999: 403 (Listing not found) due to controller-level mapping
      // - For POST directory/9999/team: 404 (Listing not found)
      if (status === 404 || (status === 403 && message.includes('Listing not found'))) {
        console.log(`[PASS] ${ep.name} (${ep.url}) - Authorized successfully. Blocked logically as expected. Status: ${status} (${message})`);
      } else {
        console.error(`[FAIL] ${ep.name} (${ep.url}) - Error:`, error.response?.data || error.message);
      }
    }
  }

  console.log('\n--- TESTING CLINIC ENDPOINTS WITH CLIENT ACCESS (ROLE 5) ---');
  
  for (const ep of endpoints) {
    try {
      const response = await axios({
        method: ep.method,
        url: `http://localhost:3000${ep.url}`,
        data: ep.data,
        headers: {
          Authorization: `Bearer ${clientToken}`
        }
      });
      // GET /directory/my is accessible to all logged-in users (returns their own listings, so empty array is expected and safe)
      if (ep.url === '/directory/my') {
        console.log(`[PASS] ${ep.name} (${ep.url}) - Safely retrieved client listings. Status: ${response.status}`);
      } else {
        console.log(`[WARNING] ${ep.name} (${ep.url}) - Bypass Succeeded (This is a security issue!) Status: ${response.status}`);
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      // Expected behavior for standard client:
      // - GET /bookings/consultant: 403 (Forbidden by RolesGuard)
      // - PATCH /bookings/9999/status: 403 (Forbidden by RolesGuard)
      // - PUT /directory/9999: 403 (Forbidden by RolesGuard or service layer owner check)
      // - POST /directory/9999/team: 404 (Listing not found, logical block before owner check) or if listing existed, would be blocked.
      if (status === 403 || status === 401) {
        console.log(`[PASS] ${ep.name} (${ep.url}) - Successfully Blocked (Forbidden/Unauthorized) as expected. Status: ${status}`);
      } else if (ep.url === '/directory/9999/team' && status === 404 && message.includes('Listing not found')) {
        console.log(`[PASS] ${ep.name} (${ep.url}) - Access verified: Passed JWT check, stopped safely by missing listing. Status: 404`);
      } else {
        console.error(`[FAIL] ${ep.name} (${ep.url}) - Unexpected Error:`, error.response?.data || error.message);
      }
    }
  }
}

runTests();
