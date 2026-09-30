# Amazon EC2 Deployment

## Overview

Amazon EC2 hosts the FastAPI backend of the Employee Leave Management System.

The application backend is deployed across two EC2 instances to provide application-level redundancy behind an Application Load Balancer.

## Architecture

```text
                    Application Load Balancer
                              |
                 +------------+------------+
                 |                         |
                 v                         v
             EC2 Instance 1           EC2 Instance 2
                 |                         |
                 +------------+------------+
                              |
                         FastAPI Backend
```

## Configuration

| Component          | Configuration                       |
| ------------------ | ----------------------------------- |
| Service            | Amazon EC2                          |
| Instances          | 2                                   |
| Operating System   | ubuntu                               |
| Application        | FastAPI                             |
| Application Server | Gunicorn + UvicornWorker            |
| Application Port   | 8000                                |
| AWS Region         | ap-southeast-1                      |
| Access Method      | AWS Systems Manager Session Manager |

## Application Deployment

The backend application is deployed from the project repository.

```bash
git clone <repository-url>
cd employee-leave-management/backend
```

A Python virtual environment is used for application dependencies.

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

The application is managed as a systemd service.

Example service configuration:

```text
leaveapp.service
```

The backend runs using Gunicorn with Uvicorn workers.

```bash
gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --workers 2
```

## Health Check

The application exposes a health endpoint:

```text
/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

## Security

* No SSH access is required for normal administration.
* EC2 access is provided through Systems Manager Session Manager.
* Security Groups restrict inbound traffic.
* Database access is restricted to the application tier.
* Sensitive configuration values are not stored in GitHub.

## Monitoring

EC2 instances are monitored using Amazon CloudWatch.

Metrics and logs are used to monitor application and infrastructure health.
