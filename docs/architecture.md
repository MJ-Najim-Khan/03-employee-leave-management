# Employee Leave Management System — Architecture

## 1. Overview

The Employee Leave Management System is a role-based web application for managing employee leave requests, approvals, leave balances, employee documents, and administrative data.

### Technology stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| Object storage | Amazon S3 |
| Compute | Amazon EC2 |
| Load balancing | Application Load Balancer |
| CDN | Amazon CloudFront |
| DNS | Amazon Route 53 |
| TLS | AWS Certificate Manager |
| Access control | IAM + application RBAC |
| Administration | AWS Systems Manager Session Manager |
| Monitoring | Amazon CloudWatch |
| Notifications | Amazon SNS |

Regional AWS resources use `ap-southeast-1` (Singapore).

## 2. High-Level Architecture

```text
User
 |
 +--> Route 53 --> CloudFront --> S3 Frontend --> React
 |
 +--> Route 53 --> HTTPS/ACM --> ALB --> EC2 #1 :8000
                              |             |
                              +----------> EC2 #2 :8000
                                            |
                         +------------------+------------------+
                         |                                     |
                         v                                     v
                   RDS PostgreSQL                    Private S3 Documents

EC2 / ALB / Application --> CloudWatch --> Alarms --> SNS --> Email
Administrator --> Systems Manager Session Manager --> EC2
```

## 3. Frontend

The React/Vite production build is stored in the frontend S3 bucket and delivered through CloudFront. The application uses the configured API base URL for backend requests.

Frontend hostname:

```text
https://www.mjnazim.online
```

Frontend bucket:

```text
employee-leave-frontend-2026-najim01
```

## 4. Application Tier

FastAPI runs on two EC2 instances and is exposed through an Application Load Balancer. The application listens on port `8000`.

```text
ALB
 +-- EC2 #1 -> FastAPI :8000
 +-- EC2 #2 -> FastAPI :8000
```

Application service:

```text
leaveapp.service
```

Health endpoint:

```text
GET /health
```

## 5. Database

FastAPI connects to PostgreSQL on Amazon RDS.

```text
FastAPI -> PostgreSQL -> RDS
```

Database:

```text
employee_leave
```

Port:

```text
5432
```

## 6. Document Storage

Supporting employee documents are stored in a separate private S3 bucket while document metadata is stored in PostgreSQL.

```text
React -> FastAPI -> S3 Documents
                 +-> PostgreSQL metadata
```

Bucket:

```text
employee-leave-documents-2026-najim01
```

## 7. Authentication and Roles

Application roles are:

```text
EMPLOYEE
MANAGER
ADMIN
```

Protected API requests use JWT bearer authentication:

```http
Authorization: Bearer <access_token>
```

## 8. DNS and HTTPS

```text
www.mjnazim.online -> CloudFront -> S3 Frontend
api.mjnazim.online -> ALB HTTPS :443 -> EC2 :8000
```

ACM provides the TLS certificate used by the API HTTPS listener.

## 9. Monitoring and Operations

Current CloudWatch log group:

```text
Employee-Leave-Management-Logs
```

Operational flow:

```text
EC2 -> CloudWatch -> Alarm -> SNS -> Email
```

EC2 administration uses Systems Manager Session Manager.

## 10. Core Workflows

### Leave request
```text
Employee -> React -> POST /api/leaves -> FastAPI -> PostgreSQL
```

### Approval
```text
Manager -> React -> PUT /api/leaves/{id}/approve -> PostgreSQL
```

### Rejection
```text
Manager -> React -> PUT /api/leaves/{id}/reject -> PostgreSQL
```

### Cancellation
```text
Employee -> React -> PUT /api/leaves/{id}/cancel -> PostgreSQL
```

### Document upload
```text
Employee -> React -> FastAPI -> S3 + PostgreSQL metadata
```

## 11. Availability

The application tier has two EC2 targets behind the ALB target group `employee-leave-targets`. The ALB health check uses `/health`.

This provides multiple application targets. Do not describe the environment as an Auto Scaling Group unless one is actually configured.

## 12. Repository Evidence

Recommended architecture assets:

```text
architecture/architecture-diagram.drawio
architecture/architecture-diagram.png
```

Recommended evidence directories:

```text
screenshots/application/
screenshots/aws/
screenshots/monitoring/
```

Redact secrets, credentials, tokens, and private keys before publishing screenshots.
