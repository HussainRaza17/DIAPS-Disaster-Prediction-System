import { useState, useEffect, useCallback, useMemo } from 'react';
import { LeafletMap } from '@/components/LeafletMap';
import { RiskCards } from '@/components/RiskCards';
import { AlertSystem } from '@/components/AlertSystem';
import { RiskCharts } from '@/components/RiskCharts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Thermometer, Eye, Wind, Activity, TrendingUp, Droplets, CloudRain } from 'lucide-react';
import { Coordinates, LocationData, Alert } from '@/lib/types';
import { apiService } from '@/lib/api';

export default function Dashboard() {
  // New Delhi coordinates as default
  const NEW_DELHI = useMemo(() => ({ lat: 28.6139, lng: 77.2090 }), []);
  
  const [selectedLocation, setSelectedLocation] = useState<Coordinates>(NEW_DELHI);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch location data when location changes
  const fetchLocationData = useCallback(async (coordinates: Coordinates) => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchLocationData(coordinates);
      setLocationData(data);
      setAlerts(data.alerts);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch location data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle location selection
  const handleLocationSelect = useCallback((coordinates: Coordinates) => {
    setSelectedLocation(coordinates);
    fetchLocationData(coordinates);
  }, [fetchLocationData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!selectedLocation) return;

    const interval = setInterval(() => {
      fetchLocationData(selectedLocation);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedLocation, fetchLocationData]);

  // Initialize with New Delhi on component mount
  useEffect(() => {
    fetchLocationData(NEW_DELHI);
  }, [fetchLocationData, NEW_DELHI]);

  // Alert handlers
  const handleAlertAcknowledge = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const handleAlertDismiss = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isActive: false } : alert
    ));
  }, []);

  const handleAlertClick = useCallback((alert: Alert) => {
    if (alert.coordinates) {
      setSelectedLocation(alert.coordinates);
      fetchLocationData(alert.coordinates);
    }
  }, [fetchLocationData]);

  // Get location name for display
  const getLocationName = (coords: Coordinates): string => {
    if (Math.abs(coords.lat - NEW_DELHI.lat) < 0.1 && Math.abs(coords.lng - NEW_DELHI.lng) < 0.1) {
      return 'New Delhi, India';
    }
    return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
  };

  return (
    <main className="container mx-auto px-6 py-6 space-y-6">
      {/* Enhanced Status Bar with Rain Data */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                <span className="text-white text-sm font-medium">System Online</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {getLocationName(selectedLocation)}
                </span>
              </div>
              {lastUpdated && (
                <div className="flex items-center space-x-2 text-white/60">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Last updated: {lastUpdated}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-white/60">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Real-time Monitoring</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {locationData && (
                <>
                  <div className="flex items-center space-x-2 text-white/80">
                    <Thermometer className="h-4 w-4" />
                    <span className="text-sm font-medium">{locationData.weather.temperature}°C</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/80">
                    <Wind className="h-4 w-4" />
                    <span className="text-sm font-medium">{locationData.weather.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/80">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">{locationData.weather.visibility} km</span>
                  </div>
                  {/* Rain Data in Status Bar */}
                  {locationData.weather.precipitation !== undefined && locationData.weather.precipitation > 0 && (
                    <div className="flex items-center space-x-2 text-blue-300">
                      <Droplets className="h-4 w-4" />
                      <span className="text-sm font-medium">{locationData.weather.precipitation}mm</span>
                    </div>
                  )}
                  {locationData.weather.rainChance !== undefined && locationData.weather.rainChance > 0 && (
                    <div className="flex items-center space-x-2 text-blue-300">
                      <CloudRain className="h-4 w-4" />
                      <span className="text-sm font-medium">{locationData.weather.rainChance}%</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-white/80">
                    <TrendingUp className="h-4 w-4" />
                    <Badge 
                      variant={
                        locationData.riskScore.overall >= 80 ? "destructive" :
                        locationData.riskScore.overall >= 60 ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      Risk: {locationData.riskScore.overall}%
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column - Map and Charts */}
        <div className="xl:col-span-8 space-y-6">
          {/* Interactive Leaflet Map */}
          <div className="h-[500px]">
            <LeafletMap
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              locationData={locationData}
              isLoading={isLoading}
            />
          </div>

          {/* Risk Charts */}
          <RiskCharts
            riskScore={locationData?.riskScore || null}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column - Risk Cards and Details */}
        <div className="xl:col-span-4 space-y-6">
          {/* Risk Assessment Cards */}
          <RiskCards
            riskScore={locationData?.riskScore || null}
            isLoading={isLoading}
          />

          <Separator className="bg-white/20" />

          {/* Enhanced Weather Information with Rain Data */}
          {locationData && (
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Thermometer className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-semibold">Current Conditions</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="block text-white/60 text-xs uppercase tracking-wide">Temperature</span>
                    <span className="text-white font-bold text-lg">{locationData.weather.temperature}°C</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="block text-white/60 text-xs uppercase tracking-wide">Humidity</span>
                    <span className="text-white font-bold text-lg">{locationData.weather.humidity}%</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="block text-white/60 text-xs uppercase tracking-wide">Wind Speed</span>
                    <span className="text-white font-bold text-lg">{locationData.weather.windSpeed} km/h</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="block text-white/60 text-xs uppercase tracking-wide">Pressure</span>
                    <span className="text-white font-bold text-lg">{locationData.weather.pressure} hPa</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="block text-white/60 text-xs uppercase tracking-wide">Visibility</span>
                    <span className="text-white font-bold text-lg">{locationData.weather.visibility} km</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="block text-white/60 text-xs uppercase tracking-wide">Elevation</span>
                    <span className="text-white font-bold text-lg">{locationData.elevation.elevation} m</span>
                  </div>
                  {/* Rain Data Display */}
                  {locationData.weather.precipitation !== undefined && (
                    <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                      <span className="block text-blue-200 text-xs uppercase tracking-wide">Precipitation</span>
                      <span className="text-blue-100 font-bold text-lg">{locationData.weather.precipitation} mm</span>
                    </div>
                  )}
                  {locationData.weather.rainChance !== undefined && (
                    <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                      <span className="block text-blue-200 text-xs uppercase tracking-wide">Rain Chance</span>
                      <span className="text-blue-100 font-bold text-lg">{locationData.weather.rainChance}%</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-white/10 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Weather Condition</span>
                    <Badge variant="outline" className="text-white border-white/30 bg-white/5">
                      {locationData.weather.condition}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Seismic Activity */}
          {locationData && locationData.seismic.length > 0 && (
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-semibold">Recent Seismic Activity</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-200">
                    {locationData.seismic.length} Events
                  </Badge>
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {locationData.seismic.slice(0, 4).map((earthquake, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-white/80">
                          <div className="font-bold text-white">M{earthquake.magnitude}</div>
                          <div className="text-xs text-white/60">{earthquake.location}</div>
                        </div>
                        <div className="text-right text-white/60">
                          <div className="text-xs font-medium">{earthquake.depth}km deep</div>
                          <div className="text-xs">
                            {new Date(earthquake.time).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alert System */}
          <AlertSystem
            alerts={alerts}
            onAlertAcknowledge={handleAlertAcknowledge}
            onAlertDismiss={handleAlertDismiss}
          />
        </div>
      </div>
    </main>
  );
}