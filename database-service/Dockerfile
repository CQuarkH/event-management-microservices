# Stage: builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .

# Allow injecting DATABASE_URL at build time (use a safe/test URL)
ARG DATABASE_URL="postgresql://postgres:password@localhost:5432/database_service_db?schema=public"
ENV DATABASE_URL=${DATABASE_URL}

# Now prisma generate will see process.env.DATABASE_URL from ENV above
RUN npx prisma generate

RUN npm run build

# Stage: runner
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
