import { useState } from 'react';
import { fetchWeatherData } from '../services/weatherApi';

const useWeatherComparison = () => {
  const [citiesData, setCitiesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getMultipleCitiesWeather = async (cities) => {
    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return;
    }

    setLoading(true);
    setErrors({});

    // Keep track of fetched data and errors
    const newCitiesData = [];
    const newErrors = {};

    // Process cities in parallel
    const promises = cities.map(async (city, index) => {
      if (!city || !city.trim()) {
        return;
      }

      try {
        const weatherData = await fetchWeatherData(city.trim());
        newCitiesData[index] = weatherData;
      } catch (err) {
        newErrors[index] = err.message || 'Failed to fetch weather data';
      }
    });

    // Wait for all requests to complete
    await Promise.all(promises);

    setCitiesData(newCitiesData);
    setErrors(newErrors);
    setLoading(false);
  };

  const clearComparison = () => {
    setCitiesData([]);
    setErrors({});
  };

  return {
    citiesData,
    loading,
    errors,
    getMultipleCitiesWeather,
    clearComparison
  };
};

export default useWeatherComparison;