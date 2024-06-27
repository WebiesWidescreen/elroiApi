const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "elroiwed_webies", // your MySQL username
  password: "Password@2129goviralcpanel", // your MySQL password
  database: "elroiwed_elroiDetails", // your MySQL database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Ensure the directory exists
const receiptsDir = path.join(__dirname, "customer_receipts");
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir);
}

// API endpoint to insert data
app.post("/ADD_CUSTOMER", (req, res) => {
  // Extract data from the request body
  const {
    cusOrderNo,
    cusName,
    cusPhone,
    cusEmail,
    cardCode,
    cardQty,
    totalAmount,
    advAmount,
  } = req.body;

  // Validate the input data
  if (
    !cusOrderNo ||
    !cusName ||
    !cusEmail ||
    !cusPhone ||
    !cardCode ||
    !cardQty ||
    !totalAmount ||
    !advAmount
  ) {
    res.status(400).send("Bad Request: Missing required fields");
    return;
  }

  // Insert data into the customer_details table
  const sql =
    "INSERT INTO  `customer_details` (`createdOn`, `cus_OrderNo`, `cus_name`, `cus_phone`, `cus_email`, `cus_cardCode`, `cus_qty`, `cus_totalAmount`, `cus_advAmount`) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [
      cusOrderNo,
      cusName,
      cusPhone,
      cusEmail,
      cardCode,
      cardQty,
      totalAmount,
      advAmount,
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Server error");
        return;
      }
      //   generatePDF(req.body);
      res.status(201).send("Data inserted successfully");
    }
  );
});

app.get("/GET_LIST", (req, res) => {
  db.query("SELECT * FROM customer_details", (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      res.status(500).send("Server error");
      return;
    }
    // Example usage of the function
    const body = {
      cusOrderNo: "12345",
      cusName: "John Doe",
      cusPhone: "123-456-7890",
      cusEmail: "john.doe@example.com",
      cardCode: "ABC123",
      cardQty: 10,
      totalAmount: "$100",
      advAmount: "$50",
    };

    generatePDF(body)
      .then(() => console.log("PDF generation complete"))
      .catch((err) => console.error("Error generating PDF:", err));

    res.json(results);
  });
});
app.get("", (req, res) => {
  res.json("Hey Fuckers!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

async function generatePDF(body) {
  const htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; }
        h1 { text-align: center; }
        p { line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Customer Details</h1>
        <p><strong>Order No:</strong> ${body.cusOrderNo}</p>
        <p><strong>Name:</strong> ${body.cusName}</p>
        <p><strong>Phone:</strong> ${body.cusPhone}</p>
        <p><strong>Email:</strong> ${body.cusEmail}</p>
        <p><strong>Card Code:</strong> ${body.cardCode}</p>
        <p><strong>Card Quantity:</strong> ${body.cardQty}</p>
        <p><strong>Total Amount:</strong> ${body.totalAmount}</p>
        <p><strong>Advance Amount:</strong> ${body.advAmount}</p>
      </div>
    </body>
    </html>
  `;

  // Ensure the directory exists
  const receiptsDir = path.join(__dirname, "customer_receipts");
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir);
  }

  // Create a PDF from the HTML content
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const pdfPath = path.join(receiptsDir, `${body.cusOrderNo}.pdf`);
  await page.pdf({ path: pdfPath, format: "A4" });
  await browser.close();

  console.log(`PDF generated successfully at ${pdfPath}`);
}
