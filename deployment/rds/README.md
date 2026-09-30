# Amazon RDS PostgreSQL Deployment

## Overview

Amazon RDS for PostgreSQL provides the managed relational database used by the Employee Leave Management System.

The database stores users, employees, departments, leave types, leave requests, leave balances, documents, and audit information.

## Configuration

| Component | Configuration             |
| --------- | ------------------------- |
| Service   | Amazon RDS                |
| Engine    | PostgreSQL                |
| Port      | 5432                      |
| Region    | ap-southeast-1            |
| Database  | employee_leave            |
| Network   | Private                   |
| Access    | Application EC2 instances |

## Database Architecture

```text
FastAPI Backend
      |
      | PostgreSQL :5432
      v
Amazon RDS PostgreSQL
      |
      +-- users
      +-- employees
      +-- departments
      +-- leave_types
      +-- leave_requests
      +-- leave_balances
      +-- documents
      +-- audit_logs
```

## Security

The RDS instance is not exposed directly to the public internet.

Database access is controlled through Security Groups.

Only the application tier should be permitted to connect to PostgreSQL on port `5432`.

## Application Configuration

Database connection information is stored outside the source code.

Example environment variables:

```text
DATABASE_HOST
DATABASE_PORT
DATABASE_NAME
DATABASE_USER
DATABASE_PASSWORD
```

Sensitive values must never be committed to GitHub.

## Backup and Recovery

Amazon RDS provides managed database capabilities such as automated backups and point-in-time recovery according to the configured retention settings.

## Connectivity Test

From an authorized application server:

```bash
psql -h <RDS-ENDPOINT> \
     -U <DATABASE-USER> \
     -d employee_leave \
     -p 5432
```
