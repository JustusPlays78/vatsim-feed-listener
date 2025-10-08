import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Flight, CacheEntry } from '@/types';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheState {
  cache: Map<string, CacheEntry<Flight[]>>;
  get: (key: string) => Flight[] | null;
  set: (key: string, data: Flight[]) => void;
  clear: () => void;
}

export const useCacheStore = create<CacheState>((set, get) => ({
  cache: new Map(),
  
  get: (key: string) => {
    const cached = get().cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  },
  
  set: (key: string, data: Flight[]) => {
    set((state) => {
      const newCache = new Map(state.cache);
      newCache.set(key, { data, timestamp: Date.now() });
      
      // Limit cache size
      if (newCache.size > 50) {
        const firstKey = newCache.keys().next().value;
        if (firstKey) newCache.delete(firstKey);
      }
      
      return { cache: newCache };
    });
  },
  
  clear: () => set({ cache: new Map() }),
}));

interface FlightState {
  flights: Flight[] | null;
  currentIcao: string | null;
  isLoading: boolean;
  error: string | null;
  setFlights: (flights: Flight[], icao: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useFlightStore = create<FlightState>((set) => ({
  flights: null,
  currentIcao: null,
  isLoading: false,
  error: null,
  
  setFlights: (flights, icao) => set({ flights, currentIcao: icao, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () => set({ flights: null, currentIcao: null, error: null }),
}));

interface FavoritesState {
  favorites: string[];
  addFavorite: (icao: string) => void;
  removeFavorite: (icao: string) => void;
  isFavorite: (icao: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (icao) => {
        const normalized = icao.toUpperCase();
        if (!get().favorites.includes(normalized)) {
          set((state) => ({ favorites: [...state.favorites, normalized] }));
        }
      },
      
      removeFavorite: (icao) => {
        const normalized = icao.toUpperCase();
        set((state) => ({
          favorites: state.favorites.filter((f) => f !== normalized),
        }));
      },
      
      isFavorite: (icao) => {
        return get().favorites.includes(icao.toUpperCase());
      },
    }),
    {
      name: 'vatsim-favorites',
    }
  )
);

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
      
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'vatsim-theme',
    }
  )
);
