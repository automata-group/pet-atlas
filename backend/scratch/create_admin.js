const mysql = require('mysql2/promise');

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pet_atlas'
  });

  try {
    // Check again
    const [existing] = await connection.execute('SELECT * FROM users WHERE email = ?', ['qhhhd@zhh.com']);
    
    if (existing.length > 0) {
      console.log('User already exists, updating role to 1...');
      await connection.execute('UPDATE users SET role_id = 1 WHERE email = ?', ['qhhhd@zhh.com']);
      console.log('User elevated to Admin.');
    } else {
      console.log('User not found, creating new Admin user...');
      // Get max ID if needed or let it auto-increment
      // Let's check table structure
      const [tableInfo] = await connection.execute('DESCRIBE users');
      const idCol = tableInfo.find(c => c.Field === 'id');
      
      let query;
      let params;
      
      if (idCol && idCol.Extra.includes('auto_increment')) {
        query = 'INSERT INTO users (username, email, role_id) VALUES (?, ?, ?)';
        params = ['qhhhd', 'qhhhd@zhh.com', 1];
      } else {
        // Find next ID
        const [maxIdResult] = await connection.execute('SELECT MAX(id) as maxId FROM users');
        const nextId = (maxIdResult[0].maxId || 0) + 1;
        query = 'INSERT INTO users (id, username, email, role_id) VALUES (?, ?, ?, ?)';
        params = [nextId, 'qhhhd', 'qhhhd@zhh.com', 1];
      }
      
      await connection.execute(query, params);
      console.log('New Admin user created: qhhhd@zhh.com');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createAdmin();
