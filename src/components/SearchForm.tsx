import { useState, useRef } from 'react';
import { Search, MapPin, Info } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useFlightData } from '../hooks/useFlightData';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export default function SearchForm() {
  const [searchParams] = useSearchParams();
  const { fetchFlights, isLoading } = useFlightData();

  const [icao, setIcao] = useState(searchParams.get('icao') || 'EDDF');
  const [error, setError] = useState('');

  const icaoRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');

    if (!validateInput()) return;

    // Fetch LIVE data
    await fetchFlights({ icao: icao.toUpperCase() });
  };

  const validateInput = () => {
    if (icao.length !== 4) {
      setError('Please enter a valid 4-letter ICAO code (e.g., EDDF)');
      return false;
    }
    if (!/^[A-Z]{4}$/i.test(icao)) {
      setError('ICAO code must contain only letters');
      return false;
    }
    return true;
  };

  useKeyboardShortcuts({
    onSubmit: handleSubmit,
    onFocusSearch: () => icaoRef.current?.focus(),
  });

  // Popular airports for quick selection
  const popularAirports = [
    { code: 'EDDF', name: 'Frankfurt' },
    { code: 'EDDM', name: 'Munich' },
    { code: 'EGLL', name: 'London Heathrow' },
    { code: 'KJFK', name: 'New York JFK' },
    { code: 'KLAX', name: 'Los Angeles' },
  ];

  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Search Live Flights</CardTitle>
          </div>
          <Badge variant="info" size="sm">
            <Info className="w-3 h-3 mr-1" />
            Live Data Only
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ICAO Input */}
          <div>
            <Input
              ref={icaoRef}
              label="Airport ICAO Code"
              placeholder="e.g., EDDF"
              value={icao}
              onChange={(e) => {
                setIcao(e.target.value.toUpperCase());
                setError('');
              }}
              error={error}
              maxLength={4}
              leftIcon={<MapPin className="w-4 h-4" />}
              helperText="Enter 4-letter airport code for departure or arrival"
              fullWidth
              className="uppercase text-lg font-mono"
            />
          </div>

          {/* Quick Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Select Popular Airports
            </label>
            <div className="flex flex-wrap gap-2">
              {popularAirports.map((airport) => (
                <Button
                  key={airport.code}
                  variant="outline"
                  size="sm"
                  onClick={() => setIcao(airport.code)}
                  type="button"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {airport.code} - {airport.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            leftIcon={<Search className="w-5 h-5" />}
            fullWidth
          >
            {isLoading ? 'Searching...' : 'Search Flights'}
          </Button>

          {/* Keyboard Shortcuts */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">
                Ctrl+Enter
              </kbd>
              <span>to search</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">
                /
              </kbd>
              <span>to focus</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
