# Employee Leave Management System — Deployment Guide

## 1. Deployment Scope

The production deployment consists of a React/Vite frontend, FastAPI backend, PostgreSQL on RDS, two EC2 application instances, an ALB, S3, CloudFront, Route 53, ACM, IAM, CloudWatch, SNS, and Systems Manager.

Region for regional resources:

```text
ap-southeast-1
```

## 2. Deployment Order

```text
VPC/networking -> security groups -> RDS -> IAM -> EC2 -> FastAPI/systemd
-> ALB/target group -> S3 frontend -> CloudFront -> Route 53 -> ACM/HTTPS
-> EC2 #2 -> S3 documents -> CloudWatch -> SNS -> final validation
```

## 3. Backend

Application path:

```text
~/employee-leave-management
```

Backend path:

```text
~/employee-leave-management/backend
```

Create the virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 4. Production Environment

Example only; never commit real secret values:

```env
DATABASE_URL=postgresql://USER:PASSWORD@RDS_ENDPOINT:5432/employee_leave
JWT_SECRET=REPLACE_WITH_SECURE_VALUE
AWS_REGION=ap-southeast-1
DOCUMENT_BUCKET=employee-leave-documents-2026-najim01
```

## 5. systemd / Gunicorn

Service:

```text
leaveapp.service
```

Reference configuration:

```ini
[Unit]
Description=Employee Leave Management FastAPI Application
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/employee-leave-management/backend
Environment="PATH=/home/ubuntu/employee-leave-management/backend/venv/bin"
EnvironmentFile=/home/ubuntu/employee-leave-management/backend/.env
ExecStart=/home/ubuntu/employee-leave-management/backend/venv/bin/gunicorn app.main:app -k uvicorn.workers.UvicornWorker --workers 2 --bind 0.0.0.0:8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Commands:

```bash
sudo systemctl daemon-reload
sudo systemctl enable leaveapp
sudo systemctl start leaveapp
sudo systemctl status leaveapp --no-pager
```

## 6. Backend Validation

```bash
curl -i http://127.0.0.1:8000/health
curl -i http://127.0.0.1:8000/health/database
sudo ss -lntp | grep ':8000'
```

## 7. ALB

Target group:

```text
employee-leave-targets
```

Configuration:

```text
Protocol: HTTP
Port: 8000
Health path: /health
```

Register both EC2 instances and confirm both targets are healthy.

## 8. Frontend

Production API configuration:

```env
VITE_API_URL=https://api.mjnazim.online
```

Build and upload:

```bash
npm install
npm run build
aws s3 sync dist/ s3://employee-leave-frontend-2026-najim01
```

## 9. CloudFront and Route 53

```text
www.mjnazim.online -> CloudFront -> S3 Frontend
api.mjnazim.online -> ALB
```

After frontend updates, invalidate CloudFront when cached content prevents the latest build from appearing.

## 10. HTTPS / ACM

API hostname:

```text
api.mjnazim.online
```

ALB listener:

```text
HTTPS :443
```

The listener uses the ACM certificate for the API hostname and forwards to the FastAPI target group.

## 11. EC2 #2

For the second application instance:

```text
1. Confirm the instance is running.
2. Confirm the IAM role is attached.
3. Confirm FastAPI dependencies are installed.
4. Confirm .env exists securely.
5. Start leaveapp.service.
6. Test /health locally.
7. Register the target.
8. Confirm ALB target health.
```

## 12. Documents S3

Bucket:

```text
employee-leave-documents-2026-najim01
```

Verify the EC2 role can access the bucket:

```bash
aws sts get-caller-identity
aws s3 ls s3://employee-leave-documents-2026-najim01
```

Keep the bucket private.

## 13. CloudWatch and SNS

CloudWatch agent:

```bash
sudo systemctl status amazon-cloudwatch-agent --no-pager
```

Current log group:

```text
Employee-Leave-Management-Logs
```

Confirm alarms exist and the SNS email subscription is confirmed.

## 14. Final Checklist

```text
[ ] RDS available
[ ] EC2 #1 running
[ ] EC2 #2 running
[ ] FastAPI active on both
[ ] /health passes on both
[ ] /health/database passes
[ ] ALB targets healthy
[ ] HTTPS API works
[ ] Swagger works
[ ] Frontend works
[ ] Route 53 resolves
[ ] CloudFront serves the frontend
[ ] Documents bucket private
[ ] IAM access works
[ ] CloudWatch logs available
[ ] Alarms configured
[ ] SNS confirmed
[ ] Employee/manager/admin workflows pass
```
