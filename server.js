const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();

app.use(bodyParser.json());

// Create database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'user_information'
});

// Connect to database
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

// Configure image file upload using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Employee model class
class Employee {
  constructor(ID, Name, Phone, Address, Position, Mail, Image_employee) {
    this.ID = ID;
    this.Name = Name;
    this.Phone = Phone;
    this.Address = Address;
    this.Position = Position;
    this.Mail = Mail;
    this.Image_employee = Image_employee;
  }
}

// GET all employees
app.get('/get/employees', (req, res) => {
  const sql = 'SELECT * FROM employees';
  db.query(sql, (err, result) => {
    if (err) throw err;
    const employees = result.map(row => new Employee(row.ID, row.Name, row.Phone, row.Address, row.Position, row.Mail, row.Image_employee));
    res.json(employees);
  });
});

// GET employee by ID
app.get('/get/employees/:ID', (req, res) => {
  const ID = req.params.ID;
  const sql = 'SELECT * FROM employees WHERE ID = ?';
  db.query(sql, [ID], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      res.status(404).send('Employee not found');
    } else {
      const row = result[0];
      const employee = new Employee(row.ID, row.Name, row.Phone, row.Address, row.Position, row.Mail, row.Image_employee);
      res.json(employee);
    }
  });
});

// POST a new employee
app.post('/add/employees', upload.single('Image_employee'), (req, res) => {
  const Name = req.body.Name;
  const Phone = req.body.Phone;
  const Address = req.body.Address;
  const Position = req.body.Position;
  const Mail = req.body.Mail;
  const Image_employee = req.file.filename;
  const sql = 'INSERT INTO employees (Name, Phone, Address, Position, Mail, Image_employee) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [Name, Phone, Address, Position, Mail, Image_employee], (err, result) => {
    if (err) throw err;
    const employee = new Employee(result.InsertId, Name, Phone, Address, Position, Mail, Image_employee);
    res.json(employee);
  });
});

// PUT (update) an employee by ID
app.put('/edit/employees/:ID', upload.single('Image_employee'), (req, res) => {
  const ID = req.params.ID;
  const Name = req.body.Name;
  const Phone = req.body.Phone;
  const Address = req.body.Address;
  const Position = req.body.Position;
  const Mail = req.body.Mail;
  let Image_employee = null;
  if (req.file) {
    Image_employee = req.file.filename;
  }
  const sql = 'UPDATE employees SET Name = ?, Phone = ?, Address = ?, Position = ?, Mail = ?, Image_employee = ? WHERE ID = ?';
  db.query(sql, [Name, Phone, Address, Position, Mail, Image_employee, ID], (err, result) => {
    if (err) throw err;
    if (result.affectedRows === 0) {
      res.status(404).send('Employee not found');
    } else {
      const employee = new Employee(ID, Name, Phone, Address, Position, Mail, Image_employee);
      res.json(employee);
    }
  });
});

// DELETE an employee by ID
app.delete('/delete/employees/:ID', (req, res) => {
  const ID = req.params.ID;
  const sql = 'DELETE FROM employees WHERE ID = ?';
  db.query(sql, [ID], (err, result) => {
    if (err) throw err;
    if (result.affectedRows === 0) {
      res.status(404).send('Employee not found');
    } else {
      res.send(`Employee with ID ${ID} deleted`);
    }
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
