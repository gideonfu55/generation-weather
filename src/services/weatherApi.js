const API_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetches weather data for a given city
 * @param {string} city - The city name to get weather for
 * @returns {Promise} Promise resolving to weather data
 */
export const fetchWeatherData = async (city) => {
  try {
    // First get coordinates for the city using geocoding
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found');
    }

    const { latitude, longitude } = geoData.results[0];

    // Fetch weather data using coordinates
    const weatherResponse = await fetch(
      `${API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
    );

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    return await weatherResponse.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Maps weather codes to descriptions
 * @param {number} code - The weather code from the API
 * @returns {string} A human-readable weather description
 */
export const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    // Add more codes as needed
  };

  return weatherCodes[code] || 'Unknown';
};