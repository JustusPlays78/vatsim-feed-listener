import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';

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

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<VatsimEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use our backend with event caching for past events
      const response = await fetch('http://localhost:3001/api/events');

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      setEvents(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setIsLoading(false);
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

  const handleEventClick = (event: VatsimEvent) => {
    navigate(`/events/${event.id}`);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  // Separate events by status and filter upcoming to 12h
  const now = new Date();
  const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000);

  const liveEvents = events.filter(
    (e) => getEventStatus(e.start_time, e.end_time).status === 'live'
  );

  // Only upcoming events within next 12 hours
  const upcomingEvents = events.filter((e) => {
    const status = getEventStatus(e.start_time, e.end_time).status;
    const startTime = new Date(e.start_time);
    return status === 'upcoming' && startTime <= in12Hours;
  });

  const pastEvents = events.filter(
    (e) => getEventStatus(e.start_time, e.end_time).status === 'past'
  );

  return (
    <Container size="xl">
      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            VATSIM Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Live events, past events, and upcoming events (next 12h)
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading events...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card variant="bordered" padding="lg">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button variant="primary" onClick={fetchEvents}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Events Grid */}
        {!isLoading && !error && (
          <>
            {/* Live Events */}
            {liveEvents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      🔴 Live Events
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {liveEvents.length} event
                      {liveEvents.length !== 1 ? 's' : ''} happening right now
                    </p>
                  </div>
                  <Badge
                    variant="success"
                    size="lg"
                    rounded
                    className="ml-auto"
                  >
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Live
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {liveEvents.map((event) => {
                    const { date, time } = formatDateTime(event.start_time);
                    const endTime = formatDateTime(event.end_time).time;

                    return (
                      <Card
                        key={event.id}
                        variant="elevated"
                        padding="none"
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        onClick={() => handleEventClick(event)}
                      >
                        {/* Banner */}
                        {event.banner && (
                          <div className="relative w-full h-40 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800">
                            <img
                              src={event.banner}
                              alt={event.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="absolute top-3 right-3">
                              <Badge variant="success" size="md" rounded>
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Live
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div className="p-5 space-y-4">
                          {/* Event Type */}
                          <Badge variant="info" size="sm">
                            {event.type}
                          </Badge>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {event.name}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {event.short_description}
                          </p>

                          {/* Airports */}
                          {event.airports.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <div className="flex flex-wrap gap-1">
                                {event.airports
                                  .slice(0, 3)
                                  .map((airport, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="success"
                                      size="sm"
                                    >
                                      {airport.icao}
                                    </Badge>
                                  ))}
                                {event.airports.length > 3 && (
                                  <Badge variant="default" size="sm">
                                    +{event.airports.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Time */}
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {date} • {time} - {endTime}
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    🕐 Past Events
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {pastEvents.length} event
                    {pastEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pastEvents.slice(0, 6).map((event) => {
                    const { date, time } = formatDateTime(event.start_time);
                    const endTime = formatDateTime(event.end_time).time;

                    return (
                      <Card
                        key={event.id}
                        variant="bordered"
                        padding="none"
                        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        onClick={() => handleEventClick(event)}
                      >
                        {/* Banner */}
                        {event.banner && (
                          <div className="relative w-full h-40 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700">
                            <img
                              src={event.banner}
                              alt={event.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="absolute top-3 right-3">
                              <Badge variant="default" size="md">
                                Past
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div className="p-5 space-y-4">
                          {/* Event Type */}
                          <Badge variant="default" size="sm">
                            {event.type}
                          </Badge>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {event.name}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {event.short_description}
                          </p>

                          {/* Airports */}
                          {event.airports.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <div className="flex flex-wrap gap-1">
                                {event.airports
                                  .slice(0, 3)
                                  .map((airport, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="default"
                                      size="sm"
                                    >
                                      {airport.icao}
                                    </Badge>
                                  ))}
                                {event.airports.length > 3 && (
                                  <Badge variant="default" size="sm">
                                    +{event.airports.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Time */}
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {date} • {time} - {endTime}
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Events - Compact, Non-clickable */}
            {upcomingEvents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      📅 Upcoming Events
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {upcomingEvents.length} event
                      {upcomingEvents.length !== 1 ? 's' : ''} in the next 12
                      hours
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {upcomingEvents.map((event) => {
                    const { date, time } = formatDateTime(event.start_time);

                    return (
                      <Card
                        key={event.id}
                        variant="bordered"
                        padding="sm"
                        className="space-y-2"
                      >
                        {/* Event Type */}
                        <Badge variant="info" size="sm">
                          {event.type}
                        </Badge>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                          {event.name}
                        </h3>

                        {/* Airports */}
                        {event.airports.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {event.airports.slice(0, 3).map((airport, idx) => (
                              <Badge key={idx} variant="default" size="sm">
                                {airport.icao}
                              </Badge>
                            ))}
                            {event.airports.length > 3 && (
                              <Badge variant="default" size="sm">
                                +{event.airports.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Time */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {date} • {time}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Events Message */}
            {events.length === 0 && !isLoading && !error && (
              <Card variant="bordered" padding="lg">
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Events Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later for upcoming VATSIM events
                  </p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
