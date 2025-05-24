import React from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import WeatherCard from './WeatherCard';
import useWeather from '../hooks/useWeather';

const App = () => {
  const { weatherData, loading, error, getWeather } = useWeather();

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <SearchBar onSearch={getWeather} isLoading={loading} />

        {loading && <div className="loading">Loading weather data...</div>}

        {error && <div className="error-message">{error}</div>}

        {weatherData && <WeatherCard data={weatherData} />}

        {!loading && !error && !weatherData && (
          <div className="intro-message">
            Enter a city name to get the current weather
          </div>
        )}
      </main>
    </div>
  );
};

export default App;