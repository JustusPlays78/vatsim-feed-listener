import { useCallback, useEffect, useRef, useState } from 'react';
import type { SeparationState } from '../types';

const ENDPOINT = '/api/separation';
const REFRESH_INTERVAL = 5_000; // 5s — STUs are time-critical

interface UseSeparationResult {
  data: SeparationState | null;
  error: string | null;
  refresh: () => void;
}

/**
 * Polls the separation (STU) state fed by the EuroScope plugin.
 */
export function useSeparation(): UseSeparationResult {
  const [data, setData] = useState<SeparationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await fetch(ENDPOINT, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, error, refresh: fetchData };
}
