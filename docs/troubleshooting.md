# Employee Leave Management System — Troubleshooting

## 1. FastAPI Service Down

```bash
sudo systemctl status leaveapp --no-pager
sudo journalctl -u leaveapp -n 100 --no-pager
sudo systemctl restart leaveapp
```

## 2. Port 8000 Not Listening

```bash
sudo ss -lntp | grep ':8000'
curl -i http://127.0.0.1:8000/health
```

Check the virtual environment, dependencies, `.env`, systemd configuration, and application startup logs.

## 3. Health Check Failure

Expected:

```json
{"status":"healthy"}
```

If it fails, troubleshoot the FastAPI process before changing ALB configuration.

## 4. Database Health Failure

```bash
curl -i http://127.0.0.1:8000/health/database
```

Check RDS status, endpoint, database name, port `5432`, security groups, credentials, and `DATABASE_URL`. Do not make RDS public as a workaround.

## 5. ALB Target Unhealthy

Target group:

```text
employee-leave-targets
```

Confirm:

```text
Protocol: HTTP
Port: 8000
Health path: /health
```

Then test `/health` locally on the EC2 instance and verify the ALB-to-EC2 security-group rule.

## 6. HTTPS API Failure

Test:

```text
https://api.mjnazim.online/health
```

Check Route 53, ACM certificate, ALB HTTPS listener, forwarding rules, target health, and security groups.

## 7. Frontend Loads but API Calls Fail

Verify the production API setting:

```env
VITE_API_URL=https://api.mjnazim.online
```

Rebuild and upload:

```bash
npm run build
aws s3 sync dist/ s3://employee-leave-frontend-2026-najim01
```

Then inspect browser developer tools for the failing request and CORS response.

## 8. CORS Failure

Verify the exact browser origin:

```text
https://www.mjnazim.online
```

Update backend CORS, restart the service, and test again.

## 9. Swagger 405 on Login

If a `POST` endpoint is opened directly in the address bar, the browser sends `GET`. A `405 Method Not Allowed` response is expected when the method is not supported. Use Swagger's **Try it out** or the frontend form.

## 10. S3 Access Denied

```bash
aws sts get-caller-identity
aws s3 ls s3://employee-leave-documents-2026-najim01
```

Check the EC2 IAM role, policy, bucket name, region, and bucket security settings. Do not make employee documents public to bypass IAM.

## 11. Document Upload Failure

Check:

```text
DOCUMENT_BUCKET
AWS_REGION
IAM permissions
PostgreSQL connectivity
application logs
```

## 12. Document Download Failure

Check authentication, authorization, document ID, stored S3 key, IAM permissions, and existence of the object.

## 13. CloudWatch Agent

```bash
sudo systemctl status amazon-cloudwatch-agent --no-pager
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a query
sudo journalctl -u amazon-cloudwatch-agent -n 100 --no-pager
```

Verify the EC2 role has the permissions required by the configured agent.

## 14. SNS Email Missing

Open the SNS topic subscriptions and confirm the email subscription is `Confirmed`. Pending subscriptions require the recipient to confirm the message.

## 15. EC2 #2 Unhealthy

```bash
sudo systemctl status leaveapp --no-pager
curl -i http://127.0.0.1:8000/health
```

Then inspect target registration, port 8000, health path, security groups, IAM role, and application logs.

## 16. CloudFront Shows Old Files

Upload the latest build and invalidate the relevant CloudFront paths when necessary.

## 17. Diagnostic Order

```text
1. systemd / Gunicorn
2. local /health
3. /health/database
4. EC2 networking / security groups
5. ALB target health
6. HTTPS API
7. frontend API configuration / CORS
8. S3 documents
9. CloudWatch / SNS
```
