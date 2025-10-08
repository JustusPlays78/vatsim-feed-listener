// Application Version
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'VATSIM Flight Analyzer';
export const BUILD_DATE = new Date().toISOString().split('T')[0];

// API Endpoints
export const VATSIM_DATA_URL = 'https://data.vatsim.net';
export const STATSIM_URL = 'https://api.statsim.net';
export const GITHUB_REPO =
  'https://github.com/JustusPlays78/vatsim-feed-listener';

// Feature Flags
export const FEATURES = {
  CACHE_ENABLED: true,
  SEARCH_ENABLED: true,
  EXPORT_ENABLED: false, // Coming soon
  MAP_VIEW_ENABLED: false, // Coming soon
} as const;
