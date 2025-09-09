import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Bell, 
  Check, 
  Trash2, 
  Clock,
  MapPin,
  X
} from 'lucide-react';
import { Alert } from '@/lib/types';

interface AlertSystemProps {
  alerts: Alert[];
  onAlertAcknowledge: (alertId: string) => void;
  onAlertDismiss: (alertId: string) => void;
}

export function AlertSystem({ alerts, onAlertAcknowledge, onAlertDismiss }: AlertSystemProps) {
  const [showAll, setShowAll] = useState(false);
  
  const activeAlerts = alerts.filter(alert => alert.isActive && !alert.acknowledged);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const displayAlerts = showAll ? activeAlerts : activeAlerts.slice(0, 3);

  if (activeAlerts.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
        <CardContent className="p-6 text-center">
          <Bell className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">No active alerts</p>
          <p className="text-white/50 text-sm mt-2">All systems operating normally</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span>Active Alerts</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalAlerts.length} Critical
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {activeAlerts.length} Total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayAlerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors border border-white/10"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start space-x-3 flex-1">
                <AlertTriangle className={`h-4 w-4 mt-1 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'text-red-400' :
                  alert.severity === 'high' ? 'text-orange-400' :
                  alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm">{alert.title}</h4>
                  <p className="text-white/70 text-xs mt-1 line-clamp-2">{alert.message}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAlertAcknowledge(alert.id)}
                  className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                  title="Acknowledge"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAlertDismiss(alert.id)}
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  title="Dismiss"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3 text-white/50">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {alert.coordinates.lat.toFixed(2)}, {alert.coordinates.lng.toFixed(2)}
                  </span>
                </div>
              </div>
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
          </div>
        ))}
        
        {activeAlerts.length > 3 && (
          <>
            <Separator className="bg-white/20" />
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
            >
              {showAll ? 'Show Less' : `Show ${activeAlerts.length - 3} More Alerts`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}