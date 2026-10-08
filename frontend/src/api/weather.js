// Weather API service using Open-Meteo (Free, No API Key Required)

const WMO_WEATHER_CODES = {
  0: { label: 'Clear Sky', icon: 'Sun' },
  1: { label: 'Mainly Clear', icon: 'CloudSun' },
  2: { label: 'Partly Cloudy', icon: 'CloudSun' },
  3: { label: 'Overcast', icon: 'Cloud' },
  45: { label: 'Foggy', icon: 'CloudFog' },
  48: { label: 'Depositing Rime Fog', icon: 'CloudFog' },
  51: { label: 'Light Drizzle', icon: 'CloudDrizzle' },
  53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle' },
  55: { label: 'Dense Drizzle', icon: 'CloudDrizzle' },
  61: { label: 'Slight Rain', icon: 'CloudRain' },
  63: { label: 'Moderate Rain', icon: 'CloudRain' },
  65: { label: 'Heavy Rain', icon: 'CloudRain' },
  71: { label: 'Slight Snow', icon: 'Snowflake' },
  73: { label: 'Moderate Snow', icon: 'Snowflake' },
  75: { label: 'Heavy Snow', icon: 'Snowflake' },
  80: { label: 'Slight Rain Showers', icon: 'CloudRain' },
  81: { label: 'Moderate Rain Showers', icon: 'CloudRain' },
  82: { label: 'Violent Rain Showers', icon: 'CloudRain' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning' },
  96: { label: 'Thunderstorm with Hail', icon: 'CloudLightning' },
  99: { label: 'Heavy Thunderstorm', icon: 'CloudLightning' }
};

export const getWeatherCondition = (code) => {
  return WMO_WEATHER_CODES[code] || { label: 'Weather Data', icon: 'Cloud' };
};

export const getWeatherForDestination = async (destination) => {
  if (!destination || !destination.trim()) {
    throw new Error('Destination name is required.');
  }

  const cleanDest = destination.trim();
  let searchCity = cleanDest;
  let targetCountry = '';

  if (cleanDest.includes(',')) {
    const parts = cleanDest.split(',');
    searchCity = parts[0].trim();
    targetCountry = parts.slice(1).join(',').trim();
  }

  // 1. Geocoding API: Convert city name into Lat/Lon coordinates
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=10&language=en&format=json`;
  const geoResponse = await fetch(geoUrl);
  
  if (!geoResponse.ok) {
    throw new Error('Failed to search location coordinates.');
  }

  const geoData = await geoResponse.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`Location "${destination}" not found.`);
  }

  const results = geoData.results;
  let location = null;

  if (targetCountry) {
    const targetCountryLower = targetCountry.toLowerCase();
    location = results.find((res) => {
      const cName = (res.country || '').toLowerCase();
      const cCode = (res.country_code || '').toLowerCase();
      const admin1 = (res.admin1 || '').toLowerCase();
      return (
        cName.includes(targetCountryLower) ||
        targetCountryLower.includes(cName) ||
        cCode === targetCountryLower ||
        admin1.includes(targetCountryLower)
      );
    });
  } else {
    // Legacy single-string destination without country comma
    const exactNameMatch = results.find((res) => res.name.toLowerCase() === searchCity.toLowerCase());
    if (exactNameMatch) {
      location = exactNameMatch;
    } else {
      throw new Error(`Ambiguous location. Please edit trip to specify country (e.g. "${searchCity}, India").`);
    }
  }

  if (!location) {
    throw new Error(`Location "${destination}" not found. Please check city and country.`);
  }

  const { latitude, longitude, name, country } = location;

  // 2. Weather Forecast API
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok) {
    throw new Error('Failed to fetch weather data.');
  }

  const weatherData = await weatherResponse.json();

  const current = weatherData.current || {};
  const daily = weatherData.daily || {};

  // Build 3-day forecast list
  const forecast = [];
  if (daily.time && daily.time.length > 0) {
    const count = Math.min(daily.time.length, 3);
    for (let i = 0; i < count; i++) {
      forecast.push({
        date: daily.time[i],
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i]),
        code: daily.weather_code[i],
        condition: getWeatherCondition(daily.weather_code[i])
      });
    }
  }

  return {
    locationName: country ? `${name}, ${country}` : name,
    temperature: Math.round(current.temperature_2m),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    weatherCode: current.weather_code,
    condition: getWeatherCondition(current.weather_code),
    forecast
  };
};
