const mysql = require('mysql2/promise');

async function cleanMore() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'pet_atlas'
    });

    try {
        const [result] = await connection.execute("DELETE FROM listing_items WHERE listing_type IN ('Clinic', 'Vet', 'MobileClinic')");
        console.log(`Successfully deleted ${result.affectedRows} medical listings (Clinics/Vets).`);
    } catch (err) {
        console.error('Error deleting listings:', err);
    } finally {
        await connection.end();
    }
}

cleanMore();
