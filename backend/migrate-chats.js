const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
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

  const connection = await mysql.createConnection({
    host: env.DATABASE_HOST || 'localhost',
    port: parseInt(env.DATABASE_PORT || '3306', 10),
    user: env.DATABASE_USER || 'root',
    password: env.DATABASE_PASSWORD || '',
    database: env.DATABASE_NAME || 'pet_atlas',
  });

  console.log('Successfully connected to MySQL database.');

  try {
    console.log('Checking and adding missing columns to chat_groups table...');
    
    // Add claimed_by
    try {
      await connection.query('ALTER TABLE chat_groups ADD COLUMN claimed_by BIGINT NULL DEFAULT NULL');
      console.log('[+] Added "claimed_by" column to chat_groups');
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') {
        console.log('[-] "claimed_by" already exists');
      } else {
        throw e;
      }
    }

    // Add claimed_at
    try {
      await connection.query('ALTER TABLE chat_groups ADD COLUMN claimed_at DATETIME NULL DEFAULT NULL');
      console.log('[+] Added "claimed_at" column to chat_groups');
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') {
        console.log('[-] "claimed_at" already exists');
      } else {
        throw e;
      }
    }

    // Add status
    try {
      await connection.query("ALTER TABLE chat_groups ADD COLUMN status ENUM('open', 'archived') DEFAULT 'open'");
      console.log('[+] Added "status" column to chat_groups');
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') {
        console.log('[-] "status" already exists');
      } else {
        throw e;
      }
    }

    // Add closed_at
    try {
      await connection.query('ALTER TABLE chat_groups ADD COLUMN closed_at DATETIME NULL DEFAULT NULL');
      console.log('[+] Added "closed_at" column to chat_groups');
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') {
        console.log('[-] "closed_at" already exists');
      } else {
        throw e;
      }
    }

    console.log('Chat groups migration successfully completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
