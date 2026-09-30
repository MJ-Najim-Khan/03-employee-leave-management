# Employee Leave Management System — Security

## 1. Security Model

Security is implemented in layers:

```text
Network controls
 -> Security groups
 -> Private database
 -> Private S3 documents
 -> IAM roles
 -> JWT authentication
 -> RBAC
 -> HTTPS
 -> Secure secret handling
 -> Systems Manager
 -> CloudWatch monitoring
```

## 2. Network Security

The ALB is the public API entry point. Application traffic is forwarded to the EC2 application tier on port `8000`. PostgreSQL uses port `5432` and should be reachable only from the permitted application tier.

## 3. Security Groups

Recommended tier relationship:

```text
Internet -> ALB security group -> application security group -> RDS security group
```

Prefer security-group references for tier-to-tier rules where applicable. Avoid unrestricted database ingress.

## 4. RDS

The production RDS database should be private:

```text
Public access: Disabled
Port: 5432
Database: employee_leave
```

Database passwords must stay outside source control.

## 5. IAM

EC2 uses the IAM role:

```text
employee-leave-ec2-role
```

Use IAM roles for AWS access from EC2 rather than hard-coded long-lived credentials.

## 6. S3 Documents

Bucket:

```text
employee-leave-documents-2026-najim01
```

Expected posture:

```text
Block Public Access: Enabled
Anonymous read: Disabled
Anonymous write: Disabled
```

The backend controls document access and uses the EC2 role to access S3.

## 7. Frontend S3 / CloudFront

The frontend should be delivered through CloudFront using the configured S3 origin-access mechanism. Avoid broad public write permissions and avoid exposing unnecessary bucket contents.

## 8. Authentication

The application uses JWT access tokens. Protected requests use:

```http
Authorization: Bearer <access_token>
```

Never expose the signing secret or production tokens in the frontend source, logs, screenshots, or Git history.

## 9. RBAC

Roles:

```text
EMPLOYEE
MANAGER
ADMIN
```

Backend authorization must enforce privileged operations even when the frontend hides or shows role-specific screens.

## 10. CORS

The production frontend origin is:

```text
https://www.mjnazim.online
```

Configure the API to allow the intended frontend origin rather than a broad wildcard in production.

## 11. Secrets

Never commit:

```text
.env
DATABASE_URL with real credentials
JWT_SECRET
AWS access keys
AWS secret keys
JWT tokens
.pem files
private keys
```

Use `.env.example` for placeholders only.

## 12. HTTPS

Public endpoints:

```text
https://www.mjnazim.online
https://api.mjnazim.online
```

The API HTTPS listener uses ACM.

## 13. EC2 Administration

Systems Manager Session Manager is used for EC2 administration. This avoids making direct public SSH exposure a requirement for routine access.

## 14. Document Protection

The secure document path is:

```text
Authenticated user -> FastAPI authorization -> S3 object access
```

S3 objects should remain private.

## 15. Monitoring Security

CloudWatch provides operational visibility. Avoid putting credentials, tokens, or other secrets into logs.

Current log group:

```text
Employee-Leave-Management-Logs
```

## 16. GitHub Release Review

Before publishing, inspect source, build output, documentation, and screenshots for secrets. Remove sensitive data from Git history as well as current files if it was previously committed.

## 17. Future Enhancements

Potential improvements include AWS WAF, Secrets Manager, CloudTrail, VPC endpoints, dependency scanning, stronger upload validation, and more granular IAM policies. Document these as implemented only after configuration is complete.
