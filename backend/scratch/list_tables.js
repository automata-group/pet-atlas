const mysql = require('mysql2/promise');

async function listTables() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'pet_atlas'
    });

    try {
        const [rows] = await connection.execute("SHOW TABLES");
        console.log('Tables:', rows);
    } finally {
        await connection.end();
    }
}

listTables();
