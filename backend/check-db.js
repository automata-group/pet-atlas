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
  console.log('Connected to MySQL.');

  connection.query("SHOW COLUMNS FROM user_subscriptions", (err, results) => {
    if (err) {
      console.error('Error checking columns of user_subscriptions:', err);
      connection.end();
      process.exit(1);
    }
    console.log('Columns in user_subscriptions:', results.map(r => `${r.Field} (${r.Type})` + (r.Null === 'YES' ? ' NULL' : ' NOT NULL')));

    connection.query("SHOW COLUMNS FROM pets", (err, resultsPets) => {
      if (err) {
        console.error('Error checking columns of pets:', err);
        connection.end();
        process.exit(1);
      }
      console.log('Columns in pets:', resultsPets.map(r => `${r.Field} (${r.Type})` + (r.Null === 'YES' ? ' NULL' : ' NOT NULL')));
      connection.end();
      process.exit(0);
    });
  });
});
