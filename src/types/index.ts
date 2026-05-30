export interface Flight {
  callsign: string;
  cid: string;
  name: string;
  departure: string;
  arrival: string;
  aircraft: string;
  altitude: number;
  groundspeed: number;
  heading: number;
  latitude: number;
  longitude: number;
  logon_time: string;
  last_updated: string;
  route: string;
  remarks: string;
}

export interface FlightStats {
  total: number;
  arrived: number;
  inFlight: number;
  uniqueAirports: number;
}

export interface AirportCount {
  airport: string;
  count: number;
  percentage: number;
}

export interface SearchParams {
  icao: string;
  from: string;
  to: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface ExportMetadata {
  icao: string;
  exportDate: string;
  flightCount: number;
}

export interface FlightExport {
  metadata: ExportMetadata;
  flights: Flight[];
}

// --- Event Dashboard (Traffic + ATC coverage) ---

export interface AirportTraffic {
  icao: string;
  name: string;
  inboundAirborne: number;
  inboundFar: number;
  inboundPending: number;
  arrived: number;
  outboundAirborne: number;
  outboundGround: number;
}

export interface EtaBucket {
  label: string;
  count: number;
}

export interface AtcPosition {
  id: string;
  label: string;
  group: 'DEL/GND' | 'TWR' | 'APP' | 'CTR';
  online: boolean;
  callsign: string | null;
  frequency: string | null;
}

export interface ExtraController {
  callsign: string;
  frequency: string;
}

export interface EventTrafficSummary {
  inboundAirborne: number;
  inboundFar: number;
  inboundPending: number;
  arrived: number;
  outboundAirborne: number;
  outboundGround: number;
  prefiledInbound: number;
  positionsOnline: number;
  positionsTotal: number;
  extraControllers: number;
}

export interface TrafficSample {
  t: string;
  inboundAirborne: number;
  inboundPending: number;
  arrived: number;
  outbound: number;
}

export interface EventTraffic {
  eventName: string;
  updatedAt: string;
  summary: EventTrafficSummary;
  airports: AirportTraffic[];
  etaBuckets: EtaBucket[];
  atc: {
    positions: AtcPosition[];
    extraControllers: ExtraController[];
  };
  history: TrafficSample[];
}

// --- Separation / STU (fed by the EuroScope plugin) ---

export interface SeparationEvent {
  id: number;
  a: string;
  b: string;
  source: string;
  startedAt: string;
  endedAt?: string;
  lastSeen?: string;
  durationSec: number;
  minLateralNm: number;
  minVerticalFt: number;
  lastLateralNm: number;
  lastVerticalFt: number;
  samples: number;
}

export interface SeparationState {
  pluginConnected: boolean;
  lastIngestAt: string | null;
  activeSources: string[];
  stats: {
    activeCount: number;
    historyCount: number;
  };
  active: SeparationEvent[];
  history: SeparationEvent[];
}
