// Event configuration: northern Langen (EDGG) area, Düsseldorf-centric.
// Single source of truth for the /api/event/traffic aggregation.
// Coordinates are aerodrome reference points (lat/lon in decimal degrees).

const EVENT_NAME = 'Northern Langen / Düsseldorf Overload';

// Airports tracked for the event. `radiusNm` is the distance below which an
// on-ground aircraft is considered "at this airport" (arrived / departing).
const AIRPORTS = [
  { icao: 'EDDL', name: 'Düsseldorf', lat: 51.2895, lon: 6.7668, radiusNm: 6 },
  { icao: 'EDDK', name: 'Köln/Bonn', lat: 50.8659, lon: 7.1427, radiusNm: 6 },
  { icao: 'EDDF', name: 'Frankfurt', lat: 50.0379, lon: 8.5622, radiusNm: 6 },
  { icao: 'EDLW', name: 'Dortmund', lat: 51.5183, lon: 7.6122, radiusNm: 5 },
  { icao: 'EDDG', name: 'Münster/Osnabrück', lat: 52.1346, lon: 7.6848, radiusNm: 5 },
  { icao: 'EDLP', name: 'Paderborn/Lippstadt', lat: 51.6141, lon: 8.6163, radiusNm: 5 },
  { icao: 'EDLN', name: 'Mönchengladbach', lat: 51.2304, lon: 6.5045, radiusNm: 4 },
  { icao: 'EDLV', name: 'Weeze (Niederrhein)', lat: 51.6024, lon: 6.1422, radiusNm: 4 },
  { icao: 'EDFH', name: 'Frankfurt-Hahn', lat: 49.9487, lon: 7.2639, radiusNm: 5 },
];

// Expected ATC positions for "Lotsenabdeckung". A position counts as covered
// when an online controller's callsign matches `pattern`. Refine freely.
// group: 'DEL/GND' | 'TWR' | 'APP' | 'CTR'
const ATC_POSITIONS = [
  // Düsseldorf
  { id: 'EDDL_APP', label: 'Düsseldorf Approach', group: 'APP', pattern: /^EDDL_(\w+_)?APP$/ },
  { id: 'EDDL_TWR', label: 'Düsseldorf Tower', group: 'TWR', pattern: /^EDDL_(\w+_)?TWR$/ },
  // Köln/Bonn
  { id: 'EDDK_APP', label: 'Köln/Bonn Approach', group: 'APP', pattern: /^EDDK_(\w+_)?APP$/ },
  { id: 'EDDK_TWR', label: 'Köln/Bonn Tower', group: 'TWR', pattern: /^EDDK_(\w+_)?TWR$/ },
  // Frankfurt
  { id: 'EDDF_APP', label: 'Frankfurt Approach', group: 'APP', pattern: /^EDDF_(\w+_)?APP$/ },
  { id: 'EDDF_TWR', label: 'Frankfurt Tower', group: 'TWR', pattern: /^EDDF_(\w+_)?TWR$/ },
  // Satellite towers
  { id: 'EDLW_TWR', label: 'Dortmund Tower', group: 'TWR', pattern: /^EDLW_(\w+_)?TWR$/ },
  { id: 'EDDG_TWR', label: 'Münster Tower', group: 'TWR', pattern: /^EDDG_(\w+_)?TWR$/ },
  { id: 'EDLP_TWR', label: 'Paderborn Tower', group: 'TWR', pattern: /^EDLP_(\w+_)?TWR$/ },
  { id: 'EDLN_TWR', label: 'Mönchengladbach Tower', group: 'TWR', pattern: /^EDLN_(\w+_)?TWR$/ },
  { id: 'EDLV_TWR', label: 'Weeze Tower', group: 'TWR', pattern: /^EDLV_(\w+_)?TWR$/ },
  // Langen Radar (northern sectors) — any EDGG center counts as covered here
  { id: 'EDGG_CTR', label: 'Langen Radar (Center)', group: 'CTR', pattern: /^EDGG_\w*CTR$/ },
];

// Callsign prefixes that count as "in the event area" (for extra controllers
// that are online but not in the expected list above, e.g. extra CTR sectors).
const AREA_PREFIXES = [
  'EDDL', 'EDDK', 'EDDF', 'EDLW', 'EDDG', 'EDLP', 'EDLN', 'EDLV', 'EDFH', 'EDGG',
];

// Only count an airborne inbound as "relevant demand" if it will arrive within
// this many minutes. Aircraft filed to an event airport but still hours away
// (e.g. enroute from across the world) are tracked separately as "far".
const INBOUND_MAX_ETA_MIN = 120;

// ETA buckets (minutes) for the inbound demand curve. Top bucket = the cap.
const ETA_BUCKETS = [
  { label: '0–10', max: 10 },
  { label: '10–20', max: 20 },
  { label: '20–30', max: 30 },
  { label: '30–45', max: 45 },
  { label: '45–60', max: 60 },
  { label: '60–90', max: 90 },
  { label: '90–120', max: 120 },
];

module.exports = {
  EVENT_NAME,
  AIRPORTS,
  ATC_POSITIONS,
  AREA_PREFIXES,
  ETA_BUCKETS,
  INBOUND_MAX_ETA_MIN,
};
