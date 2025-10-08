const express = require('express');
const cors = require('cors');
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

// Load cache on startup
loadCacheFromFile();

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET'],
    credentials: true,
  })
);

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

    console.log(`[${new Date().toISOString()}] Fetching flights for ${icao}`);

    // VATSIM only provides LIVE data via public API
    // We'll fetch current pilots and filter by departure/arrival airport
    const vatsimUrl = `${VATSIM_API_BASE}/vatsim-data.json`;

    console.log(`[${new Date().toISOString()}] Requesting: ${vatsimUrl}`);

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
      return res.status(response.status).json({
        error: 'VATSIM API error',
        message: `API returned ${response.status}: ${response.statusText}`,
      });
    }

    const vatsimData = await response.json();

    // Filter flights by departure or arrival ICAO
    const flights = vatsimData.pilots.filter(
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
      return res.status(response.status).json({
        error: 'STATSIM API error',
        message: `API returned ${response.status}: ${response.statusText}`,
      });
    }

    const statsimData = await response.json();

    console.log(
      `[${new Date().toISOString()}] Success: ${
        statsimData.length
      } flights found`
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
    console.log(`[${new Date().toISOString()}] Fetching VATSIM events`);

    // Fetch fresh events from VATSIM
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

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
        `[${new Date().toISOString()}] VATSIM Events API error: ${
          response.status
        } ${response.statusText}`
      );
      return res.status(response.status).json({
        error: 'VATSIM Events API error',
        message: `API returned ${response.status}: ${response.statusText}`,
      });
    }

    const data = await response.json();
    const liveEvents = data.data || [];
    const now = new Date();

    // Store events that just ended in cache
    liveEvents.forEach((event) => {
      const endTime = new Date(event.end_time);
      const cacheEntry = eventCache.get(event.id);

      // If event ended and not in cache yet, add it
      if (endTime < now && !cacheEntry) {
        eventCache.set(event.id, {
          event,
          timestamp: now.toISOString(),
        });
        console.log(
          `[${new Date().toISOString()}] Cached past event: ${event.name} (${
            event.id
          })`
        );
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
          `[${new Date().toISOString()}] Removed old cached event: ${key}`
        );
      }
    });

    // Save cache to file after cleanup if anything changed
    if (
      removedCount > 0 ||
      liveEvents.some(
        (e) => new Date(e.end_time) < now && !eventCache.get(e.id)
      )
    ) {
      saveCacheToFile();
    }

    // Merge live events with cached past events
    const pastEvents = Array.from(eventCache.values()).map((v) => v.event);
    const allEvents = [...liveEvents, ...pastEvents];

    // Remove duplicates (prefer live data)
    const uniqueEvents = Array.from(
      new Map(allEvents.map((e) => [e.id, e])).values()
    );

    console.log(
      `[${new Date().toISOString()}] Returning ${uniqueEvents.length} events (${
        liveEvents.length
      } live, ${pastEvents.length} cached)`
    );

    res.json({ data: uniqueEvents });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);

    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timeout',
        message: 'VATSIM Events API did not respond in time',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
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
