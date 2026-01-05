#!/bin/bash
set -e

echo "== Prod DB migrate deploy (using .env.prod.migrate) =="

npx dotenv -e .env.prod.migrate -- prisma migrate deploy

echo "== Vercel deploy --prod =="

npx vercel@latest --prod
