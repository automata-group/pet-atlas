const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'pet_atlas'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    process.exit(1);
  }
  
  connection.query("SELECT * FROM user_subscriptions ORDER BY created_at DESC LIMIT 10", (err, results) => {
    if (err) {
      console.error('Error checking subscriptions:', err);
      connection.end();
      process.exit(1);
    }
    console.log('Subscriptions in local DB:');
    console.table(results);
    connection.end();
    process.exit(0);
  });
});
