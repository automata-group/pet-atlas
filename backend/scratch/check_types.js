const mysql = require('mysql2/promise');

async function checkTypes() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'pet_atlas'
    });

    try {
        const [rows] = await connection.execute("SELECT listing_type, COUNT(*) as count FROM listing_items GROUP BY listing_type");
        console.log('Remaining items by type:', rows);
    } catch (err) {
        console.error('Error checking types:', err);
    } finally {
        await connection.end();
    }
}

checkTypes();
