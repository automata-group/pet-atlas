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

// 1. Generate Token for Owner (User ID 79)
const ownerPayload = {
  data: {
    user: {
      id: '79',
      user_login: 'owner_user',
      user_email: 'owner@example.com'
    }
  }
};
const ownerToken = jwt.sign(ownerPayload, jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });

// 2. Generate Token for Non-Owner (User ID 80)
const nonOwnerPayload = {
  data: {
    user: {
      id: '80',
      user_login: 'non_owner_user',
      user_email: 'nonowner@example.com'
    }
  }
};
const nonOwnerToken = jwt.sign(nonOwnerPayload, jwtSecret, { algorithm: 'HS256', expiresIn: '1h' });

const baseUrl = 'http://91.99.108.165:3000';
const petId = 1; // Pet owned by 79

async function runTests() {
  console.log('\n--- TESTING PET MANAGEMENT ENDPOINTS & SECURITY ---');

  // Test 1: Access overview as non-owner (Should fail with 403)
  try {
    console.log(`[TEST] GET /pet-management/${petId}/overview (Non-Owner)...`);
    await axios.get(`${baseUrl}/pet-management/${petId}/overview`, {
      headers: { Authorization: `Bearer ${nonOwnerToken}` }
    });
    console.error('[FAIL] Access was NOT blocked for non-owner!');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log(`[PASS] Access blocked for non-owner (Status 403: ${error.response.data.message})`);
    } else {
      console.error('[FAIL] Unexpected error:', error.response?.data || error.message);
    }
  }

  // Test 2: Access overview as owner (Should pass 200)
  try {
    console.log(`[TEST] GET /pet-management/${petId}/overview (Owner)...`);
    const res = await axios.get(`${baseUrl}/pet-management/${petId}/overview`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    console.log('[PASS] Access allowed for owner (Status 200)');
    console.log('       Overview Keys:', Object.keys(res.data));
  } catch (error) {
    console.error('[FAIL] Access failed for owner:', error.response?.data || error.message);
  }

  // Test 3: Create a diary entry as owner
  let diaryId = null;
  try {
    console.log(`[TEST] POST /pet-management/${petId}/diary (Owner)...`);
    const res = await axios.post(
      `${baseUrl}/pet-management/${petId}/diary`,
      {
        title: 'Morning Walk',
        content: 'Buddy ran around the park and played with other dogs.',
        date: new Date().toISOString()
      },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    console.log('[PASS] Diary entry created (Status 201)');
    diaryId = res.data.id;
  } catch (error) {
    console.error('[FAIL] Failed to create diary entry:', error.response?.data || error.message);
  }

  // Test 4: Create a reminder as owner
  let reminderId = null;
  try {
    console.log(`[TEST] POST /pet-management/${petId}/reminders (Owner)...`);
    const res = await axios.post(
      `${baseUrl}/pet-management/${petId}/reminders`,
      {
        title: 'Deworming Pill',
        type: 'medication',
        dateTime: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      },
      { headers: { Authorization: `Bearer ${ownerToken}` } }
    );
    console.log('[PASS] Reminder created (Status 201)');
    reminderId = res.data.id;
  } catch (error) {
    console.error('[FAIL] Failed to create reminder:', error.response?.data || error.message);
  }

  // Test 5: Verify new logs in overview
  try {
    console.log(`[TEST] GET /pet-management/${petId}/overview after creation (Owner)...`);
    const res = await axios.get(`${baseUrl}/pet-management/${petId}/overview`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    const hasDiary = res.data.recentDiary.some(d => d.id == diaryId);
    const hasReminder = res.data.upcomingReminders.some(r => r.id == reminderId);
    if (hasDiary && hasReminder) {
      console.log('[PASS] Overview successfully contains the new diary and reminder logs!');
    } else {
      console.error('[FAIL] Overview did not return the new logs');
    }
  } catch (error) {
    console.error('[FAIL] Failed to get overview:', error.response?.data || error.message);
  }

  // Test 6: Clean up (Delete diary & reminder)
  if (diaryId) {
    try {
      console.log(`[TEST] DELETE /pet-management/${petId}/diary/${diaryId} (Owner)...`);
      await axios.delete(`${baseUrl}/pet-management/${petId}/diary/${diaryId}`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      console.log('[PASS] Diary entry deleted (Status 200)');
    } catch (error) {
      console.error('[FAIL] Failed to delete diary entry:', error.response?.data || error.message);
    }
  }

  if (reminderId) {
    try {
      console.log(`[TEST] DELETE /pet-management/${petId}/reminders/${reminderId} (Owner)...`);
      await axios.delete(`${baseUrl}/pet-management/${petId}/reminders/${reminderId}`, {
        headers: { Authorization: `Bearer ${ownerToken}` }
      });
      console.log('[PASS] Reminder deleted (Status 200)');
    } catch (error) {
      console.error('[FAIL] Failed to delete reminder:', error.response?.data || error.message);
    }
  }
}

runTests();
