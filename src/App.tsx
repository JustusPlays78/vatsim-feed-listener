import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useThemeStore } from './store';
import Header from './components/Header';
import { ChangelogModal } from './components/ChangelogModal';
import { Container } from './components/layout';
import { Loader2 } from 'lucide-react';
import {
  APP_VERSION,
  VATSIM_DATA_URL,
  STATSIM_URL,
  GITHUB_REPO,
} from './config/constants';

// Lazy load pages for better performance
const LiveFlightsPage = lazy(() => import('./pages/LiveFlightsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ImprintPage = lazy(() => import('./pages/ImprintPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
  </div>
);

function App() {
  const { theme, setTheme } = useThemeStore();
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // System theme detection
  useEffect(() => {
    const savedTheme = localStorage.getItem('vatsim-theme');
    if (!savedTheme) {
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, [setTheme]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
      <Header />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LiveFlightsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/imprint" element={<ImprintPage />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="mt-auto py-6 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <Container size="xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Left: Version & Copyright */}
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Version {APP_VERSION}
              </span>
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <span className="text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()}{' '}
                <a
                  href="https://julscha.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:underline"
                >
                  Julscha
                </a>
              </span>
            </div>

            {/* Right: Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
              <a
                href={VATSIM_DATA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
              >
                VATSIM Data
              </a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a
                href={STATSIM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
              >
                STATSIM API
              </a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
              >
                GitHub
              </a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <button
                onClick={() => setIsChangelogOpen(true)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
              >
                Changelog
              </button>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a
                href="/privacy"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
              >
                Privacy
              </a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a
                href="/imprint"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
              >
                Imprint
              </a>
            </div>
          </div>
        </Container>
      </footer>

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </div>
  );
}

export default App;
