import React from 'react';
import { formatTemperature, capitalizeWords } from '../utils/formatters';
import WeatherDetails from './WeatherDetails';

const WeatherCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="weather-card">
      <h2 className="city-name">{capitalizeWords(data.city)}</h2>
      <div className="temperature">
        {formatTemperature(data.temperature, data.temperatureUnit)}
      </div>
      <div className="description">{data.description}</div>
      <WeatherDetails data={data} />
    </div>
  );
};

export default WeatherCard;