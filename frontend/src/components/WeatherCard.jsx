import React, { useState, useEffect } from 'react';
import { getWeatherForDestination } from '../api/weather';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Droplets,
  Wind,
  Thermometer,
  AlertCircle,
  RefreshCw,
  MapPin
} from 'lucide-react';

const WeatherCard = ({ destination }) => {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!destination || !destination.trim()) {
      setWeather(null);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await getWeatherForDestination(destination);
      setWeather(data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message || 'Unable to load weather information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [destination]);

  const renderWeatherIcon = (iconName, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={`${className} text-amber-500`} />;
      case 'CloudSun':
        return <CloudSun className={`${className} text-amber-400`} />;
      case 'Cloud':
        return <Cloud className={`${className} text-stone-400`} />;
      case 'CloudFog':
        return <CloudFog className={`${className} text-stone-400`} />;
      case 'CloudDrizzle':
        return <CloudDrizzle className={`${className} text-sky-400`} />;
      case 'CloudRain':
        return <CloudRain className={`${className} text-sky-500`} />;
      case 'Snowflake':
        return <Snowflake className={`${className} text-sky-300`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${className} text-purple-500`} />;
      default:
        return <CloudSun className={`${className} text-amber-500`} />;
    }
  };

  const formatDateLabel = (dateString, index) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Destination Weather</span>
        </h3>
        {weather && (
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span className="truncate max-w-[120px] sm:max-w-none">{weather.locationName}</span>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <RefreshCw className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
            Loading live weather for {destination}...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchWeather}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 text-[11px] font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : weather ? (
        <div className="space-y-5">
          {/* Main Weather Overview */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white dark:bg-stone-800 shadow-sm">
                {renderWeatherIcon(weather.condition.icon, 'w-8 h-8')}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-stone-900 dark:text-white">
                  {weather.temperature}°C
                </div>
                <div className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  {weather.condition.label}
                </div>
              </div>
            </div>

            {/* Sub-Metrics: Humidity & Wind */}
            <div className="flex flex-col gap-1.5 text-right text-xs font-semibold text-stone-600 dark:text-stone-400">
              <div className="flex items-center justify-end gap-1">
                <Droplets className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{weather.humidity}% Humidity</span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <Wind className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{weather.windSpeed} km/h Wind</span>
              </div>
            </div>
          </div>

          {/* 3-Day Forecast */}
          {weather.forecast && weather.forecast.length > 0 && (
            <div>
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 block mb-2 uppercase tracking-wider">
                3-Day Forecast
              </span>
              <div className="grid grid-cols-3 gap-2">
                {weather.forecast.map((item, idx) => (
                  <div
                    key={item.date || idx}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-center"
                  >
                    <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                      {formatDateLabel(item.date, idx)}
                    </span>
                    <div className="flex justify-center my-1">
                      {renderWeatherIcon(item.condition.icon, 'w-5 h-5')}
                    </div>
                    <span className="text-xs font-extrabold text-stone-900 dark:text-white block">
                      {item.maxTemp}° / {item.minTemp}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center text-xs font-medium text-stone-500 dark:text-stone-400">
          No destination specified.
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
