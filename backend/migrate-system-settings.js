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

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS system_settings (
      \`key\` VARCHAR(100) NOT NULL PRIMARY KEY,
      \`value\` VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating system_settings table:', err);
      connection.end();
      process.exit(1);
    }
    console.log("Table 'system_settings' created successfully or already exists!");

    // Let's seed with default values
    const seedQuery = `
      INSERT INTO system_settings (\`key\`, \`value\`)
      VALUES ('clinics_enabled', 'true')
      ON DUPLICATE KEY UPDATE \`value\` = \`value\`;
    `;

    connection.query(seedQuery, (err) => {
      if (err) {
        console.error('Error seeding system_settings table:', err);
        connection.end();
        process.exit(1);
      }
      console.log("Seeded 'system_settings' table successfully!");
      connection.end();
      process.exit(0);
    });
  });
});
