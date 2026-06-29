const mysql = require('mysql2/promise');

async function searchUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pet_atlas'
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM users WHERE email LIKE ? OR username LIKE ?', ['%qhhhd%', '%qhhhd%']);
    console.log('Search result:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error searching user:', error);
  } finally {
    await connection.end();
  }
}

searchUser();
