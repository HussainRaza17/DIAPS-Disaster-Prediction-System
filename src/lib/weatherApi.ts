const WEATHER_API_KEY = 'b1fab2921c2a4edaa6f80559232412';
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  condition: string;
  icon: string;
  feelsLike: number;
  uvIndex: number;
  cloudCover: number;
  precipitation: number; // Added rain data
  rainChance: number; // Added rain chance
}

export interface WeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
  chanceOfRain: number;
  precipitation: number;
}

export interface WeatherApiResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        maxwind_kph: number;
        totalprecip_mm: number;
        avghumidity: number;
        daily_chance_of_rain: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        uv: number;
      };
    }>;
  };
}

class WeatherApiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = WEATHER_API_KEY;
    this.baseUrl = WEATHER_API_BASE_URL;
  }

  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.baseUrl}/current.json?key=${this.apiKey}&q=${lat},${lng}&aqi=yes`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherApiResponse = await response.json();
      
      return this.transformWeatherData(data);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      // Return mock data as fallback
      return this.getMockWeatherData();
    }
  }

  async getWeatherForecast(lat: number, lng: number, days: number = 3): Promise<WeatherForecast[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${lat},${lng}&days=${days}&aqi=no&alerts=no`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherApiResponse = await response.json();
      
      return this.transformForecastData(data);
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      // Return mock data as fallback
      return this.getMockForecastData();
    }
  }

  private transformWeatherData(data: WeatherApiResponse): WeatherData {
    const { current } = data;
    
    return {
      temperature: Math.round(current.temp_c),
      humidity: current.humidity,
      windSpeed: Math.round(current.wind_kph),
      pressure: Math.round(current.pressure_mb),
      visibility: Math.round(current.vis_km),
      condition: current.condition.text,
      icon: current.condition.icon,
      feelsLike: Math.round(current.feelslike_c),
      uvIndex: current.uv,
      cloudCover: current.cloud,
      precipitation: Math.round(current.precip_mm * 10) / 10, // Fixed rain data parsing
      rainChance: this.calculateRainChance(current) // Calculate rain chance based on conditions
    };
  }

  private calculateRainChance(current: WeatherApiResponse['current']): number {
    // Calculate rain chance based on humidity, cloud cover, and precipitation
    const humidity = current.humidity;
    const cloudCover = current.cloud;
    const precipitation = current.precip_mm;
    
    if (precipitation > 0) return 90; // If it's already raining
    if (humidity > 80 && cloudCover > 70) return 75;
    if (humidity > 70 && cloudCover > 60) return 60;
    if (humidity > 60 && cloudCover > 50) return 45;
    if (humidity > 50 && cloudCover > 40) return 30;
    return Math.max(0, Math.round((humidity + cloudCover) / 4));
  }

  private transformForecastData(data: WeatherApiResponse): WeatherForecast[] {
    if (!data.forecast?.forecastday) {
      return this.getMockForecastData();
    }

    return data.forecast.forecastday.map(day => ({
      date: day.date,
      maxTemp: Math.round(day.day.maxtemp_c),
      minTemp: Math.round(day.day.mintemp_c),
      condition: day.day.condition.text,
      icon: day.day.condition.icon,
      chanceOfRain: day.day.daily_chance_of_rain || 0,
      precipitation: Math.round(day.day.totalprecip_mm * 10) / 10
    }));
  }

  private getMockWeatherData(): WeatherData {
    return {
      temperature: 28,
      humidity: 65,
      windSpeed: 12,
      pressure: 1013,
      visibility: 10,
      condition: 'Partly Cloudy',
      icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      feelsLike: 32,
      uvIndex: 6,
      cloudCover: 40,
      precipitation: 0.2, // Mock rain data
      rainChance: 25 // Mock rain chance
    };
  }

  private getMockForecastData(): WeatherForecast[] {
    return [
      {
        date: new Date().toISOString().split('T')[0],
        maxTemp: 30,
        minTemp: 22,
        condition: 'Sunny',
        icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        chanceOfRain: 10,
        precipitation: 0.0
      },
      {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxTemp: 28,
        minTemp: 20,
        condition: 'Partly Cloudy',
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
        chanceOfRain: 20,
        precipitation: 0.1
      },
      {
        date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxTemp: 26,
        minTemp: 18,
        condition: 'Light Rain',
        icon: '//cdn.weatherapi.com/weather/64x64/day/296.png',
        chanceOfRain: 80,
        precipitation: 2.5
      }
    ];
  }

  async getLocationName(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/current.json?key=${this.apiKey}&q=${lat},${lng}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherApiResponse = await response.json();
      
      return `${data.location.name}, ${data.location.region}, ${data.location.country}`;
    } catch (error) {
      console.error('Failed to fetch location name:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}

export const weatherApiService = new WeatherApiService();