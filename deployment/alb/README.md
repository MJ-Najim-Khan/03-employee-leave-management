# Application Load Balancer Deployment

## Overview

An Application Load Balancer (ALB) provides a single entry point for the Employee Leave Management System backend and distributes requests across the two EC2 instances.

## Architecture

```text
Users
  |
  v
Application Load Balancer
  |
  +------------------+
  |                  |
  v                  v
EC2 Instance 1    EC2 Instance 2
  |                  |
  +--------+---------+
           |
        FastAPI
```

## Configuration

| Component     | Configuration             |
| ------------- | ------------------------- |
| Load Balancer | Application Load Balancer |
| Scheme        | Internet-facing           |
| Protocol      | HTTP / HTTPS              |
| Backend Port  | 8000                      |
| Target Type   | Instance                  |
| Targets       | 2 EC2 instances           |
| Region        | ap-southeast-1            |

## Target Group

The ALB forwards requests to the backend target group.

Health checks verify that each EC2 instance is serving the application correctly.

Example health check:

```text
Protocol: HTTP
Port: 8000
Path: /health
```

Expected response:

```json
{
  "status": "healthy"
}
```

## Traffic Flow

```text
Client
  |
  v
HTTPS
  |
  v
ALB
  |
  +----> EC2 #1 :8000
  |
  +----> EC2 #2 :8000
```

## Security

The ALB Security Group allows web traffic from the internet.

The EC2 Security Group allows application traffic from the ALB rather than exposing the backend application directly to the internet.

## Benefits

* Single backend endpoint
* Health-based traffic distribution
* Application redundancy
* Simplified backend access
* Support for HTTPS termination
