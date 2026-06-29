const mysql = require('mysql2/promise');

async function searchBroad() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pet_atlas'
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM users');
    const match = rows.find(r => JSON.stringify(r).toLowerCase().includes('qhhhd'));
    if (match) {
      console.log('FOUND MATCH:', JSON.stringify(match, null, 2));
    } else {
      console.log('No user found containing "qhhhd"');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

searchBroad();
