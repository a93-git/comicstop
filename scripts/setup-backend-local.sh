#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

echo "==> Setting up ComicStop backend for local development (SQLite)"

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found: $BACKEND_DIR" >&2
  exit 1
fi

cd "$BACKEND_DIR"

echo "==> Installing backend dependencies"
npm install

ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" << 'EOF'
NODE_ENV=development
PORT=3001

# Use SQLite locally
DB_DIALECT=sqlite
# DB_STORAGE will be backend/dev.sqlite by default via config; override here if desired
# DB_STORAGE=

JWT_SECRET=dev_secret_change_me
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
EOF
  echo "==> Created $ENV_FILE"
else
  echo "==> Using existing $ENV_FILE"
fi

echo "==> Seeding local database"
NODE_OPTIONS=--no-warnings node src/seed/seedLocal.js || true

echo "==> Setup complete. Start the server with: npm run dev"
