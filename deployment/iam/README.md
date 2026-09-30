# AWS IAM Configuration

## Overview

AWS Identity and Access Management (IAM) controls permissions for AWS resources used by the Employee Leave Management System.

The project follows the principle of granting only the permissions required by each AWS component.

## EC2 IAM Role

The EC2 application instances use an IAM role to access required AWS services without storing long-term AWS access keys on the server.

The role can provide permissions for services such as:

```text
Amazon S3
AWS Secrets Manager
Amazon CloudWatch
AWS Systems Manager
```

## Permission Flow

```text
EC2 Instance
     |
     v
IAM Role
     |
     +----> S3
     |
     +----> Secrets Manager
     |
     +----> CloudWatch
     |
     +----> Systems Manager
```

## Security Principles

* Avoid hard-coded AWS access keys.
* Use IAM roles for EC2 workloads.
* Grant only required permissions.
* Restrict S3 access to required buckets.
* Restrict Secrets Manager access to required secrets.
* Review IAM policies periodically.

## Example S3 Permission Scope

Application permissions should be restricted to the project document bucket rather than granting unrestricted access to all S3 resources.

## Credentials

AWS credentials and secrets must never be committed to GitHub.

Use IAM roles, environment configuration, and AWS Secrets Manager where appropriate.
