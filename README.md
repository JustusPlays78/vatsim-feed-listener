# VATSIM Flight Analyzer - React Migration

## 🎯 Project Overview

This is the **React + TypeScript** migration of the VATSIM Flight Analyzer. The original Vanilla JS version is preserved in the `public/` folder.

### Tech Stack
- ⚡ **Vite** - Fast build tool
- ⚛️ **React 18** - UI library
- 📘 **TypeScript** - Type safety
- 🎨 **Tailwind CSS** - Utility-first CSS
- 🐻 **Zustand** - Lightweight state management
- 🧭 **React Router** - Client-side routing
- 🧪 **Vitest** - Unit testing

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

```bash
cd react-app
npm install
```

### Development

```bash
# Start React dev server (Port 3000)
npm run dev

# Start backend server (Port 3001) - IN SEPARATE TERMINAL
cd ..
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
react-app/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── SearchForm.tsx
│   │   ├── FlightResults.tsx
│   │   ├── FlightTable.tsx
│   │   ├── Statistics.tsx
│   │   └── ExportButtons.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useFlightData.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── index.ts
│   ├── services/           # API services
│   │   └── flightService.ts
│   ├── store/              # Zustand state management
│   │   └── index.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── exportHelpers.ts
│   │   └── dateHelpers.ts
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🏗️ Architecture

### State Management (Zustand)
- `useCacheStore` - Client-side caching with 5min TTL
- `useFlightStore` - Flight data, loading states, errors
- `useFavoritesStore` - Persisted favorite airports (localStorage)
- `useThemeStore` - Dark/light theme (persisted)

### Custom Hooks
- `useFlightData` - Fetch and cache flight data
- `useKeyboardShortcuts` - Global keyboard shortcuts

### API Service
- `FlightService.fetchFlights()` - Proxied STATSIM API calls

---

## 🎨 Features Implemented

### ✅ Core Features
- [x] Flight search by ICAO code and date range
- [x] Real-time flight data from STATSIM API
- [x] Client-side caching (5 min TTL)
- [x] Dark/light theme toggle
- [x] Responsive design

### ✅ Quality of Life
- [x] URL-based deep linking
- [x] Keyboard shortcuts (Ctrl+Enter, ESC, /)
- [x] CSV/JSON export
- [x] Statistics dashboard
- [x] Top departure airports

### 🚧 Planned Features
- [ ] Favorite airports quick-select
- [ ] Sortable table columns
- [ ] Advanced filtering
- [ ] Live map visualization
- [ ] PWA support

---

## 🛠️ Development

### Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run tests
npm run test:ui      # Run tests with UI
```

### Environment Variables

Create `.env` file in `react-app/`:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_CACHE_TTL=300000
```

---

## 🐳 Docker Deployment

### Option 1: React Only (Development)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY react-app/package*.json ./
RUN npm ci
COPY react-app/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-react.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 2: Full Stack (React + Node Backend)

```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
  
  frontend:
    build:
      context: ./react-app
      dockerfile: Dockerfile.react
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_BASE_URL=http://backend:3000/api
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
src/
├── components/
│   ├── __tests__/
│   │   ├── Header.test.tsx
│   │   ├── SearchForm.test.tsx
│   │   └── FlightTable.test.tsx
├── hooks/
│   └── __tests__/
│       └── useFlightData.test.ts
└── utils/
    └── __tests__/
        └── exportHelpers.test.ts
```

---

## 📝 Migration Notes

### From Vanilla JS to React

**What Changed:**
1. **State Management**: Vanilla JS class → Zustand stores
2. **Theme System**: CSS variables + data-attribute → Tailwind + class toggle
3. **Event Handling**: Manual DOM listeners → React event props
4. **Routing**: `window.history.pushState` → React Router
5. **Styling**: Inline `<style>` + Bootstrap → Tailwind CSS utility classes

**What Stayed:**
- Backend server (`server.js`) - unchanged
- API proxy structure
- STATSIM API integration
- Core business logic

### Performance Improvements
- Code splitting with Vite
- Tree shaking
- Lazy loading of components
- Optimized re-renders with React.memo

---

## 🔒 Security

- TypeScript for type safety
- Input sanitization on client and server
- CORS configured correctly
- No sensitive data in localStorage
- CSP headers in production

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)

---

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes in `react-app/` directory
3. Run tests and linting
4. Submit PR with description

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details

---

**Next Steps:**
1. Install dependencies: `npm install`
2. Start dev servers (backend + frontend)
3. Visit http://localhost:3000
4. Read component documentation in `/docs`
