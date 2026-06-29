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

  // 1. Check auto_renewal vs auto_renew in user_subscriptions
  connection.query("SHOW COLUMNS FROM user_subscriptions LIKE 'auto_renew'", (err, results) => {
    if (err) {
      console.error('Error checking auto_renew:', err);
      connection.end();
      process.exit(1);
    }

    const queries = [];

    if (results.length === 0) {
      // auto_renew is missing. Let's see if auto_renewal exists to rename it, otherwise add it.
      connection.query("SHOW COLUMNS FROM user_subscriptions LIKE 'auto_renewal'", (err, resultsRenewal) => {
        if (err) {
          console.error('Error checking auto_renewal:', err);
          connection.end();
          process.exit(1);
        }

        if (resultsRenewal.length > 0) {
          console.log("Renaming column 'auto_renewal' to 'auto_renew'...");
          queries.push("ALTER TABLE user_subscriptions CHANGE COLUMN auto_renewal auto_renew TINYINT(1) DEFAULT 1");
        } else {
          console.log("Adding column 'auto_renew'...");
          queries.push("ALTER TABLE user_subscriptions ADD COLUMN auto_renew TINYINT(1) DEFAULT 1");
        }

        proceedWithMigrations();
      });
    } else {
      console.log("Column 'auto_renew' already exists.");
      proceedWithMigrations();
    }

    function proceedWithMigrations() {
      // 2. Check updated_at in user_subscriptions
      connection.query("SHOW COLUMNS FROM user_subscriptions LIKE 'updated_at'", (err, resultsUpdated) => {
        if (err) {
          console.error('Error checking updated_at:', err);
          connection.end();
          process.exit(1);
        }

        if (resultsUpdated.length === 0) {
          console.log("Adding column 'updated_at'...");
          queries.push("ALTER TABLE user_subscriptions ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_at");
        } else {
          console.log("Column 'updated_at' already exists.");
        }

        // 2.5. Check order_id in user_subscriptions
        connection.query("SHOW COLUMNS FROM user_subscriptions LIKE 'order_id'", (err, resultsOrder) => {
          if (err) {
            console.error('Error checking order_id:', err);
            connection.end();
            process.exit(1);
          }

          if (resultsOrder.length === 0) {
            console.log("Adding column 'order_id'...");
            queries.push("ALTER TABLE user_subscriptions ADD COLUMN order_id VARCHAR(255) NULL AFTER plan_id");
          } else {
            console.log("Column 'order_id' already exists.");
          }

          // 3. Alter status enum to include all possible values
          console.log("Altering 'status' enum to match entity definition...");
          queries.push("ALTER TABLE user_subscriptions MODIFY COLUMN status ENUM('active', 'inactive', 'canceled', 'past_due', 'cancelled', 'expired', 'failed') DEFAULT 'active'");

          runQueries(queries);
        });
      });
    }
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
      console.log("All migrations executed successfully!");
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
