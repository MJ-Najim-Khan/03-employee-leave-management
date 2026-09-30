#!/bin/bash
set -u

# Employee Leave Management System
# EC2 application health-check utility.
#
# Usage:
#   ./health-check.sh
#   ./health-check.sh https://api.example.com
#
# Without an argument, only local EC2 health is checked.
# With an argument, the public API /health endpoint is also tested.

LOCAL_URL="http://127.0.0.1:8000/health"
PUBLIC_URL="${1:-}"
PASS_COUNT=0
FAIL_COUNT=0

pass_check() {
    echo "[PASS] $1"
    PASS_COUNT=$((PASS_COUNT + 1))
}

fail_check() {
    echo "[FAIL] $1"
    FAIL_COUNT=$((FAIL_COUNT + 1))
}

info() {
    echo "[INFO] $1"
}

echo "============================================"
echo " Employee Leave Management Health Check"
echo "============================================"
echo

# 1. systemd service
if systemctl is-active --quiet leaveapp; then
    pass_check "leaveapp.service is active"
else
    fail_check "leaveapp.service is not active"
fi

# 2. Port 8000
if ss -lnt 2>/dev/null | grep -q ':8000 '; then
    pass_check "FastAPI is listening on TCP port 8000"
else
    fail_check "Nothing is listening on TCP port 8000"
fi

# 3. Local /health
LOCAL_RESPONSE="$(curl -fsS --max-time 5 "${LOCAL_URL}" 2>/dev/null || true)"
if echo "${LOCAL_RESPONSE}" | grep -q '"status"[[:space:]]*:[[:space:]]*"healthy"'; then
    pass_check "Local /health endpoint returned healthy"
else
    fail_check "Local /health endpoint did not return the expected response"
    [ -n "${LOCAL_RESPONSE}" ] && echo "       Response: ${LOCAL_RESPONSE}"
fi

# 4. Optional database health
DB_URL="http://127.0.0.1:8000/health/database"
DB_RESPONSE="$(curl -fsS --max-time 5 "${DB_URL}" 2>/dev/null || true)"
if echo "${DB_RESPONSE}" | grep -q '"database"[[:space:]]*:[[:space:]]*"connected"'; then
    pass_check "Database health endpoint reports connected"
elif [ -n "${DB_RESPONSE}" ]; then
    info "Database health endpoint response: ${DB_RESPONSE}"
else
    info "Database health endpoint was not available or did not return data"
fi

# 5. Optional public API
if [ -n "${PUBLIC_URL}" ]; then
    PUBLIC_RESPONSE="$(curl -fsS --max-time 10 "${PUBLIC_URL%/}/health" 2>/dev/null || true)"
    if echo "${PUBLIC_RESPONSE}" | grep -q '"status"[[:space:]]*:[[:space:]]*"healthy"'; then
        pass_check "Public API /health endpoint returned healthy"
    else
        fail_check "Public API /health endpoint did not return the expected response"
        [ -n "${PUBLIC_RESPONSE}" ] && echo "       Response: ${PUBLIC_RESPONSE}"
    fi
fi

echo
echo "--------------------------------------------"
echo " Passed: ${PASS_COUNT}"
echo " Failed: ${FAIL_COUNT}"
echo "--------------------------------------------"

if [ "${FAIL_COUNT}" -eq 0 ]; then
    echo "Overall result: HEALTHY"
    exit 0
fi

echo "Overall result: CHECK REQUIRED"
echo
echo "Useful commands:"
echo "  sudo systemctl status leaveapp --no-pager"
echo "  sudo journalctl -u leaveapp -n 100 --no-pager"
echo "  sudo ss -lntp | grep ':8000'"
exit 1
