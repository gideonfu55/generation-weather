
const WeatherDetails = ({ data }) => {
  // Make sure data exists before trying to access properties
  if (!data) return null;

  return (
    <div className="weather-details">
      {data.windSpeed !== null && data.windSpeed !== undefined && (
        <div className="detail-item">
          <span className="detail-label">Wind:</span>
          <span className="detail-value">
            {data.windSpeed} {data.windSpeedUnit || 'km/h'}
          </span>
        </div>
      )}
      {/* Add any other weather details here */}
    </div>
  );
};

export default WeatherDetails;