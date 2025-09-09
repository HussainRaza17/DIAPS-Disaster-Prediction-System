import { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Crosshair, Layers, ZoomIn, ZoomOut, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coordinates, LocationData } from '@/lib/types';

interface InteractiveMapProps {
  selectedLocation: Coordinates | null;
  onLocationSelect: (coordinates: Coordinates) => void;
  locationData: LocationData | null;
  isLoading: boolean;
}

export function InteractiveMap({ 
  selectedLocation, 
  onLocationSelect, 
  locationData,
  isLoading 
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [showLayers, setShowLayers] = useState(true);
  const [mapView, setMapView] = useState<'local' | 'global'>('local');
  const [zoomLevel, setZoomLevel] = useState(10);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  // New Delhi coordinates as default
  const NEW_DELHI = useMemo(() => ({ lat: 28.6139, lng: 77.2090 }), []);

  // Simulate map click handler
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to lat/lng based on current view
    let lat, lng;
    
    if (mapView === 'global') {
      // Global view: full world map
      lat = 85 - (y / rect.height) * 170; // -85 to 85 degrees
      lng = -180 + (x / rect.width) * 360; // -180 to 180 degrees
    } else {
      // Local view: centered on current location or New Delhi
      const center = selectedLocation || NEW_DELHI;
      const range = 10 / zoomLevel; // Smaller range for higher zoom
      lat = center.lat + (y - rect.height / 2) / rect.height * range;
      lng = center.lng + (x - rect.width / 2) / rect.width * range;
    }
    
    onLocationSelect({ lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          onLocationSelect(coords);
          setMapView('local');
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to New Delhi
          onLocationSelect(NEW_DELHI);
        }
      );
    } else {
      // Fallback to New Delhi
      onLocationSelect(NEW_DELHI);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 2, 20));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 2, 1));
  };

  const toggleMapView = () => {
    setMapView(prev => prev === 'local' ? 'global' : 'local');
    if (mapView === 'local') {
      setZoomLevel(1); // Global view
    } else {
      setZoomLevel(10); // Local view
    }
  };

  // Initialize with New Delhi
  useEffect(() => {
    if (!selectedLocation) {
      onLocationSelect(NEW_DELHI);
    }
  }, [selectedLocation, onLocationSelect, NEW_DELHI]);

  return (
    <Card className="relative h-full bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCurrentLocation}
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          aria-label="Use current location"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleMapView}
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          aria-label={`Switch to ${mapView === 'local' ? 'global' : 'local'} view`}
        >
          <Globe className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowLayers(!showLayers)}
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          aria-label="Toggle layers"
        >
          <Layers className="h-4 w-4" />
        </Button>
        <div className="flex flex-col space-y-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full cursor-crosshair relative bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900"
        onClick={handleMapClick}
        role="button"
        tabIndex={0}
        aria-label={`Interactive ${mapView} map - click to select location`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCurrentLocation();
          }
        }}
      >
        {/* Map Background - Different for local vs global */}
        <div className="absolute inset-0 opacity-40">
          {mapView === 'global' ? (
            // Global world map simulation
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.3),transparent_40%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.3),transparent_40%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_80%,rgba(168,85,247,0.2),transparent_40%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(249,115,22,0.2),transparent_40%)]" />
              {/* Simulate continents */}
              <div className="absolute top-1/4 left-1/4 w-32 h-20 bg-green-600/20 rounded-full transform rotate-12" />
              <div className="absolute top-1/3 right-1/4 w-24 h-16 bg-green-600/20 rounded-lg transform -rotate-6" />
              <div className="absolute bottom-1/3 left-1/3 w-28 h-18 bg-green-600/20 rounded-full" />
            </>
          ) : (
            // Local area view
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.3),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(34,197,94,0.2),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.2),transparent_50%)]" />
            </>
          )}
        </div>

        {/* Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width={mapView === 'global' ? '30' : '50'} height={mapView === 'global' ? '30' : '50'} patternUnits="userSpaceOnUse">
              <path d={`M ${mapView === 'global' ? '30' : '50'} 0 L 0 0 0 ${mapView === 'global' ? '30' : '50'}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* User Location Marker */}
        {userLocation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: mapView === 'global' 
                ? `${((userLocation.lng + 180) / 360) * 100}%`
                : '40%',
              top: mapView === 'global' 
                ? `${((85 - userLocation.lat) / 170) * 100}%`
                : '40%'
            }}
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
              <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500/20 rounded-full animate-ping" />
            </div>
          </div>
        )}

        {/* Selected Location Marker */}
        {selectedLocation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: mapView === 'global' 
                ? `${((selectedLocation.lng + 180) / 360) * 100}%`
                : '50%',
              top: mapView === 'global' 
                ? `${((85 - selectedLocation.lat) / 170) * 100}%`
                : '50%'
            }}
          >
            <div className="relative">
              <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg animate-bounce" />
              <div className="absolute -top-2 -left-2 w-12 h-12 bg-red-500/20 rounded-full animate-ping" />
            </div>
          </div>
        )}

        {/* Risk Overlay Visualization */}
        {locationData && showLayers && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Flood Risk Areas */}
            {locationData.riskScore.flood > 50 && (
              <div className="absolute bottom-0 left-0 w-1/3 h-1/4 bg-blue-500/20 rounded-tr-full animate-pulse" />
            )}
            
            {/* Seismic Activity */}
            {locationData.seismic.map((earthquake, index) => (
              <div
                key={index}
                className="absolute w-4 h-4 bg-yellow-500/60 rounded-full animate-pulse"
                style={{
                  left: `${30 + index * 15}%`,
                  top: `${40 + index * 10}%`
                }}
              />
            ))}

            {/* High Risk Zones */}
            {locationData.riskScore.overall > 70 && (
              <div className="absolute top-1/4 right-1/4 w-24 h-24 border-2 border-red-500/50 rounded-full animate-pulse" />
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              <span className="text-white font-medium">Loading location data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Info Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {selectedLocation && (
                <div className="flex items-center space-x-2 text-white">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </span>
                  {locationData && (
                    <Badge 
                      variant={
                        locationData.riskScore.overall >= 80 ? "destructive" :
                        locationData.riskScore.overall >= 60 ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      Risk: {locationData.riskScore.overall}%
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 text-white/70 text-xs">
              <Badge variant="outline" className="text-xs">
                {mapView === 'global' ? 'Global View' : 'Local View'}
              </Badge>
              <span>Zoom: {zoomLevel}x</span>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
}