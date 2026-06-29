const mysql = require('mysql2/promise');

async function cleanClinics() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'pet_atlas'
    });

    try {
        const [result] = await connection.execute("DELETE FROM listing_items WHERE listing_type = 'Clinic'");
        console.log(`Successfully deleted ${result.affectedRows} clinics.`);
    } catch (err) {
        console.error('Error deleting clinics:', err);
    } finally {
        await connection.end();
    }
}

cleanClinics();
