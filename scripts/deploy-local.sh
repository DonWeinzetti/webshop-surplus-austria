#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== Local deploy: migrate dev (using .env.migrate) =="
npx dotenv -e .env.migrate -- npx prisma migrate dev

echo "== Prisma generate =="
npx prisma generate

echo "== Next build =="
npm run build

echo "== Start production server on http://localhost:3000 =="
npm run start
