import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../components/layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui';
import { Table } from '../components/ui/Table';
import {
  Calendar,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Plane,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

interface StatsimFlight {
  id: number;
  vatsimid: number;
  callsign: string;
  departure: string;
  destination: string;
  aircraft: string;
  altitude: number;
  route: string;
  departed: string; // ISO timestamp
  arrived: string | null; // ISO timestamp or null
  loggedOn: string; // ISO timestamp
}

interface LiveFlight {
  callsign: string;
  cid: number;
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

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<VatsimEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Traffic data
  const [historicalData, setHistoricalData] = useState<StatsimFlight[]>([]);
  const [liveData, setLiveData] = useState<LiveFlight[]>([]);
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(false);
  const [trafficError, setTrafficError] = useState<string | null>(null);

  // UI state
  const [isTrafficExpanded, setIsTrafficExpanded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (event) {
      fetchTrafficData();
    }
  }, [event]);

  const fetchEvent = async (eventId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/events');
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      const foundEvent = data.data?.find((e: VatsimEvent) => e.id === eventId);

      if (!foundEvent) {
        throw new Error('Event not found');
      }

      setEvent(foundEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrafficData = async () => {
    if (!event) return;

    setIsLoadingTraffic(true);
    setTrafficError(null);

    const now = new Date();
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);

    // Event is past - fetch historical data from STATSIM
    if (eventEnd < now) {
      try {
        // Query 30min before start to 30min after end (UTC)
        const queryStart = new Date(eventStart.getTime() - 30 * 60 * 1000);
        const queryEnd = new Date(eventEnd.getTime() + 30 * 60 * 1000);

        const response = await fetch(
          `http://localhost:3001/api/statsim/flights/dates?from=${queryStart.toISOString()}&to=${queryEnd.toISOString()}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch historical traffic data');
        }

        const data = await response.json();
        setHistoricalData(data || []);
      } catch (err) {
        setTrafficError(
          err instanceof Error
            ? err.message
            : 'Failed to load historical traffic'
        );
      } finally {
        setIsLoadingTraffic(false);
      }
    }
    // Event is live or upcoming - fetch current live data
    else {
      try {
        // For LIVE events: also fetch STATSIM historical data from 30min before start to now
        if (eventStart <= now && now <= eventEnd) {
          const queryStart = new Date(eventStart.getTime() - 30 * 60 * 1000);
          const queryEnd = now;

          const statsimResponse = await fetch(
            `http://localhost:3001/api/statsim/flights/dates?from=${queryStart.toISOString()}&to=${queryEnd.toISOString()}`
          );

          if (statsimResponse.ok) {
            const statsimData = await statsimResponse.json();
            setHistoricalData(statsimData || []);
          }
        }

        // Fetch current live data
        const airportIcaos = event.airports.map((a) => a.icao);
        const trafficPromises = airportIcaos.map((icao) =>
          fetch(`http://localhost:3001/api/flights?icao=${icao}`)
            .then((res) => res.json())
            .catch(() => [])
        );

        const results = await Promise.all(trafficPromises);
        const allFlights = results.flat();

        // Remove duplicates by callsign
        const uniqueFlights = Array.from(
          new Map(allFlights.map((f) => [f.callsign, f])).values()
        );

        setLiveData(uniqueFlights);
      } catch (err) {
        setTrafficError(
          err instanceof Error ? err.message : 'Failed to load live traffic'
        );
      } finally {
        setIsLoadingTraffic(false);
      }
    }
  };

  const getEventStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return {
        status: 'upcoming',
        label: 'Upcoming',
        variant: 'info' as const,
      };
    } else if (now >= start && now <= end) {
      return { status: 'live', label: 'Live Now', variant: 'success' as const };
    } else {
      return { status: 'past', label: 'Past', variant: 'default' as const };
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  // Calculate traffic statistics
  const trafficStats = useMemo(() => {
    if (!event) return null;

    const eventAirports = event.airports.map((a) => a.icao);
    const isPast =
      getEventStatus(event.start_time, event.end_time).status === 'past';

    if (isPast && historicalData.length > 0) {
      // Historical data analysis
      const relevantFlights = historicalData.filter(
        (f) =>
          eventAirports.includes(f.departure) ||
          eventAirports.includes(f.destination)
      );

      const departures = relevantFlights.filter((f) =>
        eventAirports.includes(f.departure)
      );
      const arrivals = relevantFlights.filter((f) =>
        eventAirports.includes(f.destination)
      );

      // Calculate flights per hour
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      const durationHours =
        (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
      const perHour =
        durationHours > 0 ? relevantFlights.length / durationHours : 0;

      return {
        total: relevantFlights.length,
        departures: departures.length,
        arrivals: arrivals.length,
        perHour: Math.round(perHour * 10) / 10,
        isPast: true,
      };
    } else if (liveData.length > 0) {
      // Live data analysis
      const departures = liveData.filter((f) =>
        eventAirports.includes(f.departure)
      );
      const arrivals = liveData.filter((f) =>
        eventAirports.includes(f.arrival)
      );

      return {
        total: liveData.length,
        departures: departures.length,
        arrivals: arrivals.length,
        perHour: 0, // Not applicable for live data
        isPast: false,
      };
    }

    return null;
  }, [event, historicalData, liveData]);

  // Calculate traffic flow data for graph (10-minute intervals)
  const trafficFlowData = useMemo(() => {
    if (!event) return [];

    const eventAirports = event.airports.map((a) => a.icao);
    const status = getEventStatus(event.start_time, event.end_time).status;

    // Only show graph if we have historical data (past events OR live events with STATSIM data)
    if (historicalData.length === 0) return [];

    // Group flights by 10-minute intervals
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    const now = new Date();

    // For past events: 30min before start to 30min after end
    // For live events: X-axis goes to event end, but data only until now
    const queryStart = new Date(eventStart.getTime() - 30 * 60 * 1000);
    const dataEndTime =
      status === 'live' ? now : new Date(eventEnd.getTime() + 30 * 60 * 1000);
    const graphEndTime =
      status === 'live'
        ? new Date(eventEnd.getTime() + 30 * 60 * 1000) // Graph shows full timeline
        : dataEndTime;

    const intervalData: Record<
      string,
      { time: string; departures: number; arrivals: number; total: number }
    > = {};

    // Initialize all 10-minute intervals in range (full graph timeline)
    const currentInterval = new Date(queryStart);
    currentInterval.setMinutes(
      Math.floor(currentInterval.getMinutes() / 10) * 10,
      0,
      0
    );

    while (currentInterval <= graphEndTime) {
      const timeKey = currentInterval.toISOString().substring(0, 16); // YYYY-MM-DDTHH:MM
      intervalData[timeKey] = {
        time: currentInterval.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        departures: 0,
        arrivals: 0,
        total: 0,
      };
      currentInterval.setMinutes(currentInterval.getMinutes() + 10);
    }

    // Count flights per 10-minute interval (only up to current data)
    historicalData.forEach((flight) => {
      const departTime = new Date(flight.departed);

      // Only count if within data range
      if (departTime <= dataEndTime) {
        // Round down to nearest 10-minute interval
        const intervalTime = new Date(departTime);
        intervalTime.setMinutes(
          Math.floor(intervalTime.getMinutes() / 10) * 10,
          0,
          0
        );
        const intervalKey = intervalTime.toISOString().substring(0, 16);

        if (intervalData[intervalKey]) {
          if (eventAirports.includes(flight.departure)) {
            intervalData[intervalKey].departures++;
            intervalData[intervalKey].total++;
          }
          if (eventAirports.includes(flight.destination)) {
            intervalData[intervalKey].arrivals++;
            if (!eventAirports.includes(flight.departure)) {
              // Only count once if both dep/arr are event airports
              intervalData[intervalKey].total++;
            }
          }
        }
      }
    });

    return Object.values(intervalData);
  }, [event, historicalData]);

  // Calculate per-airport traffic flow data
  const perAirportTrafficData = useMemo(() => {
    if (!event || historicalData.length === 0) return {};

    const eventAirports = event.airports.map((a) => a.icao);
    const status = getEventStatus(event.start_time, event.end_time).status;

    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    const now = new Date();

    const queryStart = new Date(eventStart.getTime() - 30 * 60 * 1000);
    const dataEndTime =
      status === 'live' ? now : new Date(eventEnd.getTime() + 30 * 60 * 1000);
    const graphEndTime =
      status === 'live'
        ? new Date(eventEnd.getTime() + 30 * 60 * 1000)
        : dataEndTime;

    // Create data for each airport
    const airportData: Record<string, any[]> = {};

    eventAirports.forEach((airport) => {
      const intervalData: Record<
        string,
        { time: string; departures: number; arrivals: number; total: number }
      > = {};

      // Initialize all 10-minute intervals
      const currentInterval = new Date(queryStart);
      currentInterval.setMinutes(
        Math.floor(currentInterval.getMinutes() / 10) * 10,
        0,
        0
      );

      while (currentInterval <= graphEndTime) {
        const timeKey = currentInterval.toISOString().substring(0, 16);
        intervalData[timeKey] = {
          time: currentInterval.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          departures: 0,
          arrivals: 0,
          total: 0,
        };
        currentInterval.setMinutes(currentInterval.getMinutes() + 10);
      }

      // Count flights for this specific airport
      historicalData.forEach((flight) => {
        const departTime = new Date(flight.departed);

        if (departTime <= dataEndTime) {
          const intervalTime = new Date(departTime);
          intervalTime.setMinutes(
            Math.floor(intervalTime.getMinutes() / 10) * 10,
            0,
            0
          );
          const intervalKey = intervalTime.toISOString().substring(0, 16);

          if (intervalData[intervalKey]) {
            if (flight.departure === airport) {
              intervalData[intervalKey].departures++;
              intervalData[intervalKey].total++;
            }
            if (flight.destination === airport) {
              intervalData[intervalKey].arrivals++;
              if (flight.departure !== airport) {
                intervalData[intervalKey].total++;
              }
            }
          }
        }
      });

      airportData[airport] = Object.values(intervalData);
    });

    return airportData;
  }, [event, historicalData]);

  if (isLoading) {
    return (
      <Container size="xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading event details...
          </span>
        </div>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container size="xl">
        <div className="py-12">
          <Card variant="bordered" padding="lg">
            <div className="text-center space-y-4">
              <p className="text-red-600 dark:text-red-400">
                {error || 'Event not found'}
              </p>
              <Button variant="primary" onClick={() => navigate('/events')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  const status = getEventStatus(event.start_time, event.end_time);

  return (
    <Container size="xl">
      <div className="space-y-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        {/* Event Banner & Header */}
        <Card variant="elevated" padding="none" className="overflow-hidden">
          {event.banner && (
            <div className="relative w-full h-64 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800">
              <img
                src={event.banner}
                alt={event.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute top-4 right-4">
                <Badge variant={status.variant} size="lg" rounded>
                  {status.status === 'live' && (
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  )}
                  {status.label}
                </Badge>
              </div>
            </div>
          )}

          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <Badge variant="info" size="md">
                  {event.type}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {event.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {event.short_description}
                </p>
              </div>

              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Button variant="primary">
                  View on VATSIM
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Event Time (UTC)
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(event.start_time)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    to {formatDateTime(event.end_time)}
                  </p>
                </div>
              </div>

              {/* Airports */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Airports
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {event.airports.map((airport, idx) => (
                      <Badge key={idx} variant="default" size="md">
                        {airport.icao}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recommended Routes */}
        {event.routes.length > 0 && (
          <Card variant="bordered" padding="lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recommended Routes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {event.routes.map((route, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="success" size="sm">
                      {route.departure}
                    </Badge>
                    <span className="text-gray-400">→</span>
                    <Badge variant="info" size="sm">
                      {route.arrival}
                    </Badge>
                  </div>
                  {route.route && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {route.route}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Traffic Statistics */}
        {trafficStats && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Traffic Statistics
              {trafficStats.isPast && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-3">
                  (30min before to 30min after event)
                </span>
              )}
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="bordered" padding="lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Flights
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {trafficStats.total}
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="bordered" padding="lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <ArrowUpFromLine className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Departures
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {trafficStats.departures}
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="bordered" padding="lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <ArrowDownToLine className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Arrivals
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {trafficStats.arrivals}
                    </p>
                  </div>
                </div>
              </Card>

              {trafficStats.isPast && trafficStats.perHour > 0 && (
                <Card variant="bordered" padding="lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Per Hour
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {trafficStats.perHour}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Traffic Flow Graph - For past AND live events with historical data */}
            {trafficFlowData.length > 0 && (
              <Card variant="bordered" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Traffic Flow Over Time
                      {!trafficStats?.isPast && (
                        <span className="ml-2 text-xs font-normal px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                          LIVE
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {trafficStats?.isPast
                        ? '10-minute intervals of departures and arrivals'
                        : 'Real-time breakdown in 10-minute intervals (30min before start to now)'}
                    </p>
                  </div>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficFlowData}>
                      <defs>
                        <linearGradient
                          id="colorDepartures"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorArrivals"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#a855f7"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#a855f7"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-gray-200 dark:stroke-gray-700"
                      />
                      <XAxis
                        dataKey="time"
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                      />
                      <YAxis
                        className="text-xs fill-gray-600 dark:fill-gray-400"
                        domain={[
                          0,
                          (dataMax: number) => Math.ceil(dataMax * 1.15),
                        ]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="departures"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorDepartures)"
                        name="Departures"
                      />
                      <Area
                        type="monotone"
                        dataKey="arrivals"
                        stroke="#a855f7"
                        fillOpacity={1}
                        fill="url(#colorArrivals)"
                        name="Arrivals"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Per-Airport Traffic Graphs */}
            {event &&
              event.airports.length > 1 &&
              Object.keys(perAirportTrafficData).length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {event.airports.map((airport) => {
                    const airportData = perAirportTrafficData[airport.icao];
                    if (!airportData || airportData.length === 0) return null;

                    return (
                      <Card key={airport.icao} variant="bordered" padding="lg">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              {airport.icao}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Traffic breakdown for this airport
                            </p>
                          </div>

                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={airportData}>
                                <defs>
                                  <linearGradient
                                    id={`colorDep-${airport.icao}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#10b981"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#10b981"
                                      stopOpacity={0.1}
                                    />
                                  </linearGradient>
                                  <linearGradient
                                    id={`colorArr-${airport.icao}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#a855f7"
                                      stopOpacity={0.8}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#a855f7"
                                      stopOpacity={0.1}
                                    />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  className="stroke-gray-200 dark:stroke-gray-700"
                                />
                                <XAxis
                                  dataKey="time"
                                  className="text-xs fill-gray-600 dark:fill-gray-400"
                                  tick={{ fontSize: 10 }}
                                />
                                <YAxis
                                  className="text-xs fill-gray-600 dark:fill-gray-400"
                                  domain={[
                                    0,
                                    (dataMax: number) =>
                                      Math.ceil(dataMax * 1.15),
                                  ]}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor:
                                      'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                  }}
                                  labelStyle={{
                                    color: '#1f2937',
                                    fontWeight: 'bold',
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Area
                                  type="monotone"
                                  dataKey="departures"
                                  stroke="#10b981"
                                  fillOpacity={1}
                                  fill={`url(#colorDep-${airport.icao})`}
                                  name="Departures"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="arrivals"
                                  stroke="#a855f7"
                                  fillOpacity={1}
                                  fill={`url(#colorArr-${airport.icao})`}
                                  name="Arrivals"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* Traffic Table - Collapsible */}
        <Card variant="bordered" padding="lg">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsTrafficExpanded(!isTrafficExpanded)}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {trafficStats?.isPast ? 'Historical Traffic' : 'Live Traffic'}
            </h2>
            <Button variant="ghost" size="sm">
              {isTrafficExpanded ? (
                <>
                  <ChevronUp className="w-5 h-5 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-5 h-5 mr-2" />
                  Show Details
                </>
              )}
            </Button>
          </div>

          {isTrafficExpanded && (
            <div className="mt-4" onClick={(e) => e.stopPropagation()}>
              {isLoadingTraffic && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Loading traffic data...
                  </span>
                </div>
              )}

              {trafficError && (
                <div className="text-center py-8">
                  <p className="text-red-600 dark:text-red-400">
                    {trafficError}
                  </p>
                </div>
              )}

              {!isLoadingTraffic && !trafficError && trafficStats?.isPast && (
                <>
                  {historicalData.length > 0 ? (
                    <Table
                      columns={[
                        {
                          key: 'callsign',
                          header: 'Callsign',
                          accessor: (f: StatsimFlight) => f.callsign,
                        },
                        {
                          key: 'departure',
                          header: 'Departure',
                          accessor: (f: StatsimFlight) => f.departure,
                        },
                        {
                          key: 'destination',
                          header: 'Arrival',
                          accessor: (f: StatsimFlight) => f.destination,
                        },
                        {
                          key: 'aircraft',
                          header: 'Aircraft',
                          accessor: (f: StatsimFlight) => f.aircraft,
                        },
                        {
                          key: 'departed',
                          header: 'Departed (UTC)',
                          accessor: (f: StatsimFlight) =>
                            new Date(f.departed).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                        },
                      ]}
                      data={historicalData.filter(
                        (f) =>
                          event.airports.some((a) => a.icao === f.departure) ||
                          event.airports.some((a) => a.icao === f.destination)
                      )}
                      keyExtractor={(f: StatsimFlight) => f.id.toString()}
                    />
                  ) : (
                    <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                      No traffic data available for this event
                    </p>
                  )}
                </>
              )}

              {!isLoadingTraffic && !trafficError && !trafficStats?.isPast && (
                <>
                  {liveData.length > 0 ? (
                    <Table
                      columns={[
                        {
                          key: 'callsign',
                          header: 'Callsign',
                          accessor: (f: LiveFlight) => f.callsign,
                        },
                        {
                          key: 'departure',
                          header: 'Departure',
                          accessor: (f: LiveFlight) => f.departure,
                        },
                        {
                          key: 'arrival',
                          header: 'Arrival',
                          accessor: (f: LiveFlight) => f.arrival,
                        },
                        {
                          key: 'aircraft',
                          header: 'Aircraft',
                          accessor: (f: LiveFlight) => f.aircraft,
                        },
                        {
                          key: 'altitude',
                          header: 'Altitude',
                          accessor: (f: LiveFlight) =>
                            `${f.altitude.toLocaleString()} ft`,
                        },
                        {
                          key: 'groundspeed',
                          header: 'Speed',
                          accessor: (f: LiveFlight) => `${f.groundspeed} kts`,
                        },
                      ]}
                      data={liveData}
                      keyExtractor={(f: LiveFlight) => f.callsign}
                    />
                  ) : (
                    <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                      {status.status === 'upcoming'
                        ? 'No live traffic yet - check back when the event starts'
                        : 'No live traffic currently'}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
