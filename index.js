const mysql = require('mysql2');
const inquirer = require('inquirer');
const dbFile = require('./db');

// creating mysql connection
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

// add in mainMenu() function to display initial menu and user choices
    // presented with the following options: 
    // view all departments, view all roles, view all employees
    // add a department, add a role, add an employee
    // update an employee role
    // mainMenu() will have calls to viewDepartments(), addDepartments(), etc as needed

// add in viewEmployee() function
    // table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
function viewEmployee() {
    const query = `SELECT
                    e.id AS employee_id,
                    e.first_name,
                    e.last_name,
                    r.title AS role_title,
                    d.name AS department_name,
                    r.salary,
                    CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                    FROM employees e
                    LEFT JOIN roles r ON e.role_id = r.id
                    LEFT JOIN departments d ON r.department_id = d.id
                    LEFT JOIN employees m ON e.manager_id = m.id; `;

    db.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
    });
}
// add in addEmployee() function
    // prompt to enter the employee’s first name, last name, role, and manager, and that employee is added to the database

// add in updateEmployeeRole() function
    // prompt to select an employee to update and their new role and this information is updated in the database

// add in viewDepartment() function
    // table showing department names and department ids
function viewDepartment() {
    db.query(`SELECT * FROM departments`, (err, results) => {
        if (err) throw err;
        console.table(results);
    });
}

// add in addDepartment() function
    // prompt to enter the name of the department and that department is added to the database

// add in viewRoles() function
    // table showing job title, role id, the department that role belongs to, and the salary for that role

// add in addRoles() function
    // prompt to enter the name, salary, and department for the role and that role is added to the database

// add in initial call to start application
// add in .on('exit') for db at the end