const express = require('express');
const mysql = require('mysql2/promise');

async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'insecurepassword',
      database: 'forum'
    });

    // Execute a simple query
    //const [rows, fields] = await connection.execute('SELECT * FROM users');
    //console.log('Query results:', rows);

    await connection.end();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

const app = express();

app.get('/', (req, res) => {
    res.send('Hello from Node.js server!');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

