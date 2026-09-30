# Amazon Route 53 Deployment

## Overview

Amazon Route 53 provides DNS management for the Employee Leave Management System.

The application uses separate DNS names for the frontend and backend API.

## Domain

```text
YOUR_DOMAIN_NAME.com
```

## DNS Architecture

```text
                    YOUR_DOMAIN_NAME.com
                          |
                      Route 53
                     /         \
                    /           \
                   v             v
       www.YOUR_DOMAIN_NAME.com    api.YOUR_DOMAIN_NAME.com
                |                    |
                v                    v
           CloudFront               ALB
                |                    |
                v                    v
               S3                   EC2
```

## DNS Records

| DNS Name                                        | Purpose         |
| ----------------------------------------------- | --------------- |
| [www.YOUR_DOMAIN_NAME.com](http://www.YOUR_DOMAIN_NAME.com) | React frontend  |
| api.YOUR_DOMAIN_NAME.com                             | FastAPI backend |

## Frontend

```text
www.YOUR_DOMAIN_NAME.com
        |
        v
CloudFront
        |
        v
S3
```

## Backend

```text
api.YOUR_DOMAIN_NAME.com
        |
        v
Application Load Balancer
        |
        v
EC2 Instances
```

## HTTPS

Route 53 works together with AWS Certificate Manager and the corresponding AWS services to provide HTTPS access.

## DNS Verification

```bash
nslookup www.YOUR_DOMAIN_NAME.com
```

```bash
nslookup api.YOUR_DOMAIN_NAME.com
```
