FROM node:18-slim

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production --no-audit --progress=false

# Copy application source
COPY . .

# Expose port
EXPOSE 5001

# Start the app
CMD ["node", "dist/app.js"]