# AWS Systems Manager Session Manager

## Overview

AWS Systems Manager Session Manager provides secure shell access to the EC2 instances without requiring inbound SSH access.

The Employee Leave Management System uses Session Manager for server administration.

## Architecture

```text
Administrator
      |
      v
AWS Systems Manager
      |
      v
Session Manager
      |
      +----------------+
      |                |
      v                v
   EC2 #1           EC2 #2
```

## Benefits

* No SSH port required
* No public SSH keys required
* Centralized access through AWS
* IAM-based authorization
* Session activity can be monitored
* Useful for private or restricted EC2 instances

## Connection

From the AWS Management Console:

```text
AWS Console
   |
   v
Systems Manager
   |
   v
Session Manager
   |
   v
Start Session
   |
   v
Select EC2 Instance
```

## CLI Example

If the AWS CLI and permissions are configured:

```bash
aws ssm start-session --target <INSTANCE-ID>
```

## Service Requirement

The EC2 instance must have the SSM Agent installed and running.

Check the service:

```bash
sudo systemctl status amazon-ssm-agent
```

## IAM Requirement

The EC2 instance requires an appropriate IAM role containing permissions for Systems Manager.

## Security

Session Manager removes the need to expose SSH port `22` to the internet and provides an IAM-controlled administration mechanism.
