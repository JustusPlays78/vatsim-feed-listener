# Multi-stage build für optimierte Node.js App
FROM node:18-alpine AS builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren (neuere npm Syntax)
RUN npm ci --omit=dev && npm cache clean --force

# Production Stage
FROM node:18-alpine

# Maintenance und Security Labels
LABEL maintainer="VATSIM Flight Analyzer" \
      version="1.0.0" \
      description="Dockerized VATSIM Flight Data Analyzer with Node.js backend" \
      org.opencontainers.image.source="https://github.com/JustusPlays78/vatsim-feed-listener"

# Non-root user erstellen
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001 -G nodejs

# App-Verzeichnis erstellen
WORKDIR /app

# Dependencies kopieren
COPY --from=builder --chown=nodeapp:nodejs /app/node_modules ./node_modules

# App-Dateien kopieren
COPY --chown=nodeapp:nodejs package*.json ./
COPY --chown=nodeapp:nodejs server.js ./
COPY --chown=nodeapp:nodejs public ./public

# User wechseln
USER nodeapp

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Port exponieren
EXPOSE 3000

# App starten
CMD ["node", "server.js"]