INSERT INTO departments (name)
VALUES  ('Marketing'),
        ('IT'),
        ('Sales');

INSERT INTO roles (title, salary, department_id)
VALUES  ('Marketing Specialist', 60000, 1),
        ('Software Developer', 80000, 2),
        ('Sales Representative', 70000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES  ('Rebecca', 'Jordan', 1, NULL),
        ('Charlie', 'Hanover', 2, 1),
        ('Rusty', 'Shields', 3, 1);
