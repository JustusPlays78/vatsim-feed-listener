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
