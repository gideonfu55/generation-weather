const API_URL = 'https://api.open-meteo.com/v1/forecast';
const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const weatherCache = new Map();

// For rate limiting protection
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second minimum between requests

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
 * Fetches weather data for a given city
 * @param {string} city - The city name to get weather for
 * @returns {Promise} Promise resolving to weather data
 * @throws {WeatherApiError} For various error conditions
 */
export const fetchWeatherData = async (city) => {
  try {
    // Validate city input before making API request
    const validatedCity = validateCityInput(city);

    // Check cache first
    const cachedData = getCachedWeatherData(validatedCity);
    if (cachedData) {
      console.log('Using cached weather data for:', validatedCity);
      // Return directly as the cached data should already be formatted
      return cachedData;
    }

    // Rate limiting protection
    await enforceRateLimit();

    // Handle network errors
    let geoResponse;
    try {
      geoResponse = await fetchWithTimeout(`${GEO_API_URL}?name=${encodeURIComponent(validatedCity)}&count=1`);
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
      weatherResponse = await fetchWithTimeout(
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

    // Log the entire response
    console.log('Full weather API response:', JSON.stringify(weatherData, null, 2));

    // Validate weather data structure
    if (!weatherData || !weatherData.current) {
      throw new WeatherApiError(
        'Received invalid weather data format from the API',
        null,
        'dataFormat'
      );
    }

    // Format the data for UI consumption using our safe formatWeatherData 
    const formattedData = formatWeatherData(weatherData, validatedCity);

    // Cache the formatted data
    cacheWeatherData(validatedCity, formattedData);

    // Return the formatted data
    return formattedData;
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
 * Validates city name input
 * @param {string} city - The city name to validate
 * @throws {WeatherApiError} If city name is invalid
 * @returns {string} The validated and trimmed city name
 */
const validateCityInput = (city) => {
  try {
    if (!city) {
      throw new WeatherApiError('City name is required', null, 'validation');
    }

    if (typeof city !== 'string') {
      // Convert to string if possible
      city = String(city);
    }

    const trimmedCity = city.trim();

    if (trimmedCity.length === 0) {
      throw new WeatherApiError('City name cannot be empty', null, 'validation');
    }

    // Slightly more permissive regex
    const validCityRegex = /^[a-zA-Z0-9\s\-'.]+$/;
    if (!validCityRegex.test(trimmedCity)) {
      throw new WeatherApiError('City name contains invalid characters', null, 'validation');
    }

    return trimmedCity;
  } catch (error) {
    if (error instanceof WeatherApiError) {
      throw error;
    }
    throw new WeatherApiError('Failed to validate city name: ' + error.message, null, 'validation');
  }
};

/**
 * Checks if cached weather data is available and fresh
 * @param {string} cityName - The city name to check in cache
 * @returns {Object|null} Cached weather data or null if not available
 */
const getCachedWeatherData = (cityName) => {
  if (!cityName) return null;

  const normalizedCity = cityName.trim().toLowerCase();
  const cachedData = weatherCache.get(normalizedCity);

  if (!cachedData) return null;

  const now = new Date().getTime();
  if (now - cachedData.timestamp > CACHE_DURATION) {
    // Cache expired
    weatherCache.delete(normalizedCity);
    return null;
  }

  return cachedData.data;
};

/**
 * Ensures requests aren't sent too frequently and based on the minimum request interval
 * @returns {Promise<void>} Resolves when it's safe to make a new request
 */
const enforceRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    // Wait until the minimum interval has passed
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
};

/**
 * Creates a fetch request with timeout
 * @param {string} url - The URL to fetch
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} - Fetch response
 */
const fetchWithTimeout = async (url, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new WeatherApiError('Request timed out. Please try again later.', null, 'timeout');
    }
    throw error;
  }
};

/**
 * Handles API response errors
 * @param {Response} response - The fetch API response object
 * @param {string} serviceName - Name of the service for error messages
 * @throws {WeatherApiError} If response is not ok
 * @returns {Promise<Object>} The parsed JSON response
 */
const handleApiResponse = async (response, serviceName) => {
  // Validate parameters
  if (!serviceName || typeof serviceName !== 'string') {
    serviceName = 'API';
  }

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

  try {
    return await response.json();
  } catch (error) {
    throw new WeatherApiError(`Invalid JSON response from ${serviceName}`, null, 'dataFormat');
  }
};

/**
 * Transforms raw weather data into a more usable format for the UI
 * @param {Object} weatherData - Raw weather data from API
 * @param {string} cityName - The city name used for the search
 * @returns {Object} Formatted weather data ready for display
 */
export const formatWeatherData = (weatherData, cityName) => {
  // Defensive check for null/undefined weatherData
  if (!weatherData) {
    console.error('formatWeatherData called with null/undefined weatherData');
    return createDefaultWeatherData(cityName);
  }

  // More specific check for weatherData.current
  if (!weatherData.current) {
    console.error('formatWeatherData called with missing weatherData.current');
    return createDefaultWeatherData(cityName);
  }

  // Now that we've confirmed weatherData and weatherData.current exist, we can safely access their properties using optional chaining for extra safety
  return {
    city: cityName || 'Unknown',
    temperature: weatherData?.current?.temperature_2m ?? null,
    temperatureUnit: weatherData?.current_units?.temperature_2m || '°C',
    description: getWeatherDescription(weatherData?.current?.weather_code),
    weatherCode: weatherData?.current?.weather_code ?? null,
    windSpeed: weatherData?.current?.wind_speed_10m ?? null,
    windSpeedUnit: weatherData?.current_units?.wind_speed_10m || 'km/h',
    timestamp: new Date().toISOString()
  };
};

/**
 * Creates a default weather data object for fallback scenarios
 * @param {string} cityName - The city name to use in the default data
 * @returns {Object} Default weather data object
 */
const createDefaultWeatherData = (cityName) => {
  return {
    city: cityName || 'Unknown',
    temperature: null,
    temperatureUnit: '°C',
    description: 'Weather information unavailable',
    weatherCode: null,
    windSpeed: null,
    windSpeedUnit: 'km/h',
    timestamp: new Date().toISOString()
  };
};

/**
 * Maps weather codes to descriptions
 * @param {number} code - The weather code from the API
 * @returns {string} A human-readable weather description
 */
export const getWeatherDescription = (code) => {
  if (code === undefined || code === null) {
    return 'Weather information unavailable';
  }

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

  return weatherCodes[code] || `Unknown weather condition (code: ${code})`;
};

/**
 * Saves weather data to cache
 * @param {string} cityName - The city name as cache key
 * @param {Object} data - The weather data to cache
 */
const cacheWeatherData = (cityName, data) => {
  if (!cityName || !data) return;

  const normalizedCity = cityName.trim().toLowerCase();
  weatherCache.set(normalizedCity, {
    data,
    timestamp: new Date().getTime()
  });
};