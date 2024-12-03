const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Fb76pe@1234',
  database:'school_management',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;