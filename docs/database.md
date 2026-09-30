# Employee Leave Management System — Database

## 1. Overview

The application uses PostgreSQL for user identity, employee data, organizational data, leave configuration, leave transactions, document metadata, and audit information.

AWS service:

```text
Amazon RDS PostgreSQL
```

Database:

```text
employee_leave
```

Port:

```text
5432
```

## 2. Core Tables

```text
users
departments
employees
leave_types
leave_balances
leave_requests
documents
audit_logs
```

## 3. Table Responsibilities

### `users`

Stores login identity and application role. Important fields include `id`, `username`, `email`, `password_hash`, `role`, `is_active`, and `created_at`.

### `departments`

Stores organization departments.

### `employees`

Stores employee profile information and links the employee to a user and department.

Typical relationships:

```text
user_id -> users.id
department_id -> departments.id
manager_id -> employees.id
```

### `leave_types`

Stores leave categories and default day allocation.

### `leave_balances`

Stores employee leave allocation and usage.

```text
employee_id -> employees.id
leave_type_id -> leave_types.id
```

### `leave_requests`

Stores leave applications, including employee, leave type, date range, reason, status, manager comment, and creation time.

Frontend-supported statuses include:

```text
PENDING
APPROVED
REJECTED
CANCELLED
```

### `documents`

Stores document metadata such as employee ID, file name, S3 key, and upload time. The actual file content is stored in S3.

### `audit_logs`

Stores application audit information where recorded by the backend.

## 4. Relationship Model

```text
users
  |
  +-- employees -- departments
       |
       +-- leave_balances -- leave_types
       |
       +-- leave_requests -- leave_types
       |
       +-- documents

users -- audit_logs
```

## 5. Schema Source

Repository schema:

```text
database/schema.sql
```

Keep the schema synchronized with the SQLAlchemy models. Do not blindly rerun a full initialization script against populated production RDS.

## 6. Database Health

API endpoint:

```text
GET /health/database
```

## 7. Useful SQL

### Tables

```sql
\dt
```

### Users

```sql
SELECT id, username, role, is_active
FROM users
ORDER BY id;
```

### Employees

```sql
SELECT id, employee_code, user_id, department_id, first_name, last_name
FROM employees
ORDER BY id;
```

### Departments

```sql
SELECT id, name
FROM departments
ORDER BY id;
```

### Leave types

```sql
SELECT id, name, default_days
FROM leave_types
ORDER BY id;
```

### Leave requests

```sql
SELECT id, employee_id, leave_type_id, from_date, to_date, status, manager_comment, created_at
FROM leave_requests
ORDER BY id DESC;
```

### Leave balances

```sql
SELECT employee_id, leave_type_id, total_days, used_days
FROM leave_balances
ORDER BY employee_id, leave_type_id;
```

### Documents

```sql
SELECT id, employee_id, file_name, s3_key, uploaded_at
FROM documents
ORDER BY id DESC;
```

## 8. Security

Protect the database through private RDS configuration, restricted security-group access, application-only connectivity, and credentials that are not committed to source control.

## 9. Production Changes

Before modifying production schema or data:

```text
1. Back up according to the operational policy.
2. Test the change in a controlled environment.
3. Prefer versioned migrations.
4. Verify application health and workflows afterwards.
```

## 10. Future Improvements

Potential improvements include Alembic migrations, automated migration deployment, backup restoration tests, RDS Multi-AZ, index review, query monitoring, and database integration testing.
