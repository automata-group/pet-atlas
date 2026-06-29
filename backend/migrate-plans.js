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

  const plans = [
    { id: 1, name: 'Basic', price: 0.00, currency: 'AED', interval_months: 1, description: 'Basic tier' },
    { id: 2, name: 'Community & Vet Chat premium', price: 38.00, currency: 'AED', interval_months: 1, description: 'Access point for Auto-Renewal Vet Chat consulting + Discounts' },
    { id: 3, name: 'Premium', price: 149.00, currency: 'AED', interval_months: 1, description: 'Premium tier' }
  ];

  let index = 0;
  function insertNext() {
    if (index >= plans.length) {
      console.log('All plans migrated successfully!');
      connection.end();
      process.exit(0);
    }

    const plan = plans[index++];
    connection.query(
      'INSERT INTO subscription_plans (id, name, price, currency, interval_months, description) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), currency=VALUES(currency), interval_months=VALUES(interval_months), description=VALUES(description)',
      [plan.id, plan.name, plan.price, plan.currency, plan.interval_months, plan.description],
      (err) => {
        if (err) {
          console.error(`Error inserting plan ${plan.id}:`, err);
          connection.end();
          process.exit(1);
        }
        console.log(`Plan ${plan.id} inserted/updated.`);
        insertNext();
      }
    );
  }

  insertNext();
});
