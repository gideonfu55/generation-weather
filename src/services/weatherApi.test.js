import { fetchWeatherData, getWeatherDescription, WeatherApiError } from './weatherApi';

// Mock fetch API
global.fetch = jest.fn();

describe('Weather API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation Tests', () => {
    test('should throw error when city is null', async () => {
      await expect(fetchWeatherData(null)).rejects.toThrow('City name is required');
    });

    test('should throw error when city is undefined', async () => {
      await expect(fetchWeatherData(undefined)).rejects.toThrow('City name is required');
    });

    test('should throw error when city is an empty string', async () => {
      await expect(fetchWeatherData('')).rejects.toThrow('City name is required');
    });

    test('should throw error when city contains only spaces', async () => {
      await expect(fetchWeatherData('   ')).rejects.toThrow('City name cannot be empty');
    });

    test('should throw error when city contains invalid characters', async () => {
      await expect(fetchWeatherData('New York123')).rejects.toThrow('City name contains invalid characters');
      await expect(fetchWeatherData('London!')).rejects.toThrow('City name contains invalid characters');
      await expect(fetchWeatherData('Paris@')).rejects.toThrow('City name contains invalid characters');
    });

    test('should accept valid city names', async () => {
      // Mock successful responses for valid inputs
      mockSuccessfulGeoResponse('New York');
      mockSuccessfulWeatherResponse();

      await expect(fetchWeatherData('New York')).resolves.not.toThrow();
      await expect(fetchWeatherData("O'Hare")).resolves.not.toThrow();
      await expect(fetchWeatherData('San-Francisco')).resolves.not.toThrow();
      await expect(fetchWeatherData('St. Petersburg')).resolves.not.toThrow();
    });
  });

  describe('API Request Formatting Tests', () => {
    test('should properly encode city name in API request', async () => {
      mockSuccessfulGeoResponse('New York City');
      mockSuccessfulWeatherResponse();

      await fetchWeatherData('New York City');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('name=New%20York%20City')
      );
    });

    test('should trim whitespace from city name', async () => {
      mockSuccessfulGeoResponse('Berlin');
      mockSuccessfulWeatherResponse();

      await fetchWeatherData('  Berlin  ');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('name=Berlin')
      );
    });
  });

  describe('Geocoding API Error Handling Tests', () => {
    test('should handle city not found error', async () => {
      // Mock empty results array
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      await expect(fetchWeatherData('NonexistentCity')).rejects.toThrow(
        'City "NonexistentCity" not found'
      );
    });

    test('should handle geocoding API server error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ reason: 'Server overloaded' })
      });

      await expect(fetchWeatherData('London')).rejects.toThrow(
        'Geocoding error: Server overloaded'
      );
    });

    test('should handle geocoding API network failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(fetchWeatherData('London')).rejects.toThrow(
        'Failed to connect to geocoding service'
      );
    });
  });

  describe('Weather API Error Handling Tests', () => {
    test('should handle weather API server error', async () => {
      // First mock a successful geocoding response
      mockSuccessfulGeoResponse('Tokyo');

      // Then mock a failed weather API response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ reason: 'Maintenance in progress' })
      });

      await expect(fetchWeatherData('Tokyo')).rejects.toThrow(
        'Weather error: Maintenance in progress'
      );
    });

    test('should handle weather API network failure', async () => {
      // First mock a successful geocoding response
      mockSuccessfulGeoResponse('Paris');

      // Then mock a network failure for weather API
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(fetchWeatherData('Paris')).rejects.toThrow(
        'Failed to connect to weather service'
      );
    });

    test('should handle invalid weather data format', async () => {
      // First mock a successful geocoding response
      mockSuccessfulGeoResponse('Rome');

      // Then mock an invalid weather data response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          /* Missing 'current' object or temperature_2m */
          some_other_data: true
        })
      });

      await expect(fetchWeatherData('Rome')).rejects.toThrow(
        'Received invalid weather data format from the API'
      );
    });
  });

  describe('getWeatherDescription Tests', () => {
    test('should return correct description for known weather codes', () => {
      expect(getWeatherDescription(0)).toBe('Clear sky');
      expect(getWeatherDescription(3)).toBe('Overcast');
      expect(getWeatherDescription(95)).toBe('Thunderstorm');
    });

    test('should return "Unknown" for unknown weather codes', () => {
      expect(getWeatherDescription(999)).toBe('Unknown');
    });

    test('should handle null or undefined weather codes', () => {
      // Add this to your getWeatherDescription function:
      // if (code === undefined || code === null) {
      //   return 'Weather information unavailable';
      // }

      // Then test it:
      expect(getWeatherDescription(null)).toBe('Unknown');
      expect(getWeatherDescription(undefined)).toBe('Unknown');
    });
  });

  // Helper functions for mocking API responses
  function mockSuccessfulGeoResponse(city) {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{
          name: city,
          latitude: 40.7128,
          longitude: -74.0060
        }]
      })
    });
  }

  function mockSuccessfulWeatherResponse() {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 15.5,
          weather_code: 0,
          wind_speed_10m: 5.3
        },
        current_units: {
          temperature_2m: "°C",
          wind_speed_10m: "km/h"
        }
      })
    });
  }
});