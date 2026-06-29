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
    console.log('Analyzing "messages" table columns...');
    const [columns] = await connection.query('SHOW COLUMNS FROM messages');
    const columnNames = columns.map(c => c.Field);
    const typeColumn = columns.find(c => c.Field === 'type');
    const messageTypeColumn = columns.find(c => c.Field === 'message_type');

    // 1. Handle renaming/updating message_type to type
    if (messageTypeColumn) {
      console.log('Found "message_type" column. Starting safe conversion...');
      
      // Step A: Modify to VARCHAR to allow any string values safely
      console.log('Step A: Modifying "message_type" to VARCHAR(255)...');
      await connection.query('ALTER TABLE messages MODIFY COLUMN message_type VARCHAR(255) NOT NULL');
      
      // Step B: Capitalize existing values
      console.log('Step B: Capitalizing message types to match the new capitalized enum...');
      await connection.query("UPDATE messages SET message_type = 'Text' WHERE message_type = 'text' OR message_type = 'Text'");
      await connection.query("UPDATE messages SET message_type = 'Voice' WHERE message_type = 'voice' OR message_type = 'Voice'");
      await connection.query("UPDATE messages SET message_type = 'Video' WHERE message_type = 'video' OR message_type = 'Video'");
      // Any other values fallback to Text
      await connection.query("UPDATE messages SET message_type = 'Text' WHERE message_type NOT IN ('Text', 'Photo', 'Voice', 'Video', 'Location')");

      // Step C: Change column name to type and define as ENUM
      console.log('Step C: Renaming "message_type" to "type" and applying ENUM...');
      await connection.query("ALTER TABLE messages CHANGE COLUMN message_type type ENUM('Text', 'Photo', 'Voice', 'Video', 'Location') NOT NULL DEFAULT 'Text'");
      console.log('[+] Successfully converted and renamed "message_type" to "type".');
    } else if (typeColumn) {
      console.log('"type" column already exists. Ensuring correct ENUM types...');
      // Convert type to correct ENUM anyway to ensure alignment
      await connection.query("ALTER TABLE messages MODIFY COLUMN type ENUM('Text', 'Photo', 'Voice', 'Video', 'Location') NOT NULL DEFAULT 'Text'");
      console.log('[+] "type" column ENUM verified/updated.');
    } else {
      console.log('[!] Warning: Neither "message_type" nor "type" found in messages table. Adding "type" column...');
      await connection.query("ALTER TABLE messages ADD COLUMN type ENUM('Text', 'Photo', 'Voice', 'Video', 'Location') NOT NULL DEFAULT 'Text'");
    }

    // 2. Ensure extra columns exist to match Message TypeORM Entity
    const columnsToAdd = [
      { name: 'photo_url', def: 'VARCHAR(255) NULL DEFAULT NULL' },
      { name: 'voice_url', def: 'VARCHAR(255) NULL DEFAULT NULL' },
      { name: 'video_url', def: 'VARCHAR(255) NULL DEFAULT NULL' },
      { name: 'hash', def: 'VARCHAR(255) NULL DEFAULT NULL' }
    ];

    for (const col of columnsToAdd) {
      if (!columnNames.includes(col.name)) {
        console.log(`Adding missing column "${col.name}" to messages table...`);
        await connection.query(`ALTER TABLE messages ADD COLUMN ${col.name} ${col.def}`);
        console.log(`[+] Added column "${col.name}"`);
      } else {
        console.log(`Column "${col.name}" already exists.`);
      }
    }

    console.log('\nMessages table migration successfully completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
