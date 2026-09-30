# Employee Leave Management System — Deployment Notes

## 1. Purpose

This document records the operational deployment details for the Employee Leave Management System.

## 2. Application Stack

- Frontend: React + Vite
- Backend: Python FastAPI
- Database: PostgreSQL
- Application server: Gunicorn with Uvicorn workers
- Process manager: systemd
- AWS Region: `ap-southeast-1`
- Backend application port: `8000`

## 3. Public Endpoints

| Component | Endpoint |
|---|---|
| Frontend | `https://www.mjnazim.online` |
| API | `https://api.mjnazim.online` |
| Swagger | `https://api.mjnazim.online/docs` |

## 4. High-Level Architecture

```text
                           Route 53
                         /            \\
                        /              \\
                       v                v
             www.mjnazim.online    api.mjnazim.online
                       |                 |
                       v                 v
                  CloudFront             ALB
                       |              HTTPS :443
                       v                 |
                 S3 Frontend      +------+------+
                                  |             |
                                  v             v
                              EC2 #1         EC2 #2
                              FastAPI        FastAPI
                                  \\             /
                                   \\           /
                                    v         v
                                   RDS PostgreSQL

                    EC2 Application Tier
                         |         |
                         |         +------> CloudWatch
                         v
                   S3 Documents

                 CloudWatch Alarm
                         |
                         v
                        SNS
                         |
                         v
                       Email
```

## 5. Main AWS Resources

| Resource | Purpose |
|---|---|
| `employee-leave-vpc` | Application VPC |
| `employee-leave-alb` | Public API load balancer |
| `employee-leave-targets` | EC2 target group |
| `employee-leave-api-01` | FastAPI instance 1 |
| `employee-leave-api-02` | FastAPI instance 2 |
| `employee-leave-db` | PostgreSQL RDS instance |
| `employee-leave-frontend-2026-najim01` | React frontend bucket |
| `employee-leave-documents-2026-najim01` | Private employee-document bucket |
| `employee-leave-ec2-role` | EC2 IAM role |

> Resource names above reflect the current project configuration. Update them if your AWS console uses different names.

## 6. EC2 Application Layout

Application root:

```text
/home/ubuntu/employee-leave-management
```

Backend:

```text
/home/ubuntu/employee-leave-management/backend
```

Virtual environment:

```text
/home/ubuntu/employee-leave-management/backend/venv
```

systemd service:

```text
/etc/systemd/system/leaveapp.service
```

## 7. Production Process

```text
Gunicorn
   |
   +-- UvicornWorker
         |
         +-- FastAPI app.main:app
               |
               +-- Port 8000
```

## 8. systemd Service

Reference service configuration:

```ini
[Unit]
Description=Employee Leave Management FastAPI Application
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/employee-leave-management/backend
Environment="PATH=/home/ubuntu/employee-leave-management/backend/venv/bin"
EnvironmentFile=/home/ubuntu/employee-leave-management/backend/.env

ExecStart=/home/ubuntu/employee-leave-management/backend/venv/bin/gunicorn \\
    app.main:app \\
    -k uvicorn.workers.UvicornWorker \\
    --workers 2 \\
    --bind 0.0.0.0:8000

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable leaveapp
sudo systemctl restart leaveapp
```

Check:

```bash
sudo systemctl status leaveapp --no-pager
```

## 9. Backend Environment

Example only; never commit real secret values:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@RDS_ENDPOINT:5432/employee_leave
JWT_SECRET=CHANGE_ME
AWS_REGION=ap-southeast-1
DOCUMENT_BUCKET=employee-leave-documents-2026-najim01
```

The production `.env` must remain outside Git history.

## 10. ALB Configuration

Target group:

```text
employee-leave-targets
```

Target port:

```text
8000
```

Health check:

```text
Protocol: HTTP
Port: 8000
Path: /health
```

Expected state:

```text
EC2 #1 -> healthy
EC2 #2 -> healthy
```

## 11. DNS and HTTPS

Frontend:

```text
https://www.mjnazim.online
```

API:

```text
https://api.mjnazim.online
```

The API hostname resolves through Route 53 to the Application Load Balancer. The ALB HTTPS listener uses an ACM certificate for TLS.

## 12. S3

### Frontend bucket

```text
employee-leave-frontend-2026-najim01
```

Production build:

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://employee-leave-frontend-2026-najim01
```

### Documents bucket

```text
employee-leave-documents-2026-najim01
```

The documents bucket should remain private with Block Public Access enabled.

Application flow:

```text
React -> FastAPI -> S3 Documents
                     |
                     +-> PostgreSQL metadata
```

## 13. IAM

EC2 instances use the IAM role:

```text
employee-leave-ec2-role
```

Use IAM roles rather than long-lived AWS access keys on the servers.

## 14. CloudWatch

The EC2 instances use the CloudWatch agent for configured log and monitoring collection.

Useful checks:

```bash
sudo systemctl status amazon-cloudwatch-agent --no-pager
```

```bash
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a query
```

The AWS Console configuration is the source of truth for the actual log group names used by the deployment.

## 15. CloudWatch Alarms and SNS

Monitoring flow:

```text
EC2
  |
  v
CloudWatch Metric
  |
  v
CloudWatch Alarm
  |
  v
SNS
  |
  v
Email
```

Validate that the configured alarms are present and the SNS subscription is confirmed.

## 16. Standard Operational Commands

### Application status

```bash
sudo systemctl status leaveapp --no-pager
```

### Restart application

```bash
sudo systemctl restart leaveapp
```

### View application logs

```bash
sudo journalctl -u leaveapp -n 100 --no-pager
```

### Follow application logs

```bash
sudo journalctl -u leaveapp -f
```

### Check port 8000

```bash
sudo ss -lntp | grep ':8000'
```

### Test local health endpoint

```bash
curl -fsS http://127.0.0.1:8000/health
```

Expected:

```json
{"status":"healthy"}
```

### Test database health endpoint

```bash
curl -fsS http://127.0.0.1:8000/health/database
```

### Verify IAM identity

```bash
aws sts get-caller-identity
```

### Verify document-bucket access

```bash
aws s3 ls s3://employee-leave-documents-2026-najim01
```

## 17. Validation Sequence

Use this order when troubleshooting:

```text
FastAPI
  ↓
Database
  ↓
EC2 service
  ↓
ALB target health
  ↓
HTTPS API
  ↓
Frontend
  ↓
S3 document workflow
  ↓
CloudWatch / SNS
```

## 18. Deployment Checklist

- [ ] Application repository is available on the server
- [ ] Python virtual environment exists
- [ ] Backend dependencies are installed
- [ ] Production `.env` exists on the server
- [ ] `leaveapp` is enabled and running
- [ ] `/health` returns `healthy`
- [ ] `/health/database` reports a healthy database connection
- [ ] EC2 #1 is healthy in the ALB target group
- [ ] EC2 #2 is healthy in the ALB target group
- [ ] API HTTPS endpoint works
- [ ] Frontend CloudFront URL works
- [ ] Route 53 records resolve correctly
- [ ] S3 document bucket is private
- [ ] EC2 IAM role provides required permissions
- [ ] CloudWatch agent is running
- [ ] CloudWatch alarms exist
- [ ] SNS email subscription is confirmed

## 19. Troubleshooting

### ALB target unhealthy

```bash
curl -i http://127.0.0.1:8000/health
sudo systemctl status leaveapp --no-pager
sudo ss -lntp | grep ':8000'
```

Confirm the target group uses HTTP port `8000` and `/health`.

### FastAPI returns 500

```bash
sudo journalctl -u leaveapp -n 100 --no-pager
```

Check application configuration, dependencies, and database connectivity.

### S3 access denied

```bash
aws sts get-caller-identity
aws s3 ls s3://employee-leave-documents-2026-najim01
```

Check the EC2 role and bucket permissions.

### Frontend calls the wrong API

Check the production Vite setting:

```env
VITE_API_URL=https://api.mjnazim.online
```

Rebuild and redeploy the frontend after changing it.

### CORS errors

Verify that the backend allows the real frontend origin:

```text
https://www.mjnazim.online
```

## 20. Rollback

### Backend

1. Restore a known-good Git commit.
2. Update the application code on the affected EC2 instance.
3. Restart `leaveapp`.
4. Verify `/health`.
5. Verify ALB target health.

### Frontend

1. Restore the previous production build.
2. Upload it to the frontend S3 bucket.
3. Invalidate CloudFront if required.
4. Verify the public frontend.

Database changes should be handled separately and carefully.

## 21. Security Rules

Never store these in this repository:

```text
.env
AWS access keys
AWS secret keys
Database passwords
JWT secrets
Private keys
.pem files
Tokens
```

Review all screenshots before publishing them to GitHub and redact sensitive information.
