import { useFlightStore } from '../store';
import {
  AlertCircle,
  Plane,
  MapPin,
  Clock,
  User,
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Table, Column } from './ui/Table';
import { Grid } from './layout';
import type { Flight } from '../types';

export default function FlightResults() {
  const { flights, isLoading, error } = useFlightStore();

  if (isLoading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Loading flight data...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Fetching live VATSIM data
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="bordered" padding="lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
              Error Loading Data
            </h3>
            <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-3">
              Please check your network connection and try again.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!flights || flights.length === 0) {
    return null;
  }

  // Calculate statistics
  const stats = {
    total: flights.length,
    departures: flights.filter((f) => f.departure).length,
    arrivals: flights.filter((f) => f.arrival).length,
    uniqueAircraft: new Set(flights.map((f) => f.aircraft)).size,
  };

  // Define table columns
  const columns: Column<Flight>[] = [
    {
      key: 'callsign',
      header: 'Callsign',
      accessor: (flight) => (
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
            {flight.callsign}
          </span>
        </div>
      ),
      sortable: true,
      width: '15%',
    },
    {
      key: 'name',
      header: 'Pilot',
      accessor: (flight) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-gray-100">
            {flight.name || 'N/A'}
          </span>
        </div>
      ),
      sortable: true,
      width: '20%',
    },
    {
      key: 'route',
      header: 'Route',
      accessor: (flight) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-sm">
            <span className="text-green-600 dark:text-green-400 font-semibold">
              {flight.departure}
            </span>
            {' → '}
            <span className="text-orange-600 dark:text-orange-400 font-semibold">
              {flight.arrival}
            </span>
          </span>
        </div>
      ),
      sortable: false,
      width: '15%',
    },
    {
      key: 'aircraft',
      header: 'Aircraft',
      accessor: (flight) => (
        <Badge variant="default" size="sm">
          {flight.aircraft}
        </Badge>
      ),
      sortable: true,
      width: '12%',
    },
    {
      key: 'altitude',
      header: 'Altitude',
      accessor: (flight) => (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-sm">
            {flight.altitude.toLocaleString()} ft
          </span>
        </div>
      ),
      sortable: true,
      align: 'right',
      width: '12%',
    },
    {
      key: 'groundspeed',
      header: 'Speed',
      accessor: (flight) => (
        <span className="font-mono text-sm">{flight.groundspeed} kts</span>
      ),
      sortable: true,
      align: 'right',
      width: '10%',
    },
    {
      key: 'logon_time',
      header: 'Logon Time',
      accessor: (flight) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(flight.logon_time).toLocaleTimeString()}
          </span>
        </div>
      ),
      sortable: true,
      width: '16%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Grid cols={4} gap="md">
        <StatCard
          icon={<Plane className="w-6 h-6" />}
          label="Total Flights"
          value={stats.total}
          variant="primary"
        />
        <StatCard
          icon={<MapPin className="w-6 h-6" />}
          label="Departures"
          value={stats.departures}
          variant="success"
        />
        <StatCard
          icon={<MapPin className="w-6 h-6 rotate-180" />}
          label="Arrivals"
          value={stats.arrivals}
          variant="warning"
        />
        <StatCard
          icon={<Plane className="w-6 h-6" />}
          label="Aircraft Types"
          value={stats.uniqueAircraft}
          variant="info"
        />
      </Grid>

      {/* Flight Table */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Live Flight Data</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time data from VATSIM network
          </p>
        </CardHeader>
        <CardContent>
          <Table
            data={flights}
            columns={columns}
            keyExtractor={(flight, idx) => flight.callsign + idx}
            searchable
            searchPlaceholder="Search by callsign, pilot, route, or aircraft..."
            searchKeys={[
              'callsign',
              'name',
              'departure',
              'arrival',
              'aircraft',
            ]}
            sortable
            emptyMessage="No flights found"
            isLoading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: 'primary' | 'success' | 'warning' | 'info';
}

function StatCard({ icon, label, value, variant }: StatCardProps) {
  const variants = {
    primary: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-orange-500 to-orange-600',
    info: 'from-cyan-500 to-cyan-600',
  };

  return (
    <Card variant="bordered" padding="md" hoverable>
      <div className="flex items-center gap-4">
        <div
          className={`p-3 bg-gradient-to-br ${variants[variant]} rounded-xl text-white shadow-lg`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
            {label}
          </div>
        </div>
      </div>
    </Card>
  );
}
