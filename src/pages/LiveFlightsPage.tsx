import SearchForm from '../components/SearchForm';
import FlightResults from '../components/FlightResults';
import { Container } from '../components/layout';

export default function LiveFlightsPage() {
  return (
    <Container size="xl">
      <div className="space-y-8 py-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Live Flights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track real-time VATSIM flight data across the network
          </p>
        </div>

        <SearchForm />
        <FlightResults />
      </div>
    </Container>
  );
}
