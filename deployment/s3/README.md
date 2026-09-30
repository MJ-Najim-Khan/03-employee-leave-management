# Amazon S3 Deployment

## Overview

Amazon S3 is used for two purposes in the Employee Leave Management System:

1. Hosting frontend application assets.
2. Storing employee documents uploaded through the application.

## S3 Architecture

```text
                    Amazon S3
                       |
          +------------+------------+
          |                         |
          v                         v
 Frontend Bucket             Documents Bucket
          |                         |
          v                         v
   React Application          Employee Documents
```

## Frontend Bucket

The frontend build artifacts are stored in an S3 bucket and delivered through Amazon CloudFront.

Example bucket:

```text
employee-leave-frontend-2026-najim01
```

## Documents Bucket

Employee documents are stored separately from frontend assets.

Example bucket:

```text
employee-leave-documents-2026-najim01
```

## Document Flow

```text
Employee
   |
   v
React Frontend
   |
   v
FastAPI Backend
   |
   v
Amazon S3 Documents Bucket
```

## Security

The documents bucket should remain private.

Application access should be controlled through IAM permissions rather than public bucket access.

Sensitive employee documents should never be committed to GitHub.

## Example AWS CLI

List objects:

```bash
aws s3 ls s3://employee-leave-documents-2026-najim01/
```

Download documents:

```bash
aws s3 cp \
s3://employee-leave-documents-2026-najim01/ \
./documents/ \
--recursive
```

Upload a document:

```bash
aws s3 cp document.pdf \
s3://employee-leave-documents-2026-najim01/
```
