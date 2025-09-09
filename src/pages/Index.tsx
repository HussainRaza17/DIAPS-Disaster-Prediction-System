import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/Header';
import { LeafletMap } from '@/components/LeafletMap';
import { RiskCards } from '@/components/RiskCards';
import { AlertSystem } from '@/components/AlertSystem';
import { RiskCharts } from '@/components/RiskCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Thermometer, Eye, Wind } from 'lucide-react';
import { Coordinates, LocationData, Alert } from '@/lib/types';
import { apiService } from '@/lib/api';

export default function Index() {
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
      // Handle error state
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
    // Focus on alert location
    if (alert.coordinates) {
      setSelectedLocation(alert.coordinates);
      fetchLocationData(alert.coordinates);
    }
  }, [fetchLocationData]);

  // Get location name for display
  const getLocationName = (coords: Coordinates): string => {
    // Check if it's New Delhi (default)
    if (Math.abs(coords.lat - NEW_DELHI.lat) < 0.1 && Math.abs(coords.lng - NEW_DELHI.lng) < 0.1) {
      return 'New Delhi, India';
    }
    return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <Header alerts={alerts} onAlertClick={handleAlertClick} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Status Bar */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
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
              </div>
              <div className="flex items-center space-x-4">
                {locationData && (
                  <>
                    <div className="flex items-center space-x-2 text-white/80">
                      <Thermometer className="h-4 w-4" />
                      <span className="text-sm">{locationData.weather.temperature}°C</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/80">
                      <Wind className="h-4 w-4" />
                      <span className="text-sm">{locationData.weather.windSpeed} km/h</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/80">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">{locationData.weather.visibility} km</span>
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
            <div className="h-96">
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

          {/* Right Column - Risk Cards and Alerts */}
          <div className="xl:col-span-4 space-y-6">
            {/* Risk Assessment Cards */}
            <RiskCards
              riskScore={locationData?.riskScore || null}
              isLoading={isLoading}
            />

            <Separator className="bg-white/10" />

            {/* Weather Information */}
            {locationData && (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Thermometer className="h-5 w-5" />
                    <span>Current Conditions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-white/80">
                      <span className="block text-white/60">Temperature</span>
                      <span className="font-medium">{locationData.weather.temperature}°C</span>
                    </div>
                    <div className="text-white/80">
                      <span className="block text-white/60">Humidity</span>
                      <span className="font-medium">{locationData.weather.humidity}%</span>
                    </div>
                    <div className="text-white/80">
                      <span className="block text-white/60">Wind Speed</span>
                      <span className="font-medium">{locationData.weather.windSpeed} km/h</span>
                    </div>
                    <div className="text-white/80">
                      <span className="block text-white/60">Pressure</span>
                      <span className="font-medium">{locationData.weather.pressure} hPa</span>
                    </div>
                    <div className="text-white/80">
                      <span className="block text-white/60">Visibility</span>
                      <span className="font-medium">{locationData.weather.visibility} km</span>
                    </div>
                    <div className="text-white/80">
                      <span className="block text-white/60">Elevation</span>
                      <span className="font-medium">{locationData.elevation.elevation} m</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Condition</span>
                      <Badge variant="outline" className="text-white border-white/30">
                        {locationData.weather.condition}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seismic Activity */}
            {locationData && locationData.seismic.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Recent Seismic Activity</span>
                    <Badge variant="secondary" className="text-xs">
                      {locationData.seismic.length} Events
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-32 overflow-y-auto">
                    {locationData.seismic.slice(0, 3).map((earthquake, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="text-white/80">
                          <div className="font-medium">M{earthquake.magnitude}</div>
                          <div className="text-xs text-white/60">{earthquake.location}</div>
                        </div>
                        <div className="text-right text-white/60">
                          <div className="text-xs">{earthquake.depth}km deep</div>
                          <div className="text-xs">
                            {new Date(earthquake.time).toLocaleDateString()}
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
    </div>
  );
}