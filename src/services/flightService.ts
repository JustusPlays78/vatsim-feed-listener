import type { Flight } from '../types';

const API_BASE = '/api/flights';

export class FlightService {
  static async fetchFlights(icao: string): Promise<Flight[]> {
    const url = `${API_BASE}?icao=${icao}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }));
      throw new Error(
        `HTTP ${response.status}: ${
          errorData.error || errorData.message || response.statusText
        }`
      );
    }

    const flights = await response.json();

    if (!Array.isArray(flights)) {
      throw new Error('Unexpected data format from API');
    }

    return flights;
  }
}
