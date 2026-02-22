export interface DailyForecast {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export interface WeatherData {
  daily: DailyForecast;
}

async function get7DayForecast(latitude: number, longitude: number): Promise<WeatherData> {
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data.');
  }
  
  const data = await response.json();
  return data as WeatherData;
}

export const weatherService = {
  get7DayForecast,
};
