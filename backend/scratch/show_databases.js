const mysql = require('mysql2/promise');

async function showDatabases() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  try {
    const [rows] = await connection.execute('SHOW DATABASES');
    console.log('Databases:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error showing databases:', error);
  } finally {
    await connection.end();
  }
}

showDatabases();
