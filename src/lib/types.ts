export interface Coordinates {
  lat: number;
  lng: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  condition: string;
  icon?: string;
  feelsLike?: number;
  uvIndex?: number;
  cloudCover?: number;
  precipitation?: number; // Added rain data
  rainChance?: number; // Added rain chance
}

export interface ElevationData {
  elevation: number;
  source: string;
  accuracy: string;
}

export interface SeismicData {
  magnitude: number;
  location: string;
  depth: number;
  time: string;
  coordinates: Coordinates;
}

export interface RiskScore {
  overall: number;
  flood: number;
  rain: number;
  heavyRain: number;
  landslide: number;
  tsunami: number;
  earthquake: number;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  isActive: boolean;
  acknowledged: boolean;
  coordinates: Coordinates;
  location: string;
}

export interface LocationData {
  coordinates: Coordinates;
  weather: WeatherData;
  elevation: ElevationData;
  seismic: SeismicData[];
  riskScore: RiskScore;
  alerts: Alert[];
  lastUpdated: string;
}