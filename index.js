const mysql = require('mysql2');
const inquirer = require('inquirer');

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

// Main menu navigator function
function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an action: ',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a new department',
                'Add a new role',
                'Add a new employee',
                'Update existing employee information',
                'Exit application'
            ],
        },
    ])
    .then((answers) => {
        switch (answers.action) {
            case 'View all departments':
                viewDepartment();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployee();
                break;
            case 'Add a new department':
                addDepartments();
                break;
            case 'Add a new role':
                addRoles();
                break;
            case 'Add a new employee':
                addEmployee();
                break;
            case 'Update existing employee information':
                updateEmployeeRole();
                break;
            case 'Exit application':
                console.log('Exiting the application. Closing the employee_management database connection.');
                db.end();
                break;
        }
    });
}

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
        if (err) {
            console.error('Error viewing employees: ', err);
            mainMenu();
            return;
        };
        console.table(results);
        mainMenu();
    });
}
// add in addEmployee() function
    // prompt to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
function addEmployee() {
    const rolesQuery = `SELECT id, title FROM roles`;
    const employeesQuery = `SELECT id, CONCAT(first_name, ' ', last_name) AS manager_name FROM employees`;
    db.query(rolesQuery, (roleErr, roles) => {
        if (roleErr) {
            console.error('Error with role query: ', roleErr);
            mainMenu();
            return;
        };

        db.query(employeesQuery, (employeeErr, employees) => {
            if (employeeErr) {
                console.error('Error with employee query: ', employeeErr);
                mainMenu();
                return;
            };

            const roleChoices = roles.map(role => ({
                name: role.title,
                value: role.id,
            }));
            const managerChoices = [
                { name: 'No Manager', value: null}, ...employees.map(manager => ({
                    name: manager.manager_name,
                    value: manager.id,
                })),
            ];

        inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter a first name for new employee: ',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter a last name for new employee: ',
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'Select a role for new employee: ',
                choices: roleChoices,
            },
            {
                type: 'list',
                name: 'managerId',
                message: 'Select a manager for new employee: ',
                choices: managerChoices,
            },
        ])
        .then((answers) => {
            const insertQuery = `INSERT INTO employees SET ?`;
            const employeeData = {
                first_name: answers.firstName,
                last_name: answers.lastName,
                role_id: answers.roleId,
                manager_id: answers.managerId,
            };
            db.query(insertQuery, employeeData, (insertErr, insertResult) =>{
                if (insertErr) {
                    console.error('Error inserting employee data: ', insertErr);
                    mainMenu();
                    return;
                };
                console.log('Employee added successfully.');
                mainMenu();
                });
            });
        });
     });
}

// update employee role
    // prompt to select an employee to update and their new role and this information is updated in the database
function updateEmployeeRole() {
    // fetch existing employees and roles then prompt to select and update
    const employeesQuery = `SELECT id, CONCAT (first_name, ' ', last_name) AS employee_name FROM employees`;
    const rolesQuery = `SELECT id, title FROM roles`;
    db.query(employeesQuery, (employeeErr, employees) => {
        if (employeeErr) {
            console.error('Error with employee query: ', employeeErr);
            mainMenu();
            return;
        };
        db.query(rolesQuery, (roleErr, roles) => {
            if (roleErr) {
                console.error('Error with role query: ', roleErr);
                mainMenu();
                return;
            };
            const employeeChoices = employees.map(employee => ({
                name: employee.employee_name,
                value: employee.id,
            }));
        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id,
        }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select an employee to update: ',
                choices: employeeChoices,
            },
            {
                type: 'list',
                name: 'newRoleId',
                message: 'Select a new role for this employee: ',
                choices: roleChoices,
            },
        ])
        .then((answers) => {
            const updateQuery = `UPDATE employees SET role_id = ? WHERE id = ?`;
            db.query(updateQuery, [answers.newRoleId, answers.employeeId], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Error updating employee: ', updateErr);
                    mainMenu();
                    return;
                };
                console.log('Employee role updated successfully.');
                mainMenu();
                 });
            });
        });
    });
}

// view all departments
    // table showing department names and department ids
function viewDepartment() {
    db.query(`SELECT * FROM departments`, (err, results) => {
        if (err) {
            console.error('Error viewing departments: ', err);
            mainMenu();
            return;
        };
        console.table(results);
        mainMenu();
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
            if (deptErr) {
                console.error('Error with department query: ', deptErr);
                mainMenu();
                return;
            };
            console.log('Department added successfully.');
            mainMenu();
        });
    });
}

// view all roles
    // table showing job title, role id, the department that role belongs to, and the salary for that role
function viewRoles() {
    db.query(`SELECT * FROM roles`, (err, results) => {
        if(err) {
            console.error('Error viewing all roles: ', err);
            mainMenu();
            return;
        };
        console.table(results);
        mainMenu();
    });
}
// add in new roles
    // prompts to enter the name, salary, and department for the role and that role is added to the database
function addRoles() {
    // fetch existing departments, create variable departmentChoices, .push departmentChoices
    const existingDepartmentsQuery = `SELECT id, name FROM departments`;
    db.query(existingDepartmentsQuery, (err, existingDepartmentsQuery) => {
        if (err) {
            console.error('Error with department query: ', err);
            mainMenu();
            return;
        };
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
                    if (newDeptErr) {
                        console.error('Error with new department query: ', newDeptErr);
                        mainMenu();
                        return;
                    };
                    insertRole(answers.title, answers.salary, newDeptResult.insertId);
                    mainMenu();
                });
            });
            } else {
            insertRole(answers.title, answers.salary, answers.department);
            mainMenu();
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
        if (roleErr) {
            console.error('Error inserting new role: ', roleErr);
            mainMenu();
            return;
        };
        console.log('Role added successfully.');
        mainMenu();
    });
}

mainMenu();