# Deployment Scripts

Operational scripts and deployment notes for the Employee Leave Management System.

## Files

| File | Purpose |
|---|---|
| `deployment-notes.md` | AWS deployment architecture, configuration, validation, operations, and troubleshooting |
| `user-data.sh` | Ubuntu bootstrap script for a FastAPI application EC2 instance |
| `health-check.sh` | Application, service, port, database, and optional public API health checks |

## Usage

### Health check

```bash
chmod +x health-check.sh
./health-check.sh
```

Optional public API test:

```bash
./health-check.sh https://api.mjnazim.online
```

### User-data script

Before using `user-data.sh`, replace the placeholder GitHub repository URL and provide the production `.env` securely. The script deliberately contains no credentials.

## Security

Do not commit:

- database passwords
- JWT secrets
- AWS access keys
- private keys
- tokens
- production `.env` files
