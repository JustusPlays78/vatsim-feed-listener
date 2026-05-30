// Event traffic aggregation: turns a raw VATSIM data feed into per-airport
// inbound/outbound counts, an ETA demand histogram and ATC coverage.
// Also keeps a rolling demand history (sampled on a timer by server.js) so the
// dashboard can show how demand develops over time.

const eventConfig = require('./event-config');

const GROUND_SPEED_THRESHOLD = 50; // kt; below this we treat an aircraft as on-ground

// Great-circle distance between two lat/lon points in nautical miles.
function distanceNm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 3440.065; // Earth radius in NM
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function computeEventTraffic(data) {
  const pilots = data.pilots || [];
  const prefiles = data.prefiles || [];
  const controllers = data.controllers || [];

  const {
    AIRPORTS,
    ATC_POSITIONS,
    AREA_PREFIXES,
    ETA_BUCKETS,
    EVENT_NAME,
    INBOUND_MAX_ETA_MIN,
  } = eventConfig;
  const airportByIcao = new Map(AIRPORTS.map((a) => [a.icao, a]));

  const perAirport = new Map(
    AIRPORTS.map((a) => [
      a.icao,
      {
        icao: a.icao,
        name: a.name,
        inboundAirborne: 0,
        inboundFar: 0,
        inboundPending: 0,
        arrived: 0,
        outboundAirborne: 0,
        outboundGround: 0,
      },
    ])
  );

  const buckets = ETA_BUCKETS.map((b) => ({ label: b.label, count: 0 }));
  const addToBucket = (etaMin) => {
    const idx = ETA_BUCKETS.findIndex((b) => etaMin <= b.max);
    buckets[idx === -1 ? buckets.length - 1 : idx].count++;
  };

  for (const p of pilots) {
    const fp = p.flight_plan;
    if (!fp) continue;
    const gs = p.groundspeed || 0;
    const onGround = gs < GROUND_SPEED_THRESHOLD;

    const arr = airportByIcao.get(fp.arrival);
    if (arr) {
      const acc = perAirport.get(arr.icao);
      const dist = distanceNm(p.latitude, p.longitude, arr.lat, arr.lon);
      if (onGround && dist <= arr.radiusNm) {
        acc.arrived++;
      } else if (onGround) {
        acc.inboundPending++;
      } else {
        const etaMin = gs > 0 ? (dist / gs) * 60 : Infinity;
        if (etaMin <= INBOUND_MAX_ETA_MIN) {
          acc.inboundAirborne++;
          addToBucket(etaMin);
        } else {
          acc.inboundFar++;
        }
      }
    }

    const dep = airportByIcao.get(fp.departure);
    if (dep && fp.departure !== fp.arrival) {
      const acc = perAirport.get(dep.icao);
      const dist = distanceNm(p.latitude, p.longitude, dep.lat, dep.lon);
      if (onGround && dist <= dep.radiusNm) {
        acc.outboundGround++;
      } else if (!onGround) {
        acc.outboundAirborne++;
      }
    }
  }

  let prefiledInbound = 0;
  for (const pf of prefiles) {
    const arr = pf.flight_plan && airportByIcao.get(pf.flight_plan.arrival);
    if (arr) {
      perAirport.get(arr.icao).inboundPending++;
      prefiledInbound++;
    }
  }

  const activeControllers = controllers.filter(
    (c) => c.facility > 0 && c.frequency !== '199.998'
  );
  const matchedCallsigns = new Set();
  const positions = ATC_POSITIONS.map((pos) => {
    const hit = activeControllers.find((c) => pos.pattern.test(c.callsign));
    if (hit) matchedCallsigns.add(hit.callsign);
    return {
      id: pos.id,
      label: pos.label,
      group: pos.group,
      online: Boolean(hit),
      callsign: hit ? hit.callsign : null,
      frequency: hit ? hit.frequency : null,
    };
  });

  const extraControllers = activeControllers
    .filter(
      (c) =>
        !matchedCallsigns.has(c.callsign) &&
        AREA_PREFIXES.some((pfx) => c.callsign.startsWith(pfx))
    )
    .map((c) => ({ callsign: c.callsign, frequency: c.frequency }));

  const airports = Array.from(perAirport.values());
  const summary = {
    inboundAirborne: airports.reduce((s, a) => s + a.inboundAirborne, 0),
    inboundFar: airports.reduce((s, a) => s + a.inboundFar, 0),
    inboundPending: airports.reduce((s, a) => s + a.inboundPending, 0),
    arrived: airports.reduce((s, a) => s + a.arrived, 0),
    outboundAirborne: airports.reduce((s, a) => s + a.outboundAirborne, 0),
    outboundGround: airports.reduce((s, a) => s + a.outboundGround, 0),
    prefiledInbound,
    positionsOnline: positions.filter((p) => p.online).length,
    positionsTotal: positions.length,
    extraControllers: extraControllers.length,
  };

  return {
    eventName: EVENT_NAME,
    updatedAt: new Date().toISOString(),
    summary,
    airports,
    etaBuckets: buckets,
    atc: { positions, extraControllers },
  };
}

// --- rolling demand history -------------------------------------------------
const HISTORY_MAX = 180; // e.g. 6h at one sample / 2 min
const demandHistory = [];

function recordSample(summary) {
  demandHistory.push({
    t: new Date().toISOString(),
    inboundAirborne: summary.inboundAirborne,
    inboundPending: summary.inboundPending,
    arrived: summary.arrived,
    outbound: summary.outboundAirborne + summary.outboundGround,
  });
  if (demandHistory.length > HISTORY_MAX) demandHistory.shift();
}

function getHistory() {
  return demandHistory;
}

module.exports = { computeEventTraffic, recordSample, getHistory };
