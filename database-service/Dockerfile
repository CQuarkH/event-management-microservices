# Stage: builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .

ARG DATABASE_URL="postgresql://postgres:password@localhost:5432/database_service_db?schema=public"
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate
RUN npm run build

# Stage: runner
FROM node:20-alpine
WORKDIR /app

# instalar cliente postgres para pg_isready
RUN apk add --no-cache postgresql-client bash

ENV NODE_ENV=production
# PRISMA_STRATEGY: "push" (default dev) or "deploy" (production with migrations commited)
ENV PRISMA_STRATEGY=${PRISMA_STRATEGY:-push}

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

ENTRYPOINT ["sh","-c","\
  echo Waiting for Postgres at ${DB_HOST:-db}:${DB_PORT:-5432}... && \
  until pg_isready -h ${DB_HOST:-db} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres}; do \
    echo 'Postgres not ready - sleeping 1s...' && sleep 1; \
  done && \
  echo 'Postgres is ready. PRISMA_STRATEGY='${PRISMA_STRATEGY} && \
  if [ \"${PRISMA_STRATEGY}\" = \"deploy\" ]; then \
    echo 'Running: npx prisma migrate deploy' && npx prisma migrate deploy; \
  else \
    echo 'Running: npx prisma db push --accept-data-loss' && npx prisma db push --accept-data-loss; \
  fi && \
  echo 'Starting app...' && exec node dist/server.js \
"]
