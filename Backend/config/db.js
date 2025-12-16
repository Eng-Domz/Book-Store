const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',          // change if different
  password: '',          // change if you have a password
  database: 'BookStoreDB',   // <-- put your database name here
  port: 3306             // XAMPP default
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