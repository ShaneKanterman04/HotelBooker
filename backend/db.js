const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: '35.202.230.168',  // Replace with your Google Cloud VM external IP
  user: 'hoteluser',
  password: 'your_strong_password_here',  // Replace with your MySQL password
  database: 'hotel_booker',
  port: 3306,
  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
