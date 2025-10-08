# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-08

### Added

- ✨ **Complete React + TypeScript Rewrite**
  - Modern React 18.2 with Hooks
  - Full TypeScript type safety
  - Vite 5.0 for lightning-fast HMR
- 🎨 **Professional Design System**

  - Custom UI Component Library (Button, Input, Card, Badge, Table)
  - Dynamic sortable & searchable Table component
  - Responsive Grid and Layout components
  - Consistent theme with design tokens

- 🌓 **Enhanced Dark Mode**
  - System preference detection
  - Persistent theme selection
  - Smooth transitions
- 💾 **Smart Features**
  - Client-side caching (5min TTL)
  - Deep linking with URL parameters
  - Keyboard shortcuts (Ctrl+Enter, /, ESC)
- 📊 **Live Data Dashboard**

  - Real-time VATSIM flight data
  - Statistics cards (Total, Departures, Arrivals, Aircraft Types)
  - Advanced filtering and search
  - Sortable columns with visual indicators

- 🔧 **Developer Experience**

  - Vitest testing setup
  - ESLint + Prettier configuration
  - VS Code settings & extensions
  - GitHub Actions CI/CD pipeline

- � **Deployment**
  - Docker multi-stage builds
  - Nginx production configuration
  - Docker Compose for full stack
  - Automated setup scripts (Windows & Unix)

### Changed

- **Architecture**: Vanilla JS → React with TypeScript
- **Styling**: Bootstrap 5 → Tailwind CSS 3.3
- **State Management**: Local state → Zustand 4.4
- **Build Tool**: None → Vite 5.0
- **API Integration**: Direct calls → Service layer with proper error handling
- **Data Source**: STATSIM → VATSIM Live Data API (v3)

### Technical Stack

- **Frontend**: React 18.2, TypeScript 5.2, Tailwind CSS 3.3
- **State**: Zustand 4.4 (Cache, Flights, Favorites, Theme stores)
- **Routing**: React Router 6.20 with URL parameters
- **Build**: Vite 5.0 with fast HMR
- **Testing**: Vitest 1.0 + React Testing Library
- **Backend**: Express.js 4.18 (VATSIM API proxy)
- **Icons**: Lucide React 0.294
- **Date Handling**: date-fns 3.0

### Fixed

- 🐛 CORS issues with direct VATSIM API calls
- 🐛 Date range validation for live data
- 🐛 Footer positioning (now sticky to bottom)
- 🐛 TypeScript path aliases
- 🐛 Theme persistence across sessions

### Removed

- Bootstrap 5 dependencies
- jQuery dependencies
- PHP backend (replaced with Node.js/Express)
- Historical data queries (VATSIM v3 API is live-only)

---

## [1.0.0] - 2024-09-27

### Added

- 🎉 Initial release with Vanilla JavaScript
- 🎨 Bootstrap 5 UI framework
- ✈️ Basic flight search functionality
- 🔌 STATSIM API integration
- 🌓 Dark/Light theme toggle
- 🐳 Basic Docker support
- 📋 Flight data table display

### Technical

- Vanilla JavaScript (ES6+)
- Bootstrap 5.3
- Node.js + Express backend
- PHP for API proxy
- FontAwesome icons

---

## Upcoming Features 🚀

### [2.1.0] - Planned

- [ ] CSV/JSON Export functionality
- [ ] Advanced filters (aircraft type, altitude range)
- [ ] Pagination for large datasets
- [ ] Flight details modal with full route info

### [2.2.0] - Planned

- [ ] 🗺️ Interactive map visualization (Leaflet.js)
- [ ] 📍 Real-time aircraft positioning
- [ ] ⭐ Favorites/bookmarks system
- [ ] 🔔 Flight notifications

### [3.0.0] - Future

- [ ] 📈 Historical data analytics
- [ ] 📊 Charts and graphs (Chart.js)
- [ ] 🔐 User authentication
- [ ] 💾 Cloud data persistence
- [ ] 📱 Progressive Web App (PWA)
- [ ] 🌐 Multi-language support

---

**Legend:**

- ✨ New feature
- 🐛 Bug fix
- 🎨 Styling/UI improvements
- ⚡ Performance enhancement
- 🔒 Security update
- 📝 Documentation
- 🔧 Configuration change
- 🗑️ Deprecation
- ❌ Breaking change
