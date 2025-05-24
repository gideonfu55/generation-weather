import { useState } from 'react';
import { fetchWeatherData, getWeatherDescription } from '../services/weatherApi';

const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWeather = async (city) => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWeatherData(city);

      // Format the data for our UI
      const formattedData = {
        city: city,
        temperature: data.current.temperature_2m,
        temperatureUnit: data.current_units.temperature_2m,
        description: getWeatherDescription(data.current.weather_code),
        windSpeed: data.current.wind_speed_10m,
        windSpeedUnit: data.current_units.wind_speed_10m
      };

      setWeatherData(formattedData);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    weatherData,
    loading,
    error,
    getWeather
  };
};

export default useWeather;