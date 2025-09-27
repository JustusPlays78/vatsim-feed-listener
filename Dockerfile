# Multi-stage build für optimierte Node.js App
FROM node:18-alpine as builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm ci --only=production && npm cache clean --force

# Production Stage
FROM node:18-alpine

# Maintenance und Security Labels
LABEL maintainer="VATSIM Flight Analyzer" \
      version="1.0.0" \
      description="Dockerized VATSIM Flight Data Analyzer with Node.js backend" \
      org.opencontainers.image.source="https://github.com/JustusPlays78/vatsim-feed-listener"

# Non-root user erstellen
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# App-Verzeichnis erstellen
WORKDIR /app

# Dependencies kopieren
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# App-Dateien kopieren
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs server.js ./
COPY --chown=nextjs:nodejs public ./public

# User wechseln
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Port exponieren
EXPOSE 3000

# App starten
CMD ["node", "server.js"]