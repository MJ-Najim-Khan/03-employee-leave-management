# Amazon CloudWatch Monitoring

## Overview

Amazon CloudWatch provides monitoring and observability for the Employee Leave Management System.

The project uses CloudWatch to monitor EC2 infrastructure, application logs, metrics, and alarms.

## Monitoring Architecture

```text
EC2 Instances
     |
     v
CloudWatch Agent
     |
     +------> Metrics
     |
     +------> Log Groups
     |
     +------> Alarms
              |
              v
             SNS
              |
              v
            Email
```

## Monitoring Components

### EC2 Metrics

Important infrastructure metrics include:

* CPU utilization
* Disk usage
* Memory utilization
* Network activity

### Application Logs

Application and system logs are collected into CloudWatch Logs.

This helps with:

* Troubleshooting
* Application monitoring
* Error investigation
* Operational visibility

### CloudWatch Dashboard

A dashboard provides a centralized view of important application and infrastructure metrics.

## Alarms

CloudWatch alarms can monitor threshold conditions and send notifications through SNS.

Example monitored conditions:

```text
High CPU utilization
Low available memory
Application errors
```

## CloudWatch Agent

The CloudWatch Agent runs on the EC2 instances.

Example service check:

```bash
sudo systemctl status amazon-cloudwatch-agent
```

## Monitoring Flow

```text
EC2
 |
 v
CloudWatch Agent
 |
 +----> Metrics
 |
 +----> Logs
 |
 v
CloudWatch
 |
 v
Alarm
 |
 v
SNS
```
