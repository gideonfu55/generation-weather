import { useState } from 'react';
import { fetchWeatherData } from '../services/weatherApi';

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
      // fetchWeatherData already returns formatted data
      const formattedData = await fetchWeatherData(city);

      // No need to re-format it - just use it directly
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