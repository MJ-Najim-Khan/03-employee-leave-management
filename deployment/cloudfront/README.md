# Amazon CloudFront Deployment

## Overview

Amazon CloudFront distributes the React frontend application stored in Amazon S3.

CloudFront provides the public HTTPS endpoint for the frontend and improves content delivery through edge locations.

## Architecture

```text
User
 |
 v
Route 53
 |
 v
CloudFront
 |
 v
S3 Frontend Bucket
 |
 v
React Application
```

## Configuration

| Component | Configuration         |
| --------- | --------------------- |
| Service   | Amazon CloudFront     |
| Origin    | S3 frontend bucket    |
| Protocol  | HTTPS                 |
| Access    | Origin Access Control |
| Region    | ap-southeast-1        |

## Security

The S3 frontend bucket is kept private.

CloudFront uses Origin Access Control (OAC) to access the S3 origin.

This prevents users from directly accessing the S3 bucket.

## Frontend Deployment

The React application is built before deployment.

```bash
npm install
npm run build
```

The generated `dist/` directory is uploaded to the frontend S3 bucket.

```bash
aws s3 sync dist/ s3://employee-leave-frontend-2026-najim01/
```

## Request Flow

```text
Browser
   |
   v
www.YOUR_DOMAIN_NAME.com
   |
   v
Route 53
   |
   v
CloudFront
   |
   v
Private S3 Bucket
   |
   v
React Application
```
