import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as weatherApiService from '../services/weatherApi';

// Mock the API service
jest.mock('../services/weatherApi');

describe('App Component Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows intro message initially', () => {
    render(<App />);
    expect(screen.getByText(/Enter a city name to get the current weather/i)).toBeInTheDocument();
  });

  test('displays weather data when search is successful', async () => {
    // Mock successful API response
    weatherApiService.fetchWeatherData.mockResolvedValueOnce({
      current: {
        temperature_2m: 22.5,
        weather_code: 1,
        wind_speed_10m: 4.2
      },
      current_units: {
        temperature_2m: "°C",
        wind_speed_10m: "km/h"
      }
    });

    weatherApiService.getWeatherDescription.mockReturnValueOnce('Mainly clear');

    render(<App />);

    // Enter city name and submit
    const input = screen.getByPlaceholderText(/Enter city name/i);
    fireEvent.change(input, { target: { value: 'London' } });
    fireEvent.click(screen.getByRole('button', { name: /get weather/i }));

    // Check loading state is shown
    expect(screen.getByText(/loading weather data/i)).toBeInTheDocument();

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('23°C')).toBeInTheDocument();
      expect(screen.getByText('Mainly clear')).toBeInTheDocument();
    });

    expect(weatherApiService.fetchWeatherData).toHaveBeenCalledWith('London');
  });

  test('displays error message when API call fails', async () => {
    // Mock API error
    weatherApiService.fetchWeatherData.mockRejectedValueOnce(
      new weatherApiService.WeatherApiError('City "NotACity" not found. Please check spelling and try again.', 404, 'notFound')
    );

    render(<App />);

    // Enter city name and submit
    const input = screen.getByPlaceholderText(/Enter city name/i);
    fireEvent.change(input, { target: { value: 'NotACity' } });
    fireEvent.click(screen.getByRole('button', { name: /get weather/i }));

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/City "NotACity" not found/i)).toBeInTheDocument();
    });
  });

  test('handles network errors appropriately', async () => {
    // Mock network error
    weatherApiService.fetchWeatherData.mockRejectedValueOnce(
      new weatherApiService.WeatherApiError('Failed to connect to weather service. Please check your internet connection.', null, 'network')
    );

    render(<App />);

    // Enter city name and submit
    const input = screen.getByPlaceholderText(/Enter city name/i);
    fireEvent.change(input, { target: { value: 'Berlin' } });
    fireEvent.click(screen.getByRole('button', { name: /get weather/i }));

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
    });
  });
});