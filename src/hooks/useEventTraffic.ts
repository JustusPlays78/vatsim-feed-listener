import { useCallback, useEffect, useRef, useState } from 'react';
import type { EventTraffic } from '../types';

const ENDPOINT = '/api/event/traffic';
const REFRESH_INTERVAL = 30_000; // 30s — VATSIM feed updates every 15s

interface UseEventTrafficResult {
  data: EventTraffic | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

/**
 * Fetches aggregated event traffic + ATC coverage and auto-refreshes.
 */
export function useEventTraffic(): UseEventTrafficResult {
  const [data, setData] = useState<EventTraffic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await fetch(ENDPOINT, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      const json: EventTraffic = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, isLoading, error, lastUpdated, refresh: fetchData };
}
