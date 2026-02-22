import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { weatherService, DailyForecast } from '@/services/weatherService';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, HelpCircle } from 'lucide-react';

function getWeatherIcon(code: number) {
  switch (code) {
    case 0: return <Sun className="h-8 w-8 text-yellow-500" />;
    case 1: case 2: case 3: return <Cloud className="h-8 w-8 text-gray-500" />;
    case 61: case 63: case 65: return <CloudRain className="h-8 w-8 text-blue-500" />;
    case 71: case 73: case 75: return <CloudSnow className="h-8 w-8 text-blue-200" />;
    case 95: case 96: case 99: return <CloudLightning className="h-8 w-8 text-yellow-400" />;
    default: return <HelpCircle className="h-8 w-8 text-gray-400" />;
  }
}

export default function WeatherForecast() {
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (loading) {
        setError('Could not get location in time. Please check browser permissions and try again.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId);
        try {
          const { latitude, longitude } = position.coords;
          const data = await weatherService.get7DayForecast(latitude, longitude);
          setForecast(data.daily);
        } catch (err) {
          setError('Could not fetch weather data.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        clearTimeout(timeoutId);
        setError('Unable to retrieve your location. Please allow location access in your browser settings.');
        setLoading(false);
      }
    );
  }, []);

  const renderForecast = () => {
    if (loading) {
      return <p>Loading forecast...</p>;
    }

    if (error) {
      return <p className="text-red-500">{error}</p>;
    }

    if (!forecast) {
      return <p>No forecast data available.</p>;
    }

    return (
      <div className="space-y-4">
        {forecast.time.map((day, index) => (
          <div key={day} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-4">
              {getWeatherIcon(forecast.weathercode[index])}
              <p className="font-medium">{new Date(day).toLocaleDateString('en-US', { weekday: 'long' })}</p>
            </div>
            <p className="font-mono text-sm">
              {Math.round(forecast.temperature_2m_max[index])}° / {Math.round(forecast.temperature_2m_min[index])}°
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Weather Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        {renderForecast()}
      </CardContent>
    </Card>
  );
}
