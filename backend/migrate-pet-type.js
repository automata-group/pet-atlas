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
  console.log('Connected to MySQL successfully.');

  // Check if column already exists
  connection.query("SHOW COLUMNS FROM pets LIKE 'type'", (err, results) => {
    if (err) {
      console.error('Error checking columns:', err);
      connection.end();
      process.exit(1);
    }

    if (results.length > 0) {
      console.log("Column 'type' already exists in 'pets' table. No migration needed.");
      connection.end();
      process.exit(0);
    } else {
      console.log("Column 'type' is missing. Adding it now...");
      connection.query("ALTER TABLE pets ADD COLUMN type VARCHAR(100) NULL AFTER sex", (err) => {
        if (err) {
          console.error('Error executing ALTER TABLE query:', err);
          connection.end();
          process.exit(1);
        }
        console.log("Column 'type' added successfully to 'pets' table!");
        connection.end();
        process.exit(0);
      });
    }
  });
});
