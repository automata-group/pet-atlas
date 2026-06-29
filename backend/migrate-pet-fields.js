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

  connection.query("SHOW COLUMNS FROM pets", (err, columns) => {
    if (err) {
      console.error('Error showing columns:', err);
      connection.end();
      process.exit(1);
    }

    const columnNames = columns.map(c => c.Field);
    const queries = [];

    if (!columnNames.includes('weight')) {
      console.log("Adding column 'weight' to 'pets' table...");
      queries.push("ALTER TABLE pets ADD COLUMN weight DECIMAL(5,2) NULL AFTER type");
    } else {
      console.log("Column 'weight' already exists in 'pets' table.");
    }

    if (!columnNames.includes('notes')) {
      console.log("Adding column 'notes' to 'pets' table...");
      queries.push("ALTER TABLE pets ADD COLUMN notes TEXT NULL AFTER neutered");
    } else {
      console.log("Column 'notes' already exists in 'pets' table.");
    }

    if (!columnNames.includes('activity_log')) {
      console.log("Adding column 'activity_log' to 'pets' table...");
      queries.push("ALTER TABLE pets ADD COLUMN activity_log JSON NULL AFTER notes");
    } else {
      console.log("Column 'activity_log' already exists in 'pets' table.");
    }

    runQueries(queries);
  });
});

function runQueries(queries) {
  if (queries.length === 0) {
    console.log("No migrations to run.");
    connection.end();
    process.exit(0);
  }

  let index = 0;
  function next() {
    if (index >= queries.length) {
      console.log("All pet field migrations executed successfully!");
      connection.end();
      process.exit(0);
    }

    const query = queries[index++];
    console.log(`Executing: ${query}`);
    connection.query(query, (err) => {
      if (err) {
        console.error(`Error executing query "${query}":`, err);
        connection.end();
        process.exit(1);
      }
      next();
    });
  }

  next();
}
