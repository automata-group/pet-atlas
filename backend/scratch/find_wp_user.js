const mysql = require('mysql2/promise');

async function findWpUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  try {
    const [dbs] = await connection.execute('SHOW DATABASES');
    for (const db of dbs) {
      const dbName = db.Database;
      if (['information_schema', 'mysql', 'performance_schema', 'phpmyadmin', 'test'].includes(dbName)) continue;
      
      try {
        await connection.query(`USE \`${dbName}\``);
        const [tables] = await connection.execute('SHOW TABLES');
        for (const table of tables) {
          const tableName = Object.values(table)[0];
          if (tableName.includes('wp_users')) {
            console.log(`Found wp_users in database: ${dbName}, table: ${tableName}`);
            const [users] = await connection.execute(`SELECT user_login, user_email FROM \`${tableName}\` WHERE user_email = ?`, ['qhhhd@zhh.com']);
            if (users.length > 0) {
              console.log(`USER FOUND in ${dbName}.${tableName}:`, JSON.stringify(users[0], null, 2));
            }
          }
        }
      } catch (e) {
        // Skip inaccessible DBs
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

findWpUsers();
