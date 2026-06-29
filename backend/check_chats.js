const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });

  const connection = await mysql.createConnection({
    host: env.DATABASE_HOST || 'localhost',
    port: parseInt(env.DATABASE_PORT || '3306', 10),
    user: env.DATABASE_USER || 'root',
    password: env.DATABASE_PASSWORD || '',
    database: env.DATABASE_NAME || 'pet_atlas',
  });

  try {
    const [rows] = await connection.query('SELECT * FROM chat_groups');
    console.log('Existing chat groups:');
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error querying chat_groups:', error);
  } finally {
    await connection.end();
  }
}

main();
