import { formatTemperature, capitalizeWords } from '../utils/formatters';
import WeatherDetails from './WeatherDetails';

const WeatherCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="weather-card">
      <h2 className="city-name">{data.city ? capitalizeWords(data.city) : 'Unknown Location'}</h2>
      <div className="temperature">
        {data.temperature !== null && data.temperature !== undefined
          ? formatTemperature(data.temperature, data.temperatureUnit)
          : 'Temperature unavailable'}
      </div>
      <div className="description">{data.description || 'No weather description available'}</div>
      <WeatherDetails data={data} />
    </div>
  );
};

export default WeatherCard;