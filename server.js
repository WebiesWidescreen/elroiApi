const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'elroiwed_webies', // your MySQL username
  password: 'Password@2129goviralcpanel', // your MySQL password
  database: 'elroiwed_elroiDetails', // your MySQL database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// API endpoint to insert data
app.post('/ADD_CUSTOMER', (req, res) => { 
  // Extract data from the request body
  const { cusOrderNo, cusName, cusPhone, cusEmail, cardCode, cardQty, totalAmount, advAmount } = req.body;

  // Validate the input data
  if (!cusOrderNo || !cusName || !cusEmail || !cusPhone || !cardCode || !cardQty || !totalAmount || !advAmount) {
    res.status(400).send('Bad Request: Missing required fields');
    return;
  }

  // Insert data into the customer_details table
  const sql = 'INSERT INTO  `customer_details` (`createdOn`, `cus_OrderNo`, `cus_name`, `cus_phone`, `cus_email`, `cus_cardCode`, `cus_qty`, `cus_totalAmount`, `cus_advAmount`) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [cusOrderNo, cusName, cusPhone, cusEmail, cardCode, cardQty, totalAmount, advAmount], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Server error');
      return;
    }
    res.status(201).send('Data inserted successfully');
  });
});


// API endpoints
app.get('/GET_LIST', (req, res) => {
  db.query('SELECT * FROM customer_details', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});
app.get('', (req, res) => {
  res.json('Hey Fuckers!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
