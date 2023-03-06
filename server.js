const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const fs = require('fs');
const mime = require('mime');
const { Console } = require('console');
const { URLSearchParams } = require('url');


app.use(bodyParser.json());

// Create database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'employees'
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
app.get('/employees/get', (req, res) => {
  const sql = 'SELECT * FROM employees';
  db.query(sql, (err, result) => {
    if (err) throw err;

    //const b64 = Buffer.from(result.Body.Image_employee).toString('base64');
    const employees = result.map(row => new Employee(row.ID, row.Name, row.Phone, row.Address, row.Position, row.Mail, row.Image_employee));
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.json(employees);

  });
});

app.use("/uploads", express.static("uploads"));
app.use(express.json());

//GET employee select for param or query

// GET employee by ID param 
app.get('/employees/get/employee/:ID', (req, res) => {
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

// GET employee by ID query
app.get('/employees/get/employee/', (req, res) => {
  const ID = req.query.ID;
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

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


//POST a new employee new string param json
app.post('/employees/add', upload.single('Image_employee'), (req, res) => {
  const Name = req.body.Name;
  const Phone = req.body.Phone;
  const Address = req.body.Address;
  const Position = req.body.Position;
  const Mail = req.body.Mail;

  console.log(req.file);
  console.log(req.file.filename);
  const base64Data = new Buffer(JSON.stringify(req.file)).toString("base64");
  console.log(base64Data);
  const Image_employee = req.file.filename;
  //console.log(req.file.filename.buffer.toString("base64"));
  const sql = 'INSERT INTO employees (Name, Phone, Address, Position, Mail, Image_employee) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [Name, Phone, Address, Position, Mail, Image_employee], (err, result) => {
    if (err) throw err;
    const employee = new Employee(result.InsertId, Name, Phone, Address, Position, Mail, Image_employee);

    res.json(employee);

  });
});



//PUT PARAM JSON
// PUT (update) an employee by ID all part data
app.put('/employees/edit/:ID', upload.single('Image_employee'), (req, res) => {
  const ID = req.params.ID;
  const Name = req.body.Name;
  const Phone = req.body.Phone;
  const Address = req.body.Address;
  const Position = req.body.Position;
  const Mail = req.body.Mail;
  const Image_employee = req.file;
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

// PUT (update) an employee by ID some part data
app.put('/employees/edit/part/:ID', upload.single('Image_employee'), (req, res) => {
  const ID = req.params.ID;
  const Name = req.body.Name;
  const Phone = req.body.Phone;
  const Address = req.body.Address;
  const Position = req.body.Position;
  const Mail = req.body.Mail;
  const Image_employee = req.file;
  if (req.file) {
    Image_employee = req.file.filename;
  }
  const sql = 'UPDATE employees SET Name = ? WHERE ID = ?';
  db.query(sql, [Name, ID], (err, result) => {
    if (err) throw err;
    if (result.affectedRows === 0) {
      res.status(404).send('Employee not found');
    } else {
      const employee = new Employee(ID, Name, Phone, Address, Position, Mail, Image_employee);
      res.json(employee);
    }
  });
});



// DELETE employee by ID query
app.delete('/employees/get/employee/', (req, res) => {
  const ID = req.query.ID;
  const sql = 'DELETE FROM employees WHERE ID = ?';
  db.query(sql, [ID], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      res.status(404).send('Employee not found');
    } else {
      res.json("Delete Success");
    }
  });
});

// DELETE employee by ID PARAMS
app.delete('/employees/get/employee/:ID', (req, res) => {
  const ID = req.params.ID;
  const sql = 'DELETE FROM employees WHERE ID = ?';
  db.query(sql, [ID], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      res.status(404).send('Employee not found');
    } else {

      res.json("Delete Success");
    }
  });
});



// Start server
app.listen(8000, () => {
  console.log('Server started on port 8000');
});
