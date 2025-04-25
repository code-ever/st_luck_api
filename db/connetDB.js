const mysql2 = require('mysql2')

const db = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME
}).promise();


async function queryDatabase() {
    try {
        const [rows, fields] = await db.execute('SELECT * FROM std_table');
        console.log(rows);
    } catch (err) {
        console.error('Database query failed:', err);
    }
}
queryDatabase()
module.exports = db