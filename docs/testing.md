# Employee Leave Management System — Testing

## 1. Test Strategy

Testing covers application behavior, API behavior, database connectivity, AWS infrastructure, security controls, end-to-end workflows, monitoring, and controlled resilience checks.

## 2. Health Tests

```bash
curl -i http://127.0.0.1:8000/health
curl -i http://127.0.0.1:8000/health/database
```

Production:

```text
https://api.mjnazim.online/health
```

Expected application health:

```json
{"status":"healthy"}
```

## 3. Authentication Tests

Test:

```text
Valid employee login
Valid manager login
Valid admin login
Invalid username
Invalid password
Missing token
Invalid/expired token
```

## 4. Employee Workflow

Verify:

```text
Login
 -> Employee Dashboard
 -> Leave balance loads
 -> Apply Leave
 -> Leave appears in history
 -> Pending request can be cancelled when eligible
```

## 5. Manager Workflow

Verify:

```text
Manager Dashboard
 -> Pending requests visible
 -> Approve works
 -> Reject works
 -> Optional comments are saved when supported
 -> Employee sees updated status
```

## 6. Admin Workflow

Test the implemented admin screens:

```text
Employee management
Department management
Leave type management
User listing
User disabling where permitted
```

Confirm admin-only operations require appropriate authorization.

## 7. Document Testing

### Upload

Verify:

```text
File upload succeeds
S3 object exists
PostgreSQL metadata exists
Document appears in list
```

### Download

Verify authorized download works and unauthorized document access is rejected. S3 should remain private.

## 8. ALB Testing

Target group:

```text
employee-leave-targets
```

Expected:

```text
EC2 #1 -> healthy
EC2 #2 -> healthy
```

Health check:

```text
HTTP :8000 /health
```

## 9. DNS / HTTPS

Test:

```text
https://www.mjnazim.online
https://api.mjnazim.online/health
https://api.mjnazim.online/docs
```

Verify DNS resolution, TLS validity, frontend loading, and API responses.

## 10. CloudFront

Verify the latest frontend build is served. When content is stale after deployment, confirm the S3 upload and use a CloudFront invalidation when required.

## 11. S3 Security

Verify:

```text
Documents bucket is not public
Required EC2 IAM access works
Anonymous object access is not permitted
```

## 12. CloudWatch

Verify:

```text
Employee-Leave-Management-Logs exists
Log streams receive events where configured
EC2 metrics are visible
Alarms exist
Alarm configuration is correct
```

## 13. SNS

Verify:

```text
SNS topic exists
Email subscription is Confirmed
Controlled test notification is received
```

## 14. Controlled Resilience Test

In a controlled environment, temporarily make one application target unavailable and verify the ALB routes traffic to the remaining healthy target. Restore the instance and confirm it returns to healthy status.

Avoid destructive tests that can cause data loss or unplanned user impact.

## 15. Final Regression Checklist

```text
[ ] Login
[ ] Role detection
[ ] Employee dashboard
[ ] Leave balance
[ ] Apply leave
[ ] Leave history
[ ] Cancel leave
[ ] Manager dashboard
[ ] Approve
[ ] Reject
[ ] Admin dashboard
[ ] Employee management
[ ] Department management
[ ] Leave type management
[ ] Document upload
[ ] Document list
[ ] Document download
[ ] API health
[ ] Database health
[ ] ALB target health
[ ] HTTPS
[ ] Route 53
[ ] CloudFront
[ ] S3 privacy
[ ] IAM access
[ ] CloudWatch
[ ] SNS
```

## 16. Evidence

Store project evidence under:

```text
screenshots/application/
screenshots/aws/
screenshots/monitoring/
```

Redact secrets, tokens, credentials, and private keys before publishing.
