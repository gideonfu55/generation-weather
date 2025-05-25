import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar Component', () => {
  test('renders correctly', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);

    // Check if input field exists
    expect(screen.getByPlaceholderText(/Enter city name/i)).toBeInTheDocument();

    // Check if search button exists
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled(); // Should be disabled initially (empty input)
  });

  test('handles user input correctly', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);

    const input = screen.getByPlaceholderText(/Enter city name/i);
    fireEvent.change(input, { target: { value: 'London' } });

    expect(input.value).toBe('London');
    expect(screen.getByRole('button')).not.toBeDisabled(); // Button should enable
  });

  test('calls onSearch with the input value when submitted', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);

    const input = screen.getByPlaceholderText(/Enter city name/i);
    fireEvent.change(input, { target: { value: 'London' } });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('London');
  });

  test('disables form elements during loading state', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);

    const input = screen.getByPlaceholderText(/Enter city name/i);
    const button = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button.textContent).toMatch(/searching/i);
  });

  test('prevents submission with only whitespace', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={false} />);

    const input = screen.getByPlaceholderText(/Enter city name/i);
    fireEvent.change(input, { target: { value: '   ' } });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    // Try submitting the form directly
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});