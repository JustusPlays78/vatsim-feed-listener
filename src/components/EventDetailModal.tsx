import { useState, useEffect, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { Table, Column } from './ui/Table';
import { Card } from './ui/Card';
import {
  Calendar,
  MapPin,
  ExternalLink,
  Plane,
  Users,
  Globe,
  TrendingUp,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import { Flight } from '../types';

interface StatsimFlight {
  id: number;
  vatsimid: string;
  callsign: string;
  departure: string;
  destination: string;
  aircraft: string;
  altitude: string;
  route: string;
  departed: string;
  arrived: string | null;
  loggedOn: string;
}

interface VatsimEvent {
  id: number;
  type: string;
  name: string;
  link: string;
  organisers: Array<{
    region: string;
    division: string;
    subdivision: string | null;
    organised_by_vatsim: boolean;
  }>;
  airports: Array<{ icao: string }>;
  routes: Array<{ departure: string; arrival: string; route: string }>;
  start_time: string;
  end_time: string;
  short_description: string;
  description: string;
  banner: string;
}

interface EventDetailModalProps {
  event: VatsimEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
}: EventDetailModalProps) {
  const [trafficData, setTrafficData] = useState<Flight[]>([]);
  const [historicalData, setHistoricalData] = useState<StatsimFlight[]>([]);
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(false);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [trafficError, setTrafficError] = useState<string | null>(null);
  const [historicalError, setHistoricalError] = useState<string | null>(null);

  useEffect(() => {
    if (event && isOpen) {
      const now = new Date();
      const eventEnd = new Date(event.end_time);
      const isPastEvent = now > eventEnd;

      if (isPastEvent) {
        // Fetch historical data for past events
        fetchHistoricalTraffic();
      } else {
        // Fetch live data for upcoming/live events
        fetchEventTraffic();
      }
    }
  }, [event, isOpen]);

  const fetchEventTraffic = async () => {
    if (!event || event.airports.length === 0) {
      return;
    }

    setIsLoadingTraffic(true);
    setTrafficError(null);

    try {
      // Fetch current live data from VATSIM
      const response = await fetch(
        'https://data.vatsim.net/v3/vatsim-data.json'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch traffic data');
      }

      const data = await response.json();
      const pilots = data.pilots || [];

      // Filter flights related to event airports
      const eventICAOs = event.airports.map((a) => a.icao.toUpperCase());
      const relevantFlights = pilots.filter((pilot: any) => {
        const dep = pilot.flight_plan?.departure?.toUpperCase() || '';
        const arr = pilot.flight_plan?.arrival?.toUpperCase() || '';
        return eventICAOs.includes(dep) || eventICAOs.includes(arr);
      });

      // Transform to Flight interface
      const flights: Flight[] = relevantFlights.map((pilot: any) => ({
        callsign: pilot.callsign,
        name: pilot.name,
        cid: pilot.cid,
        departure: pilot.flight_plan?.departure || '',
        arrival: pilot.flight_plan?.arrival || '',
        aircraft:
          pilot.flight_plan?.aircraft_short ||
          pilot.flight_plan?.aircraft ||
          '',
        altitude: pilot.altitude,
        groundspeed: pilot.groundspeed,
        heading: pilot.heading,
        latitude: pilot.latitude,
        longitude: pilot.longitude,
        logon_time: pilot.logon_time,
        last_updated: pilot.last_updated,
      }));

      setTrafficData(flights);
    } catch (err) {
      setTrafficError(
        err instanceof Error ? err.message : 'Failed to load traffic'
      );
    } finally {
      setIsLoadingTraffic(false);
    }
  };

  const fetchHistoricalTraffic = async () => {
    if (!event || event.airports.length === 0) {
      return;
    }

    setIsLoadingHistorical(true);
    setHistoricalError(null);

    try {
      const startTime = new Date(event.start_time);
      const endTime = new Date(event.end_time);

      // Query STATSIM API via our backend proxy
      const response = await fetch(
        `/api/statsim/flights/dates?from=${startTime.toISOString()}&to=${endTime.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch historical traffic data');
      }

      const data = await response.json();

      // Filter for event airports
      const eventICAOs = event.airports.map((a) => a.icao.toUpperCase());
      const relevantFlights = data.filter((flight: StatsimFlight) => {
        const dep = flight.departure?.toUpperCase() || '';
        const dest = flight.destination?.toUpperCase() || '';
        return eventICAOs.includes(dep) || eventICAOs.includes(dest);
      });

      setHistoricalData(relevantFlights);
    } catch (err) {
      setHistoricalError(
        err instanceof Error ? err.message : 'Failed to load historical traffic'
      );
    } finally {
      setIsLoadingHistorical(false);
    }
  };

  // Calculate traffic statistics
  const trafficStats = useMemo(() => {
    const now = new Date();
    const eventEnd = new Date(event?.end_time || now);
    const isPastEvent = now > eventEnd;

    if (isPastEvent && historicalData.length > 0) {
      // Historical stats
      const eventICAOs = event?.airports.map((a) => a.icao.toUpperCase()) || [];
      const departures = historicalData.filter((f) =>
        eventICAOs.includes(f.departure?.toUpperCase())
      );
      const arrivals = historicalData.filter((f) =>
        eventICAOs.includes(f.destination?.toUpperCase())
      );

      const eventStart = new Date(event?.start_time || now);
      const durationHours =
        (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);

      return {
        total: historicalData.length,
        departures: departures.length,
        arrivals: arrivals.length,
        perHour:
          durationHours > 0
            ? (historicalData.length / durationHours).toFixed(1)
            : '0',
        isPast: true,
      };
    } else if (trafficData.length > 0) {
      // Live stats
      const eventICAOs = event?.airports.map((a) => a.icao.toUpperCase()) || [];
      const departures = trafficData.filter((f) =>
        eventICAOs.includes(f.departure?.toUpperCase())
      );
      const arrivals = trafficData.filter((f) =>
        eventICAOs.includes(f.arrival?.toUpperCase())
      );

      return {
        total: trafficData.length,
        departures: departures.length,
        arrivals: arrivals.length,
        perHour: 'N/A',
        isPast: false,
      };
    }

    return {
      total: 0,
      departures: 0,
      arrivals: 0,
      perHour: '0',
      isPast: false,
    };
  }, [trafficData, historicalData, event]);

  if (!event) return null;

  const flightColumns: Column<Flight>[] = [
    {
      key: 'callsign',
      header: 'Callsign',
      accessor: (flight) => (
        <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
          {flight.callsign}
        </span>
      ),
      sortable: true,
      width: '15%',
    },
    {
      key: 'route',
      header: 'Route',
      accessor: (flight) => (
        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">
            {flight.departure}
          </Badge>
          <span className="text-gray-400">→</span>
          <Badge variant="info" size="sm">
            {flight.arrival}
          </Badge>
        </div>
      ),
      sortable: false,
      width: '20%',
    },
    {
      key: 'aircraft',
      header: 'Aircraft',
      accessor: (flight) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {flight.aircraft || 'N/A'}
        </span>
      ),
      sortable: true,
      width: '15%',
    },
    {
      key: 'altitude',
      header: 'Altitude',
      accessor: (flight) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {flight.altitude.toLocaleString()} ft
        </span>
      ),
      sortable: true,
      align: 'right',
      width: '15%',
    },
    {
      key: 'groundspeed',
      header: 'Speed',
      accessor: (flight) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {flight.groundspeed} kts
        </span>
      ),
      sortable: true,
      align: 'right',
      width: '15%',
    },
    {
      key: 'pilot',
      header: 'Pilot',
      accessor: (flight) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {flight.name}
        </span>
      ),
      sortable: true,
      width: '20%',
    },
  ];

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
    };
  };

  const startDateTime = formatDateTime(event.start_time);
  const endDateTime = formatDateTime(event.end_time);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.name} size="xl">
      <div className="space-y-6">
        {/* Banner */}
        {event.banner && (
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={event.banner}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Event Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date & Time */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Date & Time
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {startDateTime.date}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {startDateTime.time} - {endDateTime.time}
              </p>
            </div>
          </div>

          {/* Type */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Event Type
              </h3>
              <Badge variant="info" size="md" className="mt-2">
                {event.type}
              </Badge>
            </div>
          </div>

          {/* Airports */}
          {event.airports.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Airports ({event.airports.length})
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.airports.map((airport, idx) => (
                    <Badge key={idx} variant="success" size="sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      {airport.icao}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Organisers */}
          {event.organisers.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Organisers
                </h3>
                <div className="space-y-1 mt-2">
                  {event.organisers.map((org, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      {org.division} ({org.region})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Traffic Statistics */}
        {(trafficStats.total > 0 || trafficStats.isPast) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="elevated" padding="md">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {trafficStats.total}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total Flights
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <ArrowUpFromLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {trafficStats.departures}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Departures
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <ArrowDownToLine className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {trafficStats.arrivals}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Arrivals
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {trafficStats.perHour}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Per Hour
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {event.description || event.short_description}
          </p>
        </div>

        {/* Routes */}
        {event.routes && event.routes.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Recommended Routes
            </h3>
            <div className="space-y-2">
              {event.routes.map((route, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                    <Badge variant="default" size="sm">
                      {route.departure}
                    </Badge>
                    <span className="text-gray-400">→</span>
                    <Badge variant="info" size="sm">
                      {route.arrival}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 font-mono text-xs">
                    {route.route}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traffic Data */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {trafficStats.isPast
                ? 'Event Traffic Data'
                : 'Current Traffic at Event Airports'}
            </h3>
            <Badge variant="info" size="sm">
              {trafficStats.isPast ? historicalData.length : trafficData.length}{' '}
              flights
            </Badge>
          </div>

          {(isLoadingTraffic || isLoadingHistorical) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading traffic data...
            </div>
          )}

          {(trafficError || historicalError) && (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
              {trafficError || historicalError}
            </div>
          )}

          {/* Live Traffic Table */}
          {!isLoadingTraffic &&
            !trafficError &&
            trafficData.length > 0 &&
            !trafficStats.isPast && (
              <Table
                data={trafficData}
                columns={flightColumns}
                keyExtractor={(flight) => flight.callsign}
                searchable
                searchPlaceholder="Search flights..."
                searchKeys={['callsign', 'departure', 'arrival', 'name']}
                emptyMessage="No traffic found"
              />
            )}

          {/* Historical Traffic Info */}
          {!isLoadingHistorical &&
            !historicalError &&
            historicalData.length > 0 &&
            trafficStats.isPast && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      Historical Event Data
                    </h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <p>
                        This event has concluded. Traffic statistics are based
                        on {historicalData.length} recorded flights from STATSIM
                        data.
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        Data provided by STATSIM API (api.statsim.net)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* No Traffic Messages */}
          {!isLoadingTraffic &&
            !isLoadingHistorical &&
            !trafficError &&
            !historicalError &&
            trafficData.length === 0 &&
            historicalData.length === 0 &&
            event.airports.length > 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {trafficStats.isPast
                  ? 'No historical traffic data available for this event'
                  : 'No current traffic at event airports'}
              </div>
            )}

          {event.airports.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No airports specified for this event
            </div>
          )}
        </div>

        {/* External Link */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            View on VATSIM
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </Modal>
  );
}
