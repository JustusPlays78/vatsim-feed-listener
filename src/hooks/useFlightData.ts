import { useFlightStore, useCacheStore } from '../store';
import { FlightService } from '../services/flightService';

export function useFlightData() {
  const {
    flights,
    currentIcao,
    isLoading,
    error,
    setFlights,
    setLoading,
    setError,
  } = useFlightStore();
  const cacheStore = useCacheStore();

  const fetchFlights = async (params: { icao: string }) => {
    const cacheKey = `${params.icao}-live`;

    // Check cache first (5min TTL for live data)
    const cached = cacheStore.get(cacheKey);
    if (cached) {
      console.log('📦 Cache hit for:', cacheKey);
      setFlights(cached, params.icao);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await FlightService.fetchFlights(params.icao);

      // Store in cache
      cacheStore.set(cacheKey, data);

      setFlights(data, params.icao);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    flights,
    currentIcao,
    isLoading,
    error,
    fetchFlights,
  };
}
