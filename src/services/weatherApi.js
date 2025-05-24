const API_URL = 'https://api.open-meteo.com/v1/forecast';
const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Custom error class for API-related errors
 */
export class WeatherApiError extends Error {
  constructor(message, statusCode = null, errorType = 'general') {
    super(message);
    this.name = 'WeatherApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
  }
}

/**
 * Validates city name input
 * @param {string} city - The city name to validate
 * @throws {Error} If city name is invalid
 */
const validateCityInput = (city) => {
  if (!city) {
    throw new Error('City name is required');
  }

  if (typeof city !== 'string') {
    throw new Error('City name must be a string');
  }

  const trimmedCity = city.trim();

  if (trimmedCity.length === 0) {
    throw new Error('City name cannot be empty');
  }

  // Check for valid characters (letters, spaces, hyphens, and some special characters used in city names)
  const validCityRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!validCityRegex.test(trimmedCity)) {
    throw new Error('City name contains invalid characters');
  }

  return trimmedCity;
};

/**
 * Handles API response errors
 * @param {Response} response - The fetch API response object
 * @param {string} serviceName - Name of the service for error messages
 * @throws {WeatherApiError} If response is not ok
 */
const handleApiResponse = async (response, serviceName) => {
  if (!response) {
    throw new WeatherApiError(`No response from ${serviceName}`, null, 'network');
  }

  if (!response.ok) {
    let errorMessage = `${serviceName} request failed`;
    let errorData = null;

    try {
      // Try to get more detailed error from the response
      errorData = await response.json();
      if (errorData && errorData.reason) {
        errorMessage = `${serviceName} error: ${errorData.reason}`;
      }
    } catch (e) {
      // If parsing JSON fails, use status text
      errorMessage = `${serviceName} error: ${response.statusText || 'Unknown error'}`;
    }

    throw new WeatherApiError(errorMessage, response.status, 'api');
  }

  return await response.json();
};

/**
 * Fetches weather data for a given city
 * @param {string} city - The city name to get weather for
 * @returns {Promise} Promise resolving to weather data
 * @throws {WeatherApiError} For various error conditions
 */
export const fetchWeatherData = async (city) => {
  try {
    // Validate city input before making API request
    const validatedCity = validateCityInput(city);

    // Handle network errors
    let geoResponse;
    try {
      geoResponse = await fetch(`${GEO_API_URL}?name=${encodeURIComponent(validatedCity)}&count=1`);
    } catch (error) {
      throw new WeatherApiError(
        'Failed to connect to geocoding service. Please check your internet connection.',
        null,
        'network'
      );
    }

    // Process geocoding response
    const geoData = await handleApiResponse(geoResponse, 'Geocoding');

    if (!geoData.results || geoData.results.length === 0) {
      throw new WeatherApiError(
        `City "${validatedCity}" not found. Please check spelling and try again.`,
        404,
        'notFound'
      );
    }

    const { latitude, longitude } = geoData.results[0];

    // Handle network errors for weather API
    let weatherResponse;
    try {
      weatherResponse = await fetch(
        `${API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
      );
    } catch (error) {
      throw new WeatherApiError(
        'Failed to connect to weather service. Please check your internet connection.',
        null,
        'network'
      );
    }

    // Process weather API response
    const weatherData = await handleApiResponse(weatherResponse, 'Weather');

    // Validate weather data structure
    if (!weatherData.current || weatherData.current.temperature_2m === undefined) {
      throw new WeatherApiError(
        'Received invalid weather data format from the API',
        null,
        'dataFormat'
      );
    }

    return weatherData;
  } catch (error) {
    // Re-throw WeatherApiError instances, but wrap other errors
    if (error instanceof WeatherApiError) {
      throw error;
    } else {
      console.error('Unexpected error in weather API:', error);
      throw new WeatherApiError(
        'An unexpected error occurred while fetching weather data',
        null,
        'unexpected'
      );
    }
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