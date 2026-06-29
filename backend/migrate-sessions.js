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
    CREATE TABLE IF NOT EXISTS user_sessions (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      user_id BIGINT NOT NULL,
      device_info VARCHAR(255) NULL,
      ip_address VARCHAR(45) NULL,
      last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      isActive TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating user_sessions table:', err);
      connection.end();
      process.exit(1);
    }
    console.log("Table 'user_sessions' created successfully or already exists!");
    connection.end();
    process.exit(0);
  });
});
