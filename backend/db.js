const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: '35.202.230.168',
  user: 'hoteluser',
  password: 'your_strong_password_here',  
  database: 'hotel_booker',
  port: 3306,
  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
