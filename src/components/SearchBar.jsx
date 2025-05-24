import React, { useState } from 'react';

const SearchBar = ({ onSearch, isLoading }) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(city);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name..."
        disabled={isLoading}
        className="search-input"
      />
      <button
        type="submit"
        disabled={isLoading || !city.trim()}
        className="search-button"
      >
        {isLoading ? 'Searching...' : 'Get Weather'}
      </button>
    </form>
  );
};

export default SearchBar;