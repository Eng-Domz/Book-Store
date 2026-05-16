const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'BookStoreDB',
  port: Number(process.env.DB_PORT || 3306)
});

// Simple function to test connection immediately
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database!');
    connection.release();
  }
});

module.exports = pool.promise(); // use promise-based API
