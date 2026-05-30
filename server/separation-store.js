// Separation (STU) store: receives conflict snapshots from the EuroScope plugin
// and runs a small state machine that opens an STU event when a pair first
// breaches the minima, keeps the minimum distance seen, and closes it (→ history)
// once the pair is no longer reported. History is persisted to disk.

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'separation-log.json');
const STALE_MS = 12_000; // close an STU if not seen for this long (> 2 ingest ticks)
const HISTORY_MAX = 500;
const HISTORY_RETENTION_MS = 24 * 60 * 60 * 1000; // 24h
const PLUGIN_ONLINE_MS = 30_000; // consider plugin "connected" if ingest within this
const SOURCE_ACTIVE_MS = 60_000;

let eventCounter = 0;
const active = new Map(); // pairKey -> open event
let history = []; // closed events (newest first)
let lastIngestAt = null;
const sources = new Map(); // source callsign -> last seen ts

function pairKey(a, b) {
  return [a, b].sort().join('::');
}

function loadFromFile() {
  try {
    if (!fs.existsSync(LOG_FILE)) return;
    const raw = fs.readFileSync(LOG_FILE, 'utf-8');
    if (!raw || !raw.trim()) return;
    const parsed = JSON.parse(raw);
    history = Array.isArray(parsed.history) ? parsed.history : [];
    eventCounter = history.reduce((m, e) => Math.max(m, e.id || 0), 0);
    console.log(
      `[${new Date().toISOString()}] Loaded ${history.length} STU history entries`
    );
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error loading STU log:`,
      err.message
    );
  }
}

function saveToFile() {
  try {
    fs.writeFileSync(
      LOG_FILE,
      JSON.stringify({ history }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error saving STU log:`,
      err.message
    );
  }
}

// Ingest one snapshot from the plugin. `payload.conflicts` is the list of pairs
// currently below the minima (the plugin already did the STCA/VERA-style calc).
function ingest(payload) {
  const now = Date.now();
  lastIngestAt = now;
  const source = payload.source || 'unknown';
  sources.set(source, now);

  const conflicts = Array.isArray(payload.conflicts) ? payload.conflicts : [];
  for (const c of conflicts) {
    if (!c.a || !c.b) continue;
    const key = pairKey(String(c.a), String(c.b));
    const lateral = Number(c.lateralNm);
    const vertical = Math.abs(Number(c.verticalFt));
    if (!Number.isFinite(lateral) || !Number.isFinite(vertical)) continue;

    let ev = active.get(key);
    if (!ev) {
      ev = {
        id: ++eventCounter,
        a: String(c.a),
        b: String(c.b),
        source,
        startedAt: now,
        lastSeen: now,
        minLateralNm: lateral,
        minVerticalFt: vertical,
        lastLateralNm: lateral,
        lastVerticalFt: vertical,
        samples: 1,
      };
      active.set(key, ev);
    } else {
      ev.lastSeen = now;
      ev.samples++;
      ev.lastLateralNm = lateral;
      ev.lastVerticalFt = vertical;
      ev.source = source;
      if (lateral < ev.minLateralNm) ev.minLateralNm = lateral;
      if (vertical < ev.minVerticalFt) ev.minVerticalFt = vertical;
    }
  }
  return { accepted: conflicts.length, active: active.size };
}

// Close any open event whose pair hasn't been reported recently. Runs on a timer
// so events still close even if the plugin disconnects.
function sweep() {
  const now = Date.now();
  let closed = 0;
  for (const [key, ev] of active) {
    if (now - ev.lastSeen > STALE_MS) {
      active.delete(key);
      history.unshift({
        ...ev,
        endedAt: ev.lastSeen,
        durationSec: Math.round((ev.lastSeen - ev.startedAt) / 1000),
      });
      closed++;
    }
  }
  if (closed > 0) {
    const cutoff = now - HISTORY_RETENTION_MS;
    history = history.filter((e) => e.endedAt >= cutoff).slice(0, HISTORY_MAX);
    saveToFile();
  }
  return closed;
}

const toIso = (ms) => (ms ? new Date(ms).toISOString() : null);

function getState() {
  const now = Date.now();
  const activeList = Array.from(active.values())
    .map((ev) => ({
      ...ev,
      startedAt: toIso(ev.startedAt),
      lastSeen: toIso(ev.lastSeen),
      durationSec: Math.round((now - ev.startedAt) / 1000),
    }))
    .sort((a, b) => a.minLateralNm - b.minLateralNm);

  const activeSources = Array.from(sources.entries())
    .filter(([, ts]) => now - ts < SOURCE_ACTIVE_MS)
    .map(([s]) => s);

  return {
    pluginConnected: lastIngestAt != null && now - lastIngestAt < PLUGIN_ONLINE_MS,
    lastIngestAt: toIso(lastIngestAt),
    activeSources,
    stats: {
      activeCount: activeList.length,
      historyCount: history.length,
    },
    active: activeList,
    history: history.slice(0, 50).map((e) => ({
      ...e,
      startedAt: toIso(e.startedAt),
      endedAt: toIso(e.endedAt),
    })),
  };
}

module.exports = { loadFromFile, ingest, sweep, getState };
