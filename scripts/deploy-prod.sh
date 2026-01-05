#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# 0) Git Code Commit
echo "== PGit Code Commit =="

npm git add .
npm git commit -m „neues automatisches COMMIT“
npm git push origin main

# 1) DB Migrationen (Production) - IMPORTANT: deploy, nicht dev
echo "== Prod DB migrate deploy (using .env.prod.migrate) =="
npx dotenv -e .env -- npx prisma migrate deploy

# 2) Vercel Deploy
echo "== Vercel deploy --prod =="
npm i -g vercel
vercel login
npx vercel --prod

