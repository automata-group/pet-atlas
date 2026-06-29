const mysql = require('mysql2/promise');

async function checkUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pet_atlas'
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', ['qhhhd@zhh.com']);
    console.log('User check result:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await connection.end();
  }
}

checkUser();
