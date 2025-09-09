import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Coordinates, LocationData, Alert } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  selectedLocation: Coordinates | null;
  onLocationSelect: (coordinates: Coordinates) => void;
  locationData: LocationData | null;
  isLoading: boolean;
}

// Custom marker icons
const createCustomIcon = (color: string, size: number = 25) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}"/>
    </svg>
  `)}`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size],
  popupAnchor: [0, -size],
});

const selectedLocationIcon = createCustomIcon('#ef4444', 30); // red
const userLocationIcon = createCustomIcon('#3b82f6', 25); // blue
const alertIcon = createCustomIcon('#f59e0b', 20); // amber

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (coords: Coordinates) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
}

// Component to handle map centering
function MapCenter({ center }: { center: LatLngTuple }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export function LeafletMap({ 
  selectedLocation, 
  onLocationSelect, 
  locationData,
  isLoading 
}: LeafletMapProps) {
  const { toast } = useToast();
  const [showLayers, setShowLayers] = useState(true);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef<import('leaflet').Map | null>(null);

  // New Delhi coordinates as default
  const NEW_DELHI: LatLngTuple = [28.6139, 77.2090];
  const center: LatLngTuple = selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : NEW_DELHI;

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Using New Delhi as default.",
        variant: "destructive",
      });
      onLocationSelect({ lat: NEW_DELHI[0], lng: NEW_DELHI[1] });
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        onLocationSelect(coords);
        setIsGettingLocation(false);
        
        toast({
          title: "Location Found",
          description: `Centered map on your current location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        
        let errorMessage = "Failed to get your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: `${errorMessage} Using New Delhi as default.`,
          variant: "destructive",
        });
        
        // Fallback to New Delhi
        onLocationSelect({ lat: NEW_DELHI[0], lng: NEW_DELHI[1] });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  return (
    <Card className="relative h-full bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
      {/* Enhanced Map Controls with Glassmorphism */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        {/* Current Location Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCurrentLocation}
          disabled={isGettingLocation}
          className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 shadow-lg transition-all duration-200"
          aria-label="Use current location"
          title="My Current Location"
        >
          {isGettingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
        
        {/* Layer Toggle */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowLayers(!showLayers)}
          className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 shadow-lg transition-all duration-200"
          aria-label="Toggle layers"
          title="Toggle Alert Layers"
        >
          <Layers className="h-4 w-4" />
        </Button>
        
        {/* Zoom Controls */}
        <div className="flex flex-col space-y-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 shadow-lg transition-all duration-200"
            aria-label="Zoom in"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 shadow-lg transition-all duration-200"
            aria-label="Zoom out"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div className="w-full h-full relative">
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onLocationSelect={onLocationSelect} />
          <MapCenter center={center} />
          
          {/* User Location Marker */}
          {userLocation && (
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={userLocationIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Your Location</strong>
                  <br />
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Selected Location Marker */}
          {selectedLocation && (
            <Marker 
              position={[selectedLocation.lat, selectedLocation.lng]} 
              icon={selectedLocationIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong>Selected Location</strong>
                  <br />
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  {locationData && (
                    <>
                      <br />
                      <Badge 
                        variant={
                          locationData.riskScore.overall >= 80 ? "destructive" :
                          locationData.riskScore.overall >= 60 ? "secondary" : "outline"
                        }
                        className="mt-2"
                      >
                        Risk: {locationData.riskScore.overall}%
                      </Badge>
                      {locationData.weather.precipitation !== undefined && locationData.weather.precipitation > 0 && (
                        <>
                          <br />
                          <Badge variant="outline" className="mt-1">
                            Rain: {locationData.weather.precipitation}mm
                          </Badge>
                        </>
                      )}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Alert Markers */}
          {showLayers && locationData?.alerts && locationData.alerts
            .filter(alert => alert.isActive && !alert.acknowledged)
            .map((alert) => (
              <Marker 
                key={alert.id}
                position={[alert.coordinates.lat, alert.coordinates.lng]} 
                icon={alertIcon}
              >
                <Popup>
                  <div className="text-center max-w-xs">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <strong>{alert.title}</strong>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <Badge 
                      variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'high' ? 'destructive' :
                        alert.severity === 'medium' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              <span className="text-white font-medium">Loading location data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Map Info Bar with Rain Data */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {selectedLocation && (
                <div className="flex items-center space-x-2 text-white">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </span>
                  {locationData && (
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          locationData.riskScore.overall >= 80 ? "destructive" :
                          locationData.riskScore.overall >= 60 ? "secondary" : "outline"
                        }
                        className="text-xs"
                      >
                        Risk: {locationData.riskScore.overall}%
                      </Badge>
                      {/* Rain Data Display */}
                      {locationData.weather.precipitation !== undefined && (
                        <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-200 border-blue-500/30">
                          Rain: {locationData.weather.precipitation}mm
                        </Badge>
                      )}
                      {locationData.weather.rainChance !== undefined && locationData.weather.rainChance > 0 && (
                        <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-200 border-blue-500/30">
                          {locationData.weather.rainChance}% chance
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-white/70 text-xs">
              <Badge variant="outline" className="text-xs">
                Interactive Map
              </Badge>
              {locationData?.alerts && (
                <span>{locationData.alerts.filter(a => a.isActive).length} Active Alerts</span>
              )}
              {showLayers && (
                <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-200 border-amber-500/30">
                  Alerts Visible
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
}