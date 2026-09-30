#!/bin/bash
set -euo pipefail

# Employee Leave Management System
# Ubuntu application-server bootstrap script.
#
# IMPORTANT:
# 1. Replace GITHUB_REPO before use.
# 2. This script intentionally contains no production secrets.
# 3. Provide the production backend .env securely before starting the service.
#
# Expected FastAPI entry point: app.main:app
# Expected application port: 8000

APP_USER="ubuntu"
APP_DIR="/home/${APP_USER}/employee-leave-management"
BACKEND_DIR="${APP_DIR}/backend"
VENV_DIR="${BACKEND_DIR}/venv"
GITHUB_REPO="https://github.com/YOUR_USERNAME/employee-leave-management.git"
GIT_BRANCH="main"

log() {
    echo "[leaveapp-bootstrap] $1"
}

log "Installing operating-system packages"
apt-get update
apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    curl \
    nginx \
    postgresql-client

log "Preparing application directory"
mkdir -p "/home/${APP_USER}"
chown -R "${APP_USER}:${APP_USER}" "/home/${APP_USER}"

if [ ! -d "${APP_DIR}/.git" ]; then
    log "Cloning application repository"
    sudo -u "${APP_USER}" git clone --branch "${GIT_BRANCH}" "${GITHUB_REPO}" "${APP_DIR}"
else
    log "Updating existing repository"
    sudo -u "${APP_USER}" bash -c "cd '${APP_DIR}' && git fetch origin && git checkout '${GIT_BRANCH}' && git pull --ff-only origin '${GIT_BRANCH}'"
fi

log "Creating Python virtual environment"
sudo -u "${APP_USER}" python3 -m venv "${VENV_DIR}"

log "Installing backend dependencies"
sudo -u "${APP_USER}" "${VENV_DIR}/bin/pip" install --upgrade pip
sudo -u "${APP_USER}" "${VENV_DIR}/bin/pip" install -r "${BACKEND_DIR}/requirements.txt"

log "Creating systemd service"
cat > /etc/systemd/system/leaveapp.service <<SERVICE
[Unit]
Description=Employee Leave Management FastAPI Application
After=network.target

[Service]
User=${APP_USER}
WorkingDirectory=${BACKEND_DIR}
Environment="PATH=${VENV_DIR}/bin"
EnvironmentFile=${BACKEND_DIR}/.env

ExecStart=${VENV_DIR}/bin/gunicorn \\
    app.main:app \\
    -k uvicorn.workers.UvicornWorker \\
    --workers 2 \\
    --bind 0.0.0.0:8000

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

log "Reloading systemd"
systemctl daemon-reload
systemctl enable leaveapp

if [ -f "${BACKEND_DIR}/.env" ]; then
    log "Starting application"
    systemctl restart leaveapp
else
    log "WARNING: ${BACKEND_DIR}/.env is missing"
    log "Create the production environment file, then run:"
    log "  sudo systemctl restart leaveapp"
fi

log "Bootstrap completed"
python3 --version
git --version
