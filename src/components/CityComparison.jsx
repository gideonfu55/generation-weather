import { useState } from 'react';
import useWeatherComparison from '../hooks/useWeatherComparison';
import WeatherCard from './WeatherCard';
import './CityComparison.css';

const CityComparison = () => {
  const [cities, setCities] = useState(['', '', '']);
  const { citiesData, loading, errors, getMultipleCitiesWeather } = useWeatherComparison();

  const handleCityChange = (index, value) => {
    const newCities = [...cities];
    newCities[index] = value;
    setCities(newCities);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out any empty city names
    const validCities = cities.filter(city => city.trim());
    if (validCities.length > 0) {
      getMultipleCitiesWeather(validCities);
    }
  };

  return (
    <div className="city-comparison">
      <h2>Compare Weather Across Cities</h2>

      <form onSubmit={handleSubmit} className="comparison-form">
        {cities.map((city, index) => (
          <div key={index} className="city-input-container">
            <input
              type="text"
              value={city}
              onChange={(e) => handleCityChange(index, e.target.value)}
              placeholder={`Enter city ${index + 1}`}
              className="city-input"
            />
            {errors[index] && <div className="error-message">{errors[index]}</div>}
          </div>
        ))}

        <button
          type="submit"
          className="compare-button"
          disabled={loading || !cities.some(city => city.trim())}
        >
          {loading ? 'Loading...' : 'Compare Weather'}
        </button>
      </form>

      {loading && <div className="loading">Loading weather data...</div>}

      <div className="weather-cards-container">
        {citiesData.map((data, index) => (
          <div key={index} className="comparison-card">
            <WeatherCard data={data} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CityComparison;