import { Coordinates, LocationData, Alert, RiskScore, WeatherData, ElevationData, SeismicData } from './types';
import { weatherApiService } from './weatherApi';

// Mock seismic data service
const getMockSeismicData = (): SeismicData[] => {
  return [
    {
      magnitude: 4.2,
      location: 'Northern India',
      depth: 15,
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      coordinates: { lat: 28.7041, lng: 77.1025 }
    },
    {
      magnitude: 3.8,
      location: 'Himachal Pradesh',
      depth: 22,
      time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      coordinates: { lat: 31.1048, lng: 77.1734 }
    },
    {
      magnitude: 3.1,
      location: 'Uttarakhand',
      depth: 8,
      time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      coordinates: { lat: 30.0668, lng: 79.0193 }
    }
  ];
};

// Mock elevation data service
const getMockElevationData = (coordinates: Coordinates): ElevationData => {
  // Simulate elevation based on coordinates (rough approximation for India)
  let elevation = 200; // Default elevation
  
  // Higher elevation for northern regions (Himalayas)
  if (coordinates.lat > 30) {
    elevation = Math.random() * 2000 + 1000;
  }
  // Medium elevation for central regions
  else if (coordinates.lat > 20) {
    elevation = Math.random() * 800 + 200;
  }
  // Lower elevation for southern regions
  else {
    elevation = Math.random() * 400 + 100;
  }

  return {
    elevation: Math.round(elevation),
    source: 'SRTM',
    accuracy: 'high'
  };
};

// Calculate risk scores based on weather and location data
const calculateRiskScores = (weather: WeatherData, elevation: ElevationData, coordinates: Coordinates): RiskScore => {
  // Base risk calculations
  let floodRisk = 0;
  let heavyRainRisk = 0;
  let landslideRisk = 0;
  let tsunamiRisk = 0;
  let earthquakeRisk = 0;

  // Flood risk based on humidity and elevation
  floodRisk = Math.min(100, weather.humidity * 0.8 + (elevation.elevation < 100 ? 30 : 0));
  
  // Heavy rain risk based on humidity and cloud cover
  heavyRainRisk = Math.min(100, (weather.humidity * 0.6) + (weather.cloudCover * 0.4));
  
  // Landslide risk based on elevation and weather
  if (elevation.elevation > 500) {
    landslideRisk = Math.min(100, (elevation.elevation / 50) + (weather.humidity * 0.3));
  } else {
    landslideRisk = Math.min(30, weather.humidity * 0.2);
  }
  
  // Tsunami risk (higher for coastal areas - approximated by low elevation near water)
  if (elevation.elevation < 50 && (coordinates.lat < 15 || coordinates.lng > 75)) {
    tsunamiRisk = Math.random() * 40 + 10;
  } else {
    tsunamiRisk = Math.random() * 15;
  }
  
  // Earthquake risk (higher in seismically active regions like Himalayas)
  if (coordinates.lat > 28) {
    earthquakeRisk = Math.random() * 60 + 20;
  } else {
    earthquakeRisk = Math.random() * 30 + 10;
  }

  // Calculate overall risk as weighted average
  const overall = Math.round(
    (floodRisk * 0.25) + 
    (heavyRainRisk * 0.2) + 
    (landslideRisk * 0.2) + 
    (tsunamiRisk * 0.15) + 
    (earthquakeRisk * 0.2)
  );

  return {
    overall: Math.min(100, overall),
    flood: Math.round(floodRisk),
    rain: Math.round(heavyRainRisk), // Added 'rain' property, using heavyRainRisk as a placeholder
    heavyRain: Math.round(heavyRainRisk),
    landslide: Math.round(landslideRisk),
    tsunami: Math.round(tsunamiRisk),
    earthquake: Math.round(earthquakeRisk)
  };
};

// Generate mock alerts based on risk scores
const generateAlerts = (riskScore: RiskScore, coordinates: Coordinates): Alert[] => {
  const alerts: Alert[] = [];
  
  if (riskScore.flood > 70) {
    alerts.push({
      id: `flood-${Date.now()}`,
      title: 'High Flood Risk Alert',
      message: `Flood risk is currently ${riskScore.flood}%. Monitor water levels and prepare for potential evacuation.`,
      severity: riskScore.flood > 85 ? 'critical' : 'high',
      timestamp: new Date().toISOString(),
      isActive: true,
      acknowledged: false,
      coordinates,
      location: `Lat: ${coordinates.lat.toFixed(4)}, Lng: ${coordinates.lng.toFixed(4)}`
    });
  }

  if (riskScore.landslide > 60 && coordinates.lat > 25) {
    alerts.push({
      id: `landslide-${Date.now()}`,
      title: 'Landslide Risk Warning',
      message: `Landslide risk is elevated at ${riskScore.landslide}% due to weather conditions and terrain.`,
      severity: riskScore.landslide > 80 ? 'critical' : 'medium',
      timestamp: new Date().toISOString(),
      isActive: true,
      acknowledged: false,
      coordinates,
      location: `Lat: ${coordinates.lat.toFixed(4)}, Lng: ${coordinates.lng.toFixed(4)}`
    });
  }

  if (riskScore.earthquake > 50) {
    alerts.push({
      id: `earthquake-${Date.now()}`,
      title: 'Seismic Activity Alert',
      message: `Earthquake risk is ${riskScore.earthquake}%. Recent seismic activity detected in the region.`,
      severity: riskScore.earthquake > 75 ? 'high' : 'medium',
      timestamp: new Date().toISOString(),
      isActive: true,
      acknowledged: false,
      coordinates,
      location: `Lat: ${coordinates.lat.toFixed(4)}, Lng: ${coordinates.lng.toFixed(4)}`
    });
  }

  return alerts;
};

class ApiService {
  async fetchLocationData(coordinates: Coordinates): Promise<LocationData> {
    try {
      // Fetch real weather data
      const weather = await weatherApiService.getCurrentWeather(coordinates.lat, coordinates.lng);
      
      // Get mock elevation and seismic data
      const elevation = getMockElevationData(coordinates);
      const seismic = getMockSeismicData();
      
      // Calculate risk scores based on real weather data
      const riskScore = calculateRiskScores(weather, elevation, coordinates);
      
      // Generate alerts based on risk scores
      const alerts = generateAlerts(riskScore, coordinates);

      return {
        coordinates,
        weather,
        elevation,
        seismic,
        riskScore,
        alerts,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch location data:', error);
      
      // Return fallback mock data
      return this.getMockLocationData(coordinates);
    }
  }

  private getMockLocationData(coordinates: Coordinates): LocationData {
    const mockWeather: WeatherData = {
      temperature: 28,
      humidity: 65,
      windSpeed: 12,
      pressure: 1013,
      visibility: 10,
      condition: 'Partly Cloudy'
    };

    const mockElevation = getMockElevationData(coordinates);
    const mockSeismic = getMockSeismicData();
    const mockRiskScore = calculateRiskScores(mockWeather, mockElevation, coordinates);
    const mockAlerts = generateAlerts(mockRiskScore, coordinates);

    return {
      coordinates,
      weather: mockWeather,
      elevation: mockElevation,
      seismic: mockSeismic,
      riskScore: mockRiskScore,
      alerts: mockAlerts,
      lastUpdated: new Date().toISOString()
    };
  }

  async getLocationName(coordinates: Coordinates): Promise<string> {
    try {
      return await weatherApiService.getLocationName(coordinates.lat, coordinates.lng);
    } catch (error) {
      console.error('Failed to get location name:', error);
      return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
    }
  }
}

export const apiService = new ApiService();