import React, { useState } from 'react';
import SearchBar from './SearchBar';
import WeatherCard from './WeatherCard';
import useWeather from '../hooks/useWeather';
import CityComparison from './CityComparison';
import './App.css';

const App = () => {
  const { weatherData, loading, error, getWeather } = useWeather();
  const [view, setView] = useState('single'); // 'single' or 'comparison'

  const handleSearch = (city) => {
    getWeather(city);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Weather App</h1>
        <nav className="app-nav">
          <button
            className={`nav-button ${view === 'single' ? 'active' : ''}`}
            onClick={() => setView('single')}
          >
            Single City
          </button>
          <button
            className={`nav-button ${view === 'comparison' ? 'active' : ''}`}
            onClick={() => setView('comparison')}
          >
            Compare Cities
          </button>
        </nav>
      </header>

      <main className="app-content">
        {view === 'single' ? (
          <>
            <SearchBar onSearch={handleSearch} />

            {loading && <div className="loading-message">Loading weather data...</div>}

            {error && <div className="error-message">{error}</div>}

            {weatherData && !loading && !error && (
              <WeatherCard data={weatherData} />
            )}
          </>
        ) : (
          <CityComparison />
        )}
      </main>

      <footer className="app-footer">
        <p>Weather data provided by Open-Meteo API</p>
      </footer>
    </div>
  );
};

export default App;