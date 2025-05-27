# 🌤️ Weather App (using Open-Meteo API)

## Project Overview
This Weather App allows users to check the current weather for one city or multiple cities. It uses the Open-Meteo Geocoding API to find location coordinates and then fetches weather data using the Open-Meteo Weather Forecast API.

## App Features
- Navigation bar to select between getting weather data for one city, or for comparing multiple cities
- Search bar to enter a city name or multiple cities
- Display of temperature, wind speed, and weather description
- Error message if city is not found
  
## How to Navigate & Install and Run the Code
1. Clone this repository:
   ```bash
   git clone https://github.com/gideonfu55/generation-weather.git <directory>
   ```
   Replace 'directory' with your desired directory name or file path. If the directory does not exist, Git will create it for you.
   
2. Navigate to the project folder:
   ```bash
   cd <your directory>
   ```
3. Use VS Code to open the project from its directory. Then, open the terminal and enter 'npm install'.
   Alternatively, you can right click your project directory and click 'Open in Terminal'. This will open the command prompt with the project path and you can enter 'npm install' from here.
4. After the project dependencies and libraries are installed, enter 'npm start' from the terminal.
   Likewise, with the alternate method in 3, enter 'npm start' in the command prompt from the project directory path.

## Project Files
- `src/assets`: Where CSS file for index.html is located.
- `src/components`: Where all the App class and all other React components (e.g. Search Bar, Header, Weather Card, Weather Details, City Comparison) for the features are located.
- `src/hooks`: Where the React Hooks for the two main features are located.
- `src/services`: Where the Weather Featch API itself is located (as a service class).
- `src/utils`: Where the weather data formatter is located.
  
## What I Learned
- How to do response error handling more efficiently in code.
- Proper input validation and error handling.
- Caching data to ensure that fetching of data is not overly done.

## Challenges
Debugging for a React hook rendering issue was tricky, but by having proper logging of response data at different points, I was able to use the AI to pinpoint where the problem was occurring and remedy it.

## Future Improvements
- Add weather icons and animation, improve design with CSS.
- Feature to display other weather conditions selectively.
