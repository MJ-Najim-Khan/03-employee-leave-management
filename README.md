# Employee Leave Management System

A full-stack **Employee Leave Management System** built with **React, Python FastAPI, and PostgreSQL**, deployed on AWS using a multi-AZ application architecture.

The application provides role-based workflows for **Employees, Managers, and Administrators**, including leave management, leave approval, employee management, leave balances, document uploads, dashboards, and monitoring.

---

## 🌐 Live Application

| Component | URL |
|---|---|
| Frontend | https://www.mjnazim.online |
| Backend API | https://api.mjnazim.online |
| Swagger API Documentation | https://api.mjnazim.online/docs |

---

## 📌 Project Overview

The Employee Leave Management System is a full-stack web application designed to manage employee leave requests through a role-based workflow.

### Employee

- Register and login
- View profile
- View leave balance
- Apply for leave
- View leave history
- Cancel leave
- Upload supporting documents
- Download uploaded documents
- Check leave status

### Manager

- Manager login
- View team members
- View pending leave requests
- Approve leave requests
- Reject leave requests
- Add approval comments
- View employee leave history

### Administrator

- Manage employees
- Manage departments
- Manage leave types
- Configure leave balances
- View dashboard information
- Manage user status

---

# 🏗️ Architecture

## High-Level Architecture

```text
                              USERS
                                |
                                v
                         +-------------+
                         |  Route 53   |
                         +------+------+
                                |
                  +-------------+-------------+
                  |                           |
                  v                           v
        www.mjnazim.online          api.mjnazim.online
                  |                           |
                  v                           v
          +---------------+           +---------------+
          |  CloudFront   |           |      ALB      |
          +-------+-------+           |   HTTPS :443  |
                  |                   +-------+-------+
                  v                           |
          +---------------+             +-----+-----+
          | S3 Frontend   |             |           |
          | React / Vite  |             v           v
          +---------------+        +---------+ +---------+
                                  | EC2 #1  | | EC2 #2  |
                                  | FastAPI | | FastAPI |
                                  +----+----+ +----+----+
                                       \          /
                                        \        /
                                         v      v
                                      +------------+
                                      | RDS        |
                                      | PostgreSQL |
                                      +------------+

                     EC2 Application Tier
                          |          |
                          |          +------------------+
                          v                             |
                  +---------------+                     v
                  | S3 Documents  |             +---------------+
                  | Private       |             |  CloudWatch   |
                  +---------------+             +-------+-------+
                                                        |
                                                        v
                                                   +---------+
                                                   |   SNS   |
                                                   +----+----+
                                                        |
                                                        v
                                                      Email

                     IAM Role → EC2 AWS permissions
                     ACM → HTTPS certificate for ALB
                     SSM → EC2 administration
```

## Request Flow

### Frontend flow

```text
User
  ↓
Route 53
  ↓
CloudFront
  ↓
S3 React Frontend
```

### API flow

```text
Browser
  ↓
Route 53
  ↓
ACM / HTTPS
  ↓
Application Load Balancer
  ↓
EC2 #1 / EC2 #2
  ↓
FastAPI
  ↓
RDS PostgreSQL
```

### Document flow

```text
Employee
  ↓
React
  ↓
FastAPI
  ↓
Private S3 Documents Bucket
  ↓
Document metadata stored in PostgreSQL
```

### Monitoring flow

```text
EC2 / Application
       ↓
   CloudWatch
       ↓
  CloudWatch Alarm
       ↓
      SNS
       ↓
     Email
```

---

# ☁️ AWS Services Used

| AWS Service | Purpose |
|---|---|
| Amazon VPC | Network isolation and subnet architecture |
| Amazon EC2 | Hosts the FastAPI application |
| Application Load Balancer | Distributes API traffic across EC2 instances |
| Amazon RDS PostgreSQL | Relational database |
| Amazon S3 | React frontend hosting and private employee document storage |
| Amazon CloudFront | CDN and HTTPS delivery for the frontend |
| Amazon Route 53 | DNS for application and API domains |
| AWS Certificate Manager | TLS/HTTPS certificate |
| AWS IAM | Role-based AWS permissions for EC2 |
| AWS Systems Manager | Secure EC2 administration through Session Manager |
| Amazon CloudWatch | Metrics, logs, and alarms |
| Amazon SNS | Email notifications from monitoring alarms |

---

# 🧰 Technology Stack

## Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3
- React Router

## Backend

- Python
- FastAPI
- SQLAlchemy
- Uvicorn
- Gunicorn
- JWT authentication
- Boto3

## Database

- PostgreSQL

## Cloud / AWS

- VPC
- EC2
- Application Load Balancer
- RDS PostgreSQL
- S3
- CloudFront
- Route 53
- ACM
- IAM
- Systems Manager
- CloudWatch
- SNS

---

# 🔐 Security Design

The project applies several AWS and application-level security practices.

### Network security

- RDS is configured as a private database service.
- Security groups restrict communication between application and database tiers.
- The ALB is the public entry point for the API.
- Application traffic is served over HTTPS.

### IAM

EC2 uses an IAM role to access required AWS services instead of storing long-lived AWS access keys in the application.

### S3

The employee documents bucket is intended to remain private with **S3 Block Public Access enabled**.

Documents are accessed through the application rather than by making the bucket publicly readable.

### Authentication and authorization

The backend uses JWT-based authentication and role-based authorization for Employee, Manager, and Admin workflows.

### Session Manager

AWS Systems Manager Session Manager is used for EC2 administration without requiring direct SSH access as part of the deployment workflow.

### Secrets

Real passwords, JWT secrets, database credentials, tokens, private keys, and AWS access keys must never be committed to GitHub.

---

# 📂 Repository Structure

```text
employee-leave-management/
│
├── README.md
├── LICENSE
├── .gitignore
│
├── architecture/
│   └── architecture-diagram.png
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   └── dependencies.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── main.py
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/
│   ├── schema.sql
│   └── README.md
│
├── deployment/
│   ├── ec2/
│   ├── alb/
│   ├── rds/
│   ├── s3/
│   ├── cloudfront/
│   ├── route53/
│   ├── acm/
│   ├── cloudwatch/
│   ├── sns/
│   ├── iam/
│   └── ssm/
│
├── docs/
│   ├── architecture.md
│   ├── deployment.md
│   ├── security.md
│   ├── troubleshooting.md
│   ├── database.md
│   ├── api-reference.md
│   └── testing.md
│
├── scripts/
│   ├── deployment-notes.md
│   ├── user-data.sh
│   └── health-check.sh
│
└── screenshots/
    │
    ├── application/
    │   ├── 01-login.png
    │   ├── 02-employee-dashboard.png
    │   ├── 03-apply-leave.png
    │   ├── 04-leave-history.png
    │   ├── 05-leave-balance.png
    │   ├── 06-document-upload.png
    │   ├── 07-document-download.png
    │   ├── 08-manager-dashboard.png
    │   ├── 09-manager-approval.png
    │   ├── 10-admin-dashboard.png
    │   └── 11-swagger-api.png
    │
    ├── aws/
    │   ├── 01-vpc.png
    │   ├── 02-subnets.png
    │   ├── 03-route-tables.png
    │   ├── 04-security-groups.png
    │   ├── 05-iam-role.png
    │   ├── 06-rds.png
    │   ├── 07-ec2-01.png
    │   ├── 08-ec2-02.png
    │   ├── 09-alb.png
    │   ├── 10-target-group.png
    │   ├── 11-s3-frontend.png
    │   ├── 12-s3-documents.png
    │   ├── 13-cloudfront.png
    │   ├── 14-route53.png
    │   ├── 15-acm.png
    │   └── 16-ssm-session-manager.png
    │
    └── monitoring/
        ├── 01-cloudwatch-dashboard.png
        ├── 02-cloudwatch-ec2-metrics.png
        ├── 03-cloudwatch-log-groups.png
        ├── 04-cloudwatch-alarms.png
        ├── 05-sns-topic.png
        └── 06-sns-subscription.png

```

---

# 🗄️ Database Design

The PostgreSQL database contains the following core entities:

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

### Main relationships

```text
users
  │
  └── employees
         │
         ├── leave_balances
         │       └── leave_types
         │
         ├── leave_requests
         │       └── leave_types
         │
         └── documents
```

---

# 🔌 API Endpoints

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

## Employees

```text
GET  /api/employees
GET  /api/employees/{employee_id}
POST /api/employees
```

## Leave Management

```text
POST /api/leaves
GET  /api/leaves
GET  /api/leaves/{leave_id}
PUT  /api/leaves/{leave_id}/approve
PUT  /api/leaves/{leave_id}/reject
PUT  /api/leaves/{leave_id}/cancel
```

## Leave Balances

```text
GET /api/employees/{employee_id}/balances
```

## Documents

```text
POST /api/documents/upload
GET  /api/documents/employee/{employee_id}
GET  /api/documents/{document_id}/download
```

## Dashboard

```text
GET /api/dashboard
```

## Health

```text
GET /health
GET /health/database
```

---

# 🖥️ Local Development

## Prerequisites

Install:

- Python 3.11+
- Node.js
- npm
- PostgreSQL
- Git
- VS Code
- AWS CLI

---

## Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/employee-leave-management.git
cd employee-leave-management
```

---

# ⚙️ Backend Setup

```bash
cd backend
python -m venv venv
```

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

### Linux / Ubuntu

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the environment file:

```text
backend/.env
```

Example:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/employee_leave
JWT_SECRET=CHANGE_ME
AWS_REGION=ap-southeast-1
DOCUMENT_BUCKET=employee-leave-documents-2026-najim01
```

Run FastAPI:

```bash
uvicorn app.main:app --reload
```

Open:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

# ⚛️ Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

For local development:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# 🏭 Production Frontend Build

For the AWS deployment:

```env
VITE_API_URL=https://api.mjnazim.online
```

Build:

```bash
npm run build
```

The production files are generated in:

```text
frontend/dist/
```

The build can then be uploaded to the frontend S3 bucket and served through CloudFront.

---

# ☁️ AWS Deployment

The deployment was completed in the following logical stages:

```text
1. VPC and subnet architecture
2. Route tables and Internet Gateway
3. Security Groups
4. Private RDS PostgreSQL
5. EC2 IAM role
6. EC2 #1
7. FastAPI deployment
8. Gunicorn + systemd
9. Application Load Balancer
10. Target Group and health checks
11. EC2 #2
12. S3 frontend bucket
13. React production build
14. CloudFront
15. Route 53
16. ACM certificate
17. HTTPS ALB listener
18. Private S3 documents bucket
19. EC2 S3 IAM permissions
20. CloudWatch monitoring
21. CloudWatch alarms
22. SNS email notification
23. End-to-end validation
```

---

# 🩺 Health Checks

Backend:

```text
https://api.mjnazim.online/health
```

Expected:

```json
{
  "status": "healthy"
}
```

The ALB target group uses the application health endpoint to determine target health.

Expected target state:

```text
EC2 #1 → healthy
EC2 #2 → healthy
```

---

# 📊 Monitoring

CloudWatch is used for monitoring the application infrastructure.

### Metrics

Examples include:

- EC2 CPU utilization
- Network activity
- ALB health
- Target health
- Application/system logs where configured

### Logs

Configured CloudWatch log groups can be used to inspect application-server activity and troubleshoot deployment issues.

### Alarms

CPU-based CloudWatch alarms are configured for the EC2 application instances.

### Notifications

```text
CloudWatch Alarm
      ↓
     SNS
      ↓
Email Notification
```

---

# 🧪 Testing

## Application health

```text
GET /health
```

Expected:

```json
{
  "status": "healthy"
}
```

## Authentication

Test:

```text
Employee login
Manager login
Admin access
```

## Leave workflow

```text
Employee
   ↓
Apply Leave
   ↓
Pending
   ↓
Manager Review
   ↓
Approve / Reject
```

## Document workflow

```text
Employee
   ↓
Upload document
   ↓
FastAPI
   ↓
Private S3
   ↓
Metadata in PostgreSQL
   ↓
Download using application-generated access URL
```

## Infrastructure

Verify:

```text
ALB → EC2 #1 → Healthy
ALB → EC2 #2 → Healthy
EC2 → RDS PostgreSQL
EC2 → S3 Documents
CloudWatch → Metrics / Logs / Alarms
SNS → Email
```

---

# 📸 Screenshots

The project screenshots are organized into three categories.

## 🖥️ Application

### Login
![Login](screenshots/application/01-login.png)

### Employee Dashboard
![Employee Dashboard](screenshots/application/02-employee-dashboard.png)

### Apply Leave
![Apply Leave](screenshots/application/03-apply-leave.png)

### Leave History
![Leave History](screenshots/application/04-leave-history.png)

### Leave Balance
![Leave Balance](screenshots/application/05-leave-balance.png)

### Document Upload
![Document Upload](screenshots/application/06-document-upload.png)

### Document Download
![Document Download](screenshots/application/07-document-download.png)

### Manager Dashboard
![Manager Dashboard](screenshots/application/08-manager-dashboard.png)

### Manager Approval
![Manager Approval](screenshots/application/09-manager-approval.png)

### Admin Dashboard
![Admin Dashboard](screenshots/application/10-admin-dashboard.png)

### Swagger API
![Swagger API](screenshots/application/11-swagger-api.png)

---

## ☁️ AWS Infrastructure

### VPC
![VPC](screenshots/aws/01-vpc.png)

### Subnets
![Subnets](screenshots/aws/02-subnets.png)

### Route Tables
![Route Tables](screenshots/aws/03-route-tables.png)

### Security Groups
![Security Groups](screenshots/aws/04-security-groups.png)

### IAM Role
![IAM Role](screenshots/aws/05-iam-role.png)

### RDS PostgreSQL
![RDS PostgreSQL](screenshots/aws/06-rds.png)

### EC2 #1
![EC2 #1](screenshots/aws/07-ec2-01.png)

### EC2 #2
![EC2 #2](screenshots/aws/08-ec2-02.png)

### Application Load Balancer
![Application Load Balancer](screenshots/aws/09-alb.png)

### Target Group
![Target Group](screenshots/aws/10-target-group.png)

### S3 Frontend
![S3 Frontend](screenshots/aws/11-s3-frontend.png)

### S3 Documents
![S3 Documents](screenshots/aws/12-s3-documents.png)

### CloudFront
![CloudFront](screenshots/aws/13-cloudfront.png)

### Route 53
![Route 53](screenshots/aws/14-route53.png)

### ACM Certificate
![ACM Certificate](screenshots/aws/15-acm.png)

### Systems Manager Session Manager
![SSM Session Manager](screenshots/aws/16-ssm-session-manager.png)

---

## 📊 Monitoring

### CloudWatch Dashboard
![CloudWatch Dashboard](screenshots/monitoring/01-cloudwatch-dashboard.png)

### EC2 Metrics
![CloudWatch EC2 Metrics](screenshots/monitoring/02-cloudwatch-ec2-metrics.png)

### CloudWatch Log Groups
![CloudWatch Log Groups](screenshots/monitoring/03-cloudwatch-log-groups.png)

### CloudWatch Alarms
![CloudWatch Alarms](screenshots/monitoring/04-cloudwatch-alarms.png)

### SNS Topic
![SNS Topic](screenshots/monitoring/05-sns-topic.png)

### SNS Subscription
![SNS Subscription](screenshots/monitoring/06-sns-subscription.png)

> **Security:** Redact passwords, secrets, access keys, database credentials, tokens, private keys, and other sensitive information before adding screenshots to GitHub.

---

# 🛠️ Troubleshooting

## FastAPI service not running

On EC2:

```bash
sudo systemctl status leaveapp
```

View logs:

```bash
sudo journalctl -u leaveapp -n 100 --no-pager
```

Restart:

```bash
sudo systemctl restart leaveapp
```

## Target group unhealthy

Check:

```bash
curl http://127.0.0.1:8000/health
```

Then verify:

```text
Target Group Port: 8000
Health Path: /health
Application Service: running
```

## Frontend cannot reach API

Verify:

```text
VITE_API_URL=https://api.mjnazim.online
```

Rebuild:

```bash
npm run build
```

Also verify backend CORS includes:

```text
https://www.mjnazim.online
```

## Database connection problems

Check:

- RDS endpoint
- Port 5432
- RDS security group
- EC2 application security group
- `DATABASE_URL`
- Database status

## S3 upload problems

Check:

- EC2 IAM role
- S3 bucket name
- AWS region
- S3 bucket permissions
- Block Public Access settings

---

# 🔒 GitHub Security Checklist

Never commit:

```text
.env
backend/.env
frontend/.env
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
JWT secrets
Database passwords
RDS credentials
.pem files
Private keys
Tokens
```

Recommended files:

```text
backend/.env.example
frontend/.env.example
```

---

# 📈 Future Improvements

Potential future enhancements include:

- AWS WAF
- CI/CD using GitHub Actions
- Infrastructure as Code with Terraform or CloudFormation
- Alembic database migrations
- Automated backend/frontend testing
- More granular IAM policies
- Centralized application logging
- RDS Multi-AZ deployment
- Auto Scaling Group
- Containerized deployment with Docker/ECS
- Improved document lifecycle management
- Additional CloudWatch alarms

These are future enhancements and should not be represented as implemented unless they are actually configured.

---

# 🎯 Key AWS Concepts Demonstrated

This project provides hands-on experience with:

- VPC architecture
- CIDR and subnetting
- Availability Zones
- Public and private subnet concepts
- Route tables
- Security Groups
- EC2
- Systems Manager
- Application Load Balancer
- Target Groups
- RDS PostgreSQL
- S3
- CloudFront
- Route 53
- ACM
- IAM
- CloudWatch
- SNS
- HTTPS/TLS
- JWT authentication
- Role-based authorization
- Private document storage
- Health checks
- Multi-instance application deployment

---

# 🧠 Key Challenges Solved

### RDS connectivity

Configured application-to-database networking and verified PostgreSQL connectivity from the EC2 application tier.

### Authentication

Implemented JWT authentication and role-based authorization for Employee, Manager, and Admin access.

### ALB health checks

Configured the `/health` endpoint so the load balancer can check application instance health.

### Multi-instance deployment

Added a second EC2 instance and registered both application servers in the ALB target group.

### Frontend/API integration

Configured the production React build to communicate with the HTTPS API domain.

### S3 document storage

Implemented private employee document storage in S3 and application-controlled document downloads.

### Monitoring

Configured CloudWatch monitoring and SNS notification workflows for operational visibility.

---

# 👨‍💻 Author

**Mohamed Najim Khan MJ**

AWS Solutions Architecture

---

# 📄 License

This project is intended for educational and demonstration purposes.

Add a license that matches how you want others to use the project.
