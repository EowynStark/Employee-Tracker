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

// view all employees
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

// view all departments
    // table showing department names and department ids
function viewDepartment() {
    db.query(`SELECT * FROM departments`, (err, results) => {
        if (err) throw err;
        console.table(results);
    });
}

// add new departments
    // prompt to enter the name of the department and that department is added to the database
function addDepartments() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'Enter a name for the new department: ',
        },
    ])
    .then((answers) => {
        const departmentQuery = `INSERT INTO departments (name) VALUES (?)`;
        db.query(departmentQuery, [answers.departmentName], (deptErr, deptResult) => {
            if (deptErr) throw deptErr;
            console.log('Department added successfully.');
        });
    });
}

// view all roles
    // table showing job title, role id, the department that role belongs to, and the salary for that role
function viewRoles() {
    db.query(`SELECT * FROM roles`, (err, results) => {
        if(err) throw err;
        console.table(results);
    });
}
// add in new roles
    // prompts to enter the name, salary, and department for the role and that role is added to the database
function addRoles() {
    // fetch existing departments, create variable departmentChoices, .push departmentChoices
    const existingDepartmentsQuery = `SELECT id, name FROM departments`;
    db.query(existingDepartmentsQuery, (err, existingDepartmentsQuery) => {
        if (err) throw err;
        const departmentChoices = existingDepartmentsQuery.map(department => ({
            name: department.name,
            value: department.id,
        }));
        departmentChoices.push({ name: 'Add New Department', value: 'new'});
        // prompt to add role, includes department role that can be added to
        inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter a title for the new role: ',
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter a salary for the new role: ',
            validate: (input) => {
                const isValid = /^\d+(\.\d{1,2})?$/.test(input);
                return isValid || 'Please enter a valid salary. Must be numerical value with no more than 2 decimal places.';
            },
        },
        {
            type: 'list',
            name: 'department',
            message: 'Select the department for the role: ',
            choices: departmentChoices,
        },
        ])
        .then((answers) => {
            if (answers.department === 'new') {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'newDepartmentName',
                    message: 'Enter the name of the new department: ',
                },
            ])
            .then((newDepartmentAnswers) => {
                const newDepartmentQuery =  `INSERT INTO departments (name) VALUES (?)`;
                db.query(newDepartmentQuery, [newDepartmentAnswers.newDepartmentName], (newDeptErr, newDeptResult) => {
                    if (newDeptErr) throw newDeptErr;
                    insertRole(answers.title, answers.salary, newDeptResult.insertId);
                });
            });
            } else {
            insertRole(answers.title, answers.salary, answers.department);
            }
        });
    });
}
    // helper function for addRoles()
function insertRole(title, salary, departmentId) {
    const roleQuery = `INSERT INTO roles SET ?`;
    const roleData = {
        title,
        salary,
        department_id: departmentId,
    };
    db.query(roleQuery, roleData, (roleErr, roleResult) => {
        if (roleErr) throw roleErr;
        console.log('Role added successfully.');
    });
}
// add in initial call to start application
// add in .on('exit') for db at the end