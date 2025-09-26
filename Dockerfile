# Multi-stage build für optimierte Größe
FROM node:18-alpine as builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Nur die notwendigen Dateien kopieren
COPY package*.json ./

# Dependencies installieren (falls vorhanden)
RUN npm install --only=production 2>/dev/null || echo "Keine package.json gefunden, überspringe npm install"

# Production Stage
FROM nginx:1.25-alpine

# Maintenance und Security Labels
LABEL maintainer="VATSIM Flight Analyzer" \
      version="1.0.0" \
      description="Dockerized VATSIM Flight Data Analyzer with nginx" \
      org.opencontainers.image.source="https://gitea.example.com/user/datalivefeedvatsim"

# Nginx Konfiguration
COPY nginx.conf /etc/nginx/nginx.conf

# App-Dateien kopieren
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Berechtigungen setzen
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Port exponieren
EXPOSE 80

# Nginx im Vordergrund starten
CMD ["nginx", "-g", "daemon off;"]