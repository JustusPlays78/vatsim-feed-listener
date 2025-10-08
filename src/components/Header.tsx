import { Plane, Moon, Sun, Github, Info, Radio, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '../store';
import { Container } from './layout';
import { Badge, Button } from './ui';

export default function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md border-b border-gray-200 dark:border-gray-700 transition-all duration-200">
      <Container size="full">
        <div className="flex items-center justify-between py-4">
          {/* Logo & Title */}
          <Link
            to="/"
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  VATSIM Flight Analyzer
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Real-time Flight Tracking
                </p>
              </div>
            </div>
          </Link>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'primary' : 'ghost'}
                size="sm"
                leftIcon={<Radio className="w-4 h-4" />}
              >
                Live Flights
              </Button>
            </Link>
            <Link to="/events">
              <Button
                variant={isActive('/events') ? 'primary' : 'ghost'}
                size="sm"
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Events
              </Button>
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <Badge
              variant="success"
              size="md"
              rounded
              className="hidden sm:flex"
            >
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live Data
            </Badge>

            {/* Quick Links */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Info className="w-4 h-4" />}
                onClick={() => window.open('https://vatsim.net', '_blank')}
              >
                About VATSIM
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Github className="w-4 h-4" />}
                onClick={() =>
                  window.open(
                    'https://github.com/JustusPlays78/vatsim-feed-listener',
                    '_blank'
                  )
                }
              >
                GitHub
              </Button>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-2 pb-3 border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <Link to="/" className="flex-1">
            <Button
              variant={isActive('/') ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Radio className="w-4 h-4" />}
              fullWidth
            >
              Live Flights
            </Button>
          </Link>
          <Link to="/events" className="flex-1">
            <Button
              variant={isActive('/events') ? 'primary' : 'outline'}
              size="sm"
              leftIcon={<Calendar className="w-4 h-4" />}
              fullWidth
            >
              Events
            </Button>
          </Link>
        </nav>
      </Container>
    </header>
  );
}
