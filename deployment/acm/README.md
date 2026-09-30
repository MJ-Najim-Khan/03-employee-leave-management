# AWS Certificate Manager

## Overview

AWS Certificate Manager (ACM) provides SSL/TLS certificates for the Employee Leave Management System.

HTTPS protects communication between users and the application.

## Domains

The project uses HTTPS for:

```text
www.YOUR_DOMAIN_NAME.com
api.YOUR_DOMAIN_NAME.com
```

## Certificate Architecture

```text
User
 |
 | HTTPS
 v
www.YOUR_DOMAIN_NAME.com
 |
 v
CloudFront
 |
 v
S3
```

Backend:

```text
User
 |
 | HTTPS
 v
api.YOUR_DOMAIN_NAME.com
 |
 v
Application Load Balancer
 |
 v
EC2
```

## Certificate Usage

The ACM certificate is associated with the appropriate HTTPS endpoint.

For CloudFront distributions, ACM certificates must be provisioned in the AWS region required by CloudFront.

## Security Benefits

* Encrypts client-to-server communication
* Protects authentication credentials
* Protects employee and application data in transit
* Provides trusted HTTPS access
