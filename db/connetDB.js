const mysql2 = require('mysql2')

const db = mysql2.createConnection({
    host: process.env.HOST_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME
}).promise();

module.exports = db