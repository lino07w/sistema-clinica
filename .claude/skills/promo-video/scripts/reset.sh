#!/bin/bash
# Deja la base de datos LOCAL en el estado inicial del video (¡la borra!).
# Variables DB_* opcionales; por defecto, PostgreSQL local "clinica_e2e".
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../../.." && pwd)"
cd "$REPO/clinica-backend"
NODE_ENV=development \
  DB_HOST="${DB_HOST:-localhost}" DB_USER="${DB_USER:-postgres}" DB_PASSWORD="${DB_PASSWORD:-postgres}" \
  DB_NAME="${DB_NAME:-clinica_e2e}" DEFAULT_ADMIN_PASSWORD=demo1234 \
  npm run seed --silent 2>&1 | grep -E "🚀|❌"
node "$HERE/prep.cjs"
