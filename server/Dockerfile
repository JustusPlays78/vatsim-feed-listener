# Production Dockerfile for Backend Server
FROM node:18-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy server code
COPY server.js ./

# Create directory for event cache
RUN mkdir -p /app && touch /app/event-cache.json

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/vatsim/data || exit 1

# Start server
CMD ["node", "server.js"]
