import React from 'react';

const WeatherDetails = ({ data }) => {
  if (!data) return null;

  return (
    <div className="weather-details">
      <div className="detail-item">
        <span className="detail-label">Wind:</span>
        <span className="detail-value">{data.windSpeed} {data.windSpeedUnit}</span>
      </div>
      {/* Add more weather details here as needed */}
      <div className="detail-item">
        <span className="detail-label">Description:</span>
        <span className="detail-value">{data.description}</span>
      </div>
    </div>
  );
};

export default WeatherDetails;