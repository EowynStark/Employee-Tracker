const mysql = require('mysql2');

const db = mysql.createConnection(
    {
    host: 'localhost',
    user: 'root',
    password: 'HarleyForest2008',
    database: 'employee_management_db'
    },
    console.log(`Connected to the employee_management database.`)
);

db.connect((err) => {
    if(err) {
        console.error('Error connecting to the database: ', err.message);
        return;
    }
    console.log('Connected to the employee_management database.')
})