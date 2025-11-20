FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies for build
COPY package*.json ./
RUN npm ci --no-audit --progress=false

# Copy sources and build
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --only=production --no-audit --progress=false

# Copy built artifacts from build stage
COPY --from=build /app/dist ./dist

EXPOSE 5001
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -qO- http://localhost:5001/health || exit 1

# Run the compiled entrypoint accordingly.
CMD ["node", "dist/src/app.js"]