# VATSIM Flight Analyzer

Eine moderne, dockerisierte Web-Anwendung zur Analyse von VATSIM-Flugdaten mit der STATSIM API. Verwendet Node.js/Express Backend mit CORS-Proxy für nahtlose API-Integration.

![VATSIM Flight Analyzer](https://img.shields.io/badge/VATSIM-Flight%20Analyzer-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✈️ Features

- **🎨 Modernes UI**: Bootstrap 5 mit custom CSS für professionelles Aussehen
- **📊 Live-Statistiken**: Gesamtflüge, Ankünfte, Abflüge und Top-Abflughäfen
- **📱 Responsive Design**: Optimiert für Desktop und Mobile
- **🔄 Real-time API**: Node.js Proxy für CORS-freie STATSIM API Integration
- **⚡ Performance**: Express.js mit automatischem Caching
- **🐳 Docker Ready**: Vollständig containerisiert für einfaches Deployment
- **🔐 Sicherheit**: CORS-Unterstützung und sichere API-Proxying

## 🚀 Quick Start

### Mit Docker Compose (Empfohlen)

```bash
# Repository klonen
git clone https://github.com/JustusPlays78/vatsim-feed-listener.git
cd vatsim-feed-listener

# Container starten
docker compose up -d

# Anwendung öffnen
open http://localhost:9080
```

### Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Oder Production Server
npm start

# Anwendung öffnen
open http://localhost:3000
```

## 🏗️ Architektur

### Backend (Node.js/Express)
```
server.js               # Haupt-Server mit API-Proxy
├── /api/flights       # STATSIM API Proxy Endpoint
├── /health            # Health Check
└── /*                 # SPA Fallback
```

### Frontend (Vanilla JS)
```
public/
├── index.html         # Haupt-HTML mit Bootstrap UI
├── app.js            # JavaScript-Logik
└── favicon.svg       # App-Icon
```

## 🐳 Docker Deployment

### Production Deployment

```bash
# Image bauen
docker build -t vatsim-flight-analyzer .

# Container starten
docker run -d \
  --name vatsim-analyzer \
  -p 9080:80 \
  --restart unless-stopped \
  vatsim-flight-analyzer
```

### Mit Traefik Reverse Proxy

```yaml
version: '3.8'
services:
  vatsim-flight-analyzer:
    build: .
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.vatsim-analyzer.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.vatsim-analyzer.entrypoints=websecure"
      - "traefik.http.routers.vatsim-analyzer.tls.certresolver=letsencrypt"
```

## 🔧 Konfiguration

### Umgebungsvariablen

| Variable | Beschreibung | Default |
|----------|-------------|---------|
| `NGINX_HOST` | Nginx Host | `localhost` |
| `NGINX_PORT` | Nginx Port | `80` |

### CORS Konfiguration

Die Anwendung ist so konfiguriert, dass sie CORS für API-Aufrufe unterstützt. Für produktive Umgebungen sollten Sie die CORS-Einstellungen in der `nginx.conf` anpassen.

## 🛠️ Entwicklung

### Projektstruktur

```
datalivefeedvatsim/
├── index.html          # Haupt-HTML-Datei
├── app.js             # JavaScript-Logik
├── Dockerfile         # Docker-Konfiguration
├── nginx.conf         # Nginx-Konfiguration
├── docker-compose.yml # Docker Compose Setup
└── .github/
    └── workflows/
        └── deploy.yml # CI/CD Pipeline
```

### API Integration

Die Anwendung nutzt die STATSIM API:

```javascript
const apiUrl = 'https://api.statsim.net/api/Flights/IcaoDestination';
const response = await fetch(`${apiUrl}?icao=${icao}&from=${from}&to=${to}`);
```

### Lokale Entwicklung

```bash
# Mit Live-Reload (empfohlen für Entwicklung)
docker compose -f docker-compose.dev.yml up

# Oder direkt mit nginx
docker run -d \
  --name vatsim-dev \
  -p 8080:80 \
  -v $(pwd):/usr/share/nginx/html \
  nginx:alpine
```

## 📊 Performance

- **Gzip-Kompression**: Alle Assets werden komprimiert
- **Caching**: 1-Jahr Cache für statische Assets
- **HTTP/2 Support**: Via nginx
- **Minimal Container**: Alpine Linux für kleine Images

## 🔐 Sicherheit

- **Security Headers**: CSP, HSTS, X-Frame-Options
- **No Server Tokens**: Nginx-Version wird nicht preisgegeben
- **Input Validation**: Client- und serverseitig
- **HTTPS Ready**: Vorbereitet für SSL/TLS

## 🚦 CI/CD

Die GitHub Actions Pipeline bietet:

- **Automated Building**: Multi-Platform Docker Images
- **Security Scanning**: Trivy Vulnerability Scanner
- **Deployment**: Automatisches Deploy auf Production
- **Notifications**: Slack-Benachrichtigungen

### Secrets für GitHub Actions

```bash
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-token
DEPLOY_HOST=your-server-ip
DEPLOY_USER=deployment-user
DEPLOY_KEY=your-ssh-private-key
DEPLOY_PORT=22
SLACK_WEBHOOK_URL=your-slack-webhook
```

## 🐛 Troubleshooting

### Häufige Probleme

1. **CORS-Fehler**: Prüfen Sie die nginx.conf CORS-Einstellungen
2. **API nicht erreichbar**: Firewall/Netzwerk-Konfiguration prüfen
3. **Container startet nicht**: Logs prüfen mit `docker logs vatsim-analyzer`

### Debugging

```bash
# Container-Logs anzeigen
docker logs -f vatsim-flight-analyzer

# In Container einloggen
docker exec -it vatsim-flight-analyzer sh

# Nginx-Konfiguration testen
docker exec vatsim-flight-analyzer nginx -t
```

## 📝 Changelog

### v1.0.0 (2025-09-27)
- 🎉 Initial Release
- ✨ Moderne HTML/JS-Anwendung
- 🐳 Docker-Support
- 📊 STATSIM API Integration
- 🎨 Responsive Bootstrap UI

## 🤝 Contributing

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/awesome-feature`)
3. Changes committen (`git commit -m 'Add awesome feature'`)
4. Branch pushen (`git push origin feature/awesome-feature`)
5. Pull Request erstellen

## 📄 License

Dieses Projekt steht unter der MIT License - siehe [LICENSE](LICENSE) für Details.

## 🙏 Acknowledgments

- [VATSIM](https://vatsim.net/) für das Flight Simulation Network
- [STATSIM](https://api.statsim.net/) für die API
- [Bootstrap](https://getbootstrap.com/) für das UI Framework
- [Font Awesome](https://fontawesome.com/) für die Icons

---

**Made with ❤️ for the VATSIM Community**