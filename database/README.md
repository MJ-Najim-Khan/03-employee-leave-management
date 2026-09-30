# Database Documentation

## Employee Leave Management System

The Employee Leave Management System uses **PostgreSQL** as its relational database.

The database stores employee information, user accounts, departments, leave types, leave requests, leave balances, uploaded document metadata, and audit records.

---

## Database Architecture

```text
                         PostgreSQL Database
                                  |
       +--------------------------+--------------------------+
       |                          |                          |
       v                          v                          v
     Users                    Employees                Departments
       |                          |                          |
       |                          +------------+-------------+
       |                                       |
       v                                       v
  Leave Requests ------------------------> Leave Types
       |
       v
 Leave Balances

 Employees
     |
     v
 Documents

 Users / Employees
     |
     v
 Audit Logs
```

---

## Database Technology

| Component           | Technology                |
| ------------------- | ------------------------- |
| Database            | PostgreSQL                |
| Production Database | Amazon RDS for PostgreSQL |
| Local Development   | PostgreSQL                |
| Database Port       | 5432                      |
| Database Name       | `employee_leave`          |
| Production Region   | `ap-southeast-1`          |

---

## Database Tables

The application uses the following core tables:

| Table            | Purpose                                                |
| ---------------- | ------------------------------------------------------ |
| `users`          | Stores authentication and application user information |
| `employees`      | Stores employee-specific information                   |
| `departments`    | Stores organizational departments                      |
| `leave_types`    | Defines available leave categories                     |
| `leave_requests` | Stores employee leave applications                     |
| `leave_balances` | Stores employee leave balances                         |
| `documents`      | Stores metadata for employee documents                 |
| `audit_logs`     | Records important application activities               |

---

## Entity Relationships

### Users and Employees

A user account can be associated with an employee profile.

```text
users
  |
  | user_id
  v
employees
```

The employee record contains employee-specific information such as employee ID, name, department, and user association.

---

### Departments and Employees

Each employee belongs to a department.

```text
departments
      |
      | department_id
      v
  employees
```

Examples of departments include:

* IT
* HR
* Finance
* Sales

---

### Employees and Leave Requests

Employees can create leave requests.

```text
employees
    |
    v
leave_requests
```

Each leave request contains information such as:

* Leave type
* Start date
* End date
* Reason
* Status
* Approval information

---

### Leave Types and Leave Requests

Each leave request is associated with a leave type.

```text
leave_types
     |
     v
leave_requests
```

Examples include:

* Casual Leave
* Sick Leave
* Annual Leave

---

### Employees and Leave Balances

Leave balances are maintained for employees.

```text
employees
    |
    v
leave_balances
```

Balances can be maintained separately for different leave types.

---

### Employees and Documents

Employee-related documents are tracked through the `documents` table.

```text
employees
    |
    v
documents
    |
    v
Amazon S3
```

The database stores document metadata while the actual files are stored in Amazon S3.

Typical metadata includes:

* File name
* S3 object key
* Document type
* Upload information
* Employee association

---

### Audit Logs

Important application activities can be recorded in `audit_logs`.

```text
Users / Employees
       |
       v
  audit_logs
```

Audit logging helps provide traceability for important operations.

---

# Database Schema

The complete database definition is maintained in:

```text
database/schema.sql
```

The schema file contains the SQL statements required to create the application's database structure.

---

# Local PostgreSQL Setup

Create the database:

```sql
CREATE DATABASE employee_leave;
```

Connect to the database:

```bash
psql -U postgres -d employee_leave
```

Execute the schema:

```bash
psql -U postgres -d employee_leave -f database/schema.sql
```

---

# Verify Tables

After executing the schema:

```sql
\dt
```

Expected application tables include:

```text
audit_logs
departments
documents
employees
leave_balances
leave_requests
leave_types
users
```

---

# AWS RDS PostgreSQL

In the production environment, PostgreSQL is hosted using Amazon RDS.

The application EC2 instances connect to the RDS database through the private network.

```text
                    AWS Cloud
                       |
                       v
                EC2 Application
                       |
                 PostgreSQL :5432
                       |
                       v
              Amazon RDS PostgreSQL
```

The RDS database should not be publicly accessible.

Database access is controlled through Security Groups.

---

# Environment Configuration

Database credentials are provided through environment configuration rather than being hard-coded into application source code.

Example:

```text
DATABASE_HOST=<RDS-ENDPOINT>
DATABASE_PORT=5432
DATABASE_NAME=employee_leave
DATABASE_USER=<DATABASE-USER>
DATABASE_PASSWORD=<DATABASE-PASSWORD>
```

> Never commit actual database passwords, credentials, or secrets to GitHub.

---

# Database Security

The following security practices are used:

* PostgreSQL is restricted to authorized application resources.
* RDS is deployed in the private application/database network.
* Security Groups control access to port `5432`.
* Database credentials are kept outside source code.
* Production credentials are not stored in GitHub.
* Employee document files are stored separately in Amazon S3.
* IAM permissions are used for AWS resource access.

---

# Backup and Recovery

Amazon RDS provides managed database backup and recovery capabilities.

Configured RDS backup settings should be reviewed according to the application's operational requirements.

For production environments, database backups should be regularly monitored and recovery procedures should be tested.

---

# Development and Production

```text
Local Development
       |
       v
Local PostgreSQL
       |
       v
Application Testing
       |
       v
AWS Deployment
       |
       v
Amazon RDS PostgreSQL
```

The application should use separate configuration values for local development and production environments.

---

# Important Security Notice

Do not commit any of the following files or values to GitHub:

```text
.env
database passwords
AWS credentials
JWT secrets
RDS credentials
private keys
employee personal documents
```

Use `.env.example` files to document required configuration variables without exposing actual secrets.
