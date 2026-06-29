const mysql = require('mysql2/promise');

async function listUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pet_atlas'
  });

  try {
    const [rows] = await connection.execute('SELECT id, username, email, role_id FROM users LIMIT 10');
    console.log('Top 10 users:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await connection.end();
  }
}

listUsers();
