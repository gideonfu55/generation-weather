/**
 * Capitalizes the first letter of each word in a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Formats temperature for display
 * @param {number} temp - Temperature value
 * @param {string} unit - Temperature unit
 * @returns {string} Formatted temperature string
 */
export const formatTemperature = (temp, unit = '°C') => {
  if (temp === undefined || temp === null) return 'N/A';
  return `${Math.round(temp)}${unit}`;
};