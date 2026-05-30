const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Event cache for storing past events (since VATSIM API doesn't return them)
const eventCache = new Map(); // key: event_id, value: { event, timestamp }
const CACHE_RETENTION_HOURS = 72; // Keep past events for 72 hours (3 days)
const CACHE_FILE_PATH = path.join(__dirname, 'event-cache.json');
const VATSIM_EVENTS_URL = 'https://my.vatsim.net/api/v2/events/latest';

// Response cache to avoid fetching events on every request
let lastFetchTime = 0;
let lastFetchedEvents = [];
const RESPONSE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// VATSIM live data cache (pilots update every 15 seconds on VATSIM)
let vatsimDataCache = null;
let vatsimCacheTime = 0;
const VATSIM_CACHE_DURATION = 30 * 1000; // 30 seconds

// STATSIM cache (historical data doesn't change)
const statsimCache = new Map(); // key: "from|to", value: { data, timestamp }
const STATSIM_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const STATSIM_CACHE_MAX_SIZE = 50; // Keep last 50 queries

// Load cache from file on startup
function loadCacheFromFile() {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const fileContent = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');

      // Skip empty or whitespace-only files
      if (!fileContent || fileContent.trim().length === 0) {
        console.log(
          `[${new Date().toISOString()}] Cache file is empty, starting with fresh cache`
        );
        return;
      }

      const cacheData = JSON.parse(fileContent);

      Object.entries(cacheData).forEach(([key, value]) => {
        eventCache.set(parseInt(key), value);
      });

      console.log(
        `[${new Date().toISOString()}] Loaded ${
          eventCache.size
        } cached events from file`
      );
    }
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error loading cache from file:`,
      error.message
    );
    console.log(`[${new Date().toISOString()}] Starting with fresh cache`);
  }
}

// Save cache to file
function saveCacheToFile() {
  try {
    const cacheObject = Object.fromEntries(eventCache);
    fs.writeFileSync(
      CACHE_FILE_PATH,
      JSON.stringify(cacheObject, null, 2),
      'utf-8'
    );
    console.log(
      `[${new Date().toISOString()}] Saved ${
        eventCache.size
      } events to cache file`
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error saving cache to file:`,
      error
    );
  }
}

// Fetch and cache events (used by API endpoint and background job)
async function fetchAndCacheEvents() {
  try {
    console.log(
      `[${new Date().toISOString()}] [CRON] Fetching VATSIM events for caching`
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(VATSIM_EVENTS_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'VATSIM-Flight-Analyzer/1.0',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        `[${new Date().toISOString()}] [CRON] VATSIM Events API error: ${response.status}`
      );
      return null;
    }

    const data = await response.json();
    const liveEvents = data.data || [];
    const now = new Date();

    // Cache ALL events (both live and upcoming) so we have them when they end
    liveEvents.forEach((event) => {
      const endTime = new Date(event.end_time);
      const startTime = new Date(event.start_time);
      const cacheEntry = eventCache.get(event.id);

      // Cache events that:
      // 1. Have started (live or past)
      // 2. Will start within next 12 hours (upcoming events we want to track)
      const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      if (
        (startTime <= now || startTime <= twelveHoursFromNow) &&
        !cacheEntry
      ) {
        eventCache.set(event.id, {
          event,
          timestamp: now.toISOString(),
        });
        console.log(
          `[${new Date().toISOString()}] [CRON] Cached event: ${event.name} (${event.id}) - ${
            startTime <= now ? 'LIVE/PAST' : 'UPCOMING'
          }`
        );
      }
      // Update cached events if they're still live (to get latest data)
      else if (cacheEntry && endTime >= now) {
        eventCache.set(event.id, {
          event,
          timestamp: cacheEntry.timestamp, // Keep original timestamp
        });
      }
    });

    // Clean old cache entries (older than 72 hours)
    const retentionTime = CACHE_RETENTION_HOURS * 60 * 60 * 1000;
    let removedCount = 0;
    eventCache.forEach((value, key) => {
      const cacheAge = now - new Date(value.timestamp);
      if (cacheAge > retentionTime) {
        eventCache.delete(key);
        removedCount++;
        console.log(
          `[${new Date().toISOString()}] [CRON] Removed old cached event: ${key}`
        );
      }
    });

    // Save cache to file
    saveCacheToFile();

    console.log(
      `[${new Date().toISOString()}] [CRON] Cache updated: ${eventCache.size} events total`
    );

    return liveEvents;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] [CRON] Error fetching events:`,
      error.message
    );
    return null;
  }
}

// Load cache on startup
loadCacheFromFile();

// Start background job to fetch and cache events every 10 minutes
const CACHE_UPDATE_INTERVAL = 10 * 60 * 1000; // 10 minutes
setInterval(fetchAndCacheEvents, CACHE_UPDATE_INTERVAL);

// Initial fetch on startup (after 10 seconds to let server start)
setTimeout(() => {
  console.log(
    `[${new Date().toISOString()}] Starting initial background event fetch...`
  );
  fetchAndCacheEvents();
}, 10000);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET'],
    credentials: true,
  })
);

// Enable gzip compression for all responses
app.use(compression());

app.use(express.json());

// VATSIM API Configuration
// Using VATSIM Data Feed (live data) - no historical data available in free API
const VATSIM_API_BASE = 'https://data.vatsim.net/v3';
const REQUEST_TIMEOUT = 10000;

// Note: VATSIM's public API only provides LIVE data
// Historical flight data requires STATSIM subscription or other paid services

// Validation
const ICAO_REGEX = /^[A-Z]{4}$/;

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'vatsim-flight-analyzer-backend',
    version: '2.0.0',
    api: {
      vatsim: 'v3',
      endpoint: VATSIM_API_BASE,
    },
  });
});

// Flights endpoint
app.get('/api/flights', async (req, res) => {
  try {
    const { icao } = req.query;

    // Validation
    if (!icao || !ICAO_REGEX.test(icao)) {
      return res.status(400).json({
        error: 'Invalid ICAO code',
        message: 'ICAO must be a 4-letter airport code (e.g., EDDF)',
      });
    }

    const now = Date.now();
    const cacheAge = now - vatsimCacheTime;

    // Check if we have recent cached VATSIM data
    if (cacheAge < VATSIM_CACHE_DURATION && vatsimDataCache) {
      console.log(
        `[${new Date().toISOString()}] Using cached VATSIM data for ${icao} (${Math.round(
          cacheAge / 1000
        )}s old)`
      );
    } else {
      console.log(
        `[${new Date().toISOString()}] Fetching fresh VATSIM data for ${icao}`
      );

      // VATSIM only provides LIVE data via public API
      const vatsimUrl = `${VATSIM_API_BASE}/vatsim-data.json`;

      // Fetch from VATSIM API
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(vatsimUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'VATSIM-Flight-Analyzer/2.0',
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error(
          `[${new Date().toISOString()}] VATSIM API error: ${response.status} ${
            response.statusText
          }`
        );

        // If we have stale cache, use it as fallback
        if (vatsimDataCache) {
          console.log(
            `[${new Date().toISOString()}] Using stale cache as fallback`
          );
        } else {
          return res.status(response.status).json({
            error: 'VATSIM API error',
            message: `API returned ${response.status}: ${response.statusText}`,
          });
        }
      } else {
        // Update cache
        vatsimDataCache = await response.json();
        vatsimCacheTime = now;
      }
    }

    // Filter flights by departure or arrival ICAO
    const flights = vatsimDataCache.pilots.filter(
      (pilot) =>
        pilot.flight_plan &&
        (pilot.flight_plan.departure === icao ||
          pilot.flight_plan.arrival === icao)
    );

    console.log(
      `[${new Date().toISOString()}] Success: ${
        flights.length
      } flights found for ${icao}`
    );

    // Transform to match expected format
    const transformedFlights = flights.map((pilot) => ({
      callsign: pilot.callsign,
      cid: pilot.cid,
      name: pilot.name,
      departure: pilot.flight_plan?.departure || 'N/A',
      arrival: pilot.flight_plan?.arrival || 'N/A',
      aircraft:
        pilot.flight_plan?.aircraft_short ||
        pilot.flight_plan?.aircraft ||
        'N/A',
      altitude: pilot.altitude,
      groundspeed: pilot.groundspeed,
      heading: pilot.heading,
      latitude: pilot.latitude,
      longitude: pilot.longitude,
      logon_time: pilot.logon_time,
      last_updated: pilot.last_updated,
      route: pilot.flight_plan?.route || '',
      remarks: pilot.flight_plan?.remarks || '',
    }));

    res.json(transformedFlights);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);

    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timeout',
        message: 'VATSIM API did not respond in time',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// STATSIM API Proxy - Historical flight data
app.get('/api/statsim/flights/dates', async (req, res) => {
  try {
    const { from, to } = req.query;

    // Validation
    if (!from || !to) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'from and to parameters are required (ISO 8601 format)',
      });
    }

    // Check cache first
    const cacheKey = `${from}|${to}`;
    const cached = statsimCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < STATSIM_CACHE_DURATION) {
      const cacheAge = Math.round((now - cached.timestamp) / 1000);
      console.log(
        `[${new Date().toISOString()}] Using cached STATSIM data (${cacheAge}s old) for ${from} to ${to}`
      );
      return res.json(cached.data);
    }

    console.log(
      `[${new Date().toISOString()}] Fetching STATSIM flights from ${from} to ${to}`
    );

    const statsimUrl = `https://api.statsim.net/api/Flights/Dates?from=${encodeURIComponent(
      from
    )}&to=${encodeURIComponent(to)}`;

    console.log(`[${new Date().toISOString()}] Requesting: ${statsimUrl}`);

    // Fetch from STATSIM API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(statsimUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'VATSIM-Flight-Analyzer/1.0',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        `[${new Date().toISOString()}] STATSIM API error: ${response.status} ${
          response.statusText
        }`
      );

      // Return stale cache if available
      if (cached) {
        console.log(
          `[${new Date().toISOString()}] Using stale cache as fallback`
        );
        return res.json(cached.data);
      }

      return res.status(response.status).json({
        error: 'STATSIM API error',
        message: `API returned ${response.status}: ${response.statusText}`,
      });
    }

    const statsimData = await response.json();

    // Cache the result
    statsimCache.set(cacheKey, {
      data: statsimData,
      timestamp: now,
    });

    // Limit cache size (remove oldest entries)
    if (statsimCache.size > STATSIM_CACHE_MAX_SIZE) {
      const firstKey = statsimCache.keys().next().value;
      statsimCache.delete(firstKey);
    }

    console.log(
      `[${new Date().toISOString()}] Success: ${
        statsimData.length
      } flights found (cached for 10min)`
    );

    res.json(statsimData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);

    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timeout',
        message: 'STATSIM API did not respond in time',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Events endpoint with caching
app.get('/api/events', async (req, res) => {
  try {
    const now = Date.now();
    const cacheAge = now - lastFetchTime;

    // If we have recent data (less than 5 minutes old), return it immediately
    if (cacheAge < RESPONSE_CACHE_DURATION && lastFetchedEvents.length > 0) {
      console.log(
        `[${new Date().toISOString()}] Serving cached response (${Math.round(
          cacheAge / 1000
        )}s old)`
      );
      return res.json({ data: lastFetchedEvents });
    }

    console.log(
      `[${new Date().toISOString()}] Cache expired or empty, fetching fresh data`
    );

    // Fetch fresh events and update cache
    const liveEvents = await fetchAndCacheEvents();

    // If fetch failed, use last known good data
    if (!liveEvents) {
      console.log(
        `[${new Date().toISOString()}] Fetch failed, using last known data`
      );
      if (lastFetchedEvents.length > 0) {
        return res.json({ data: lastFetchedEvents });
      }
      // No cached data at all, return empty
      const cachedEvents = Array.from(eventCache.values()).map((v) => v.event);
      return res.json({ data: cachedEvents });
    }

    // Merge live events with cached past events
    const cachedEvents = Array.from(eventCache.values()).map((v) => v.event);
    const liveEventIds = new Set(liveEvents.map((e) => e.id));
    const pastOnlyEvents = cachedEvents.filter((e) => !liveEventIds.has(e.id));
    const allEvents = [...liveEvents, ...pastOnlyEvents];

    // Update response cache
    lastFetchedEvents = allEvents;
    lastFetchTime = now;

    console.log(
      `[${new Date().toISOString()}] Returning ${allEvents.length} events (${
        liveEvents.length
      } live, ${pastOnlyEvents.length} past cached)`
    );

    res.json({ data: allEvents });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);

    // Return last known good data or cached events as fallback
    if (lastFetchedEvents.length > 0) {
      return res.json({ data: lastFetchedEvents });
    }
    const cachedEvents = Array.from(eventCache.values()).map((v) => v.event);
    res.json({ data: cachedEvents });
  }
});

// 404 handler (MUST be after all routes!)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  VATSIM Flight Analyzer Backend                      ║
║  Version: 2.0.0                                       ║
║  Port: ${PORT}                                         ║
║  Health: http://localhost:${PORT}/health               ║
║  API: http://localhost:${PORT}/api/flights             ║
╚═══════════════════════════════════════════════════════╝
  `);
});
