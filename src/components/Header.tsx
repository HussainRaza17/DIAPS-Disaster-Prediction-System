import { Bell, Settings, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert } from '@/lib/types';

interface HeaderProps {
  alerts: Alert[];
  onAlertClick: (alert: Alert) => void;
}

export function Header({ alerts, onAlertClick }: HeaderProps) {
  const activeAlerts = alerts.filter(alert => alert.isActive && !alert.acknowledged);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DIAPS</h1>
              <p className="text-xs text-white/70">Disaster Information & Prediction</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            Dashboard
          </Button>
          <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            Analytics
          </Button>
          <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            Reports
          </Button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Alerts Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative text-white/80 hover:text-white hover:bg-white/10"
                aria-label={`${activeAlerts.length} active alerts`}
              >
                <Bell className="h-5 w-5" />
                {activeAlerts.length > 0 && (
                  <Badge 
                    variant={criticalAlerts.length > 0 ? "destructive" : "secondary"}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeAlerts.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white/10 backdrop-blur-xl border-white/20">
              <DropdownMenuLabel className="text-white">
                Active Alerts ({activeAlerts.length})
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20" />
              {activeAlerts.length === 0 ? (
                <DropdownMenuItem className="text-white/70">
                  No active alerts
                </DropdownMenuItem>
              ) : (
                activeAlerts.slice(0, 5).map((alert) => (
                  <DropdownMenuItem
                    key={alert.id}
                    className="text-white hover:bg-white/10 cursor-pointer"
                    onClick={() => onAlertClick(alert)}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
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
                        <span className="font-medium text-sm">{alert.title}</span>
                      </div>
                      <p className="text-xs text-white/70 truncate">{alert.message}</p>
                      <p className="text-xs text-white/50">{alert.location}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              {activeAlerts.length > 5 && (
                <DropdownMenuItem className="text-white/70 text-center">
                  +{activeAlerts.length - 5} more alerts
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10"
                aria-label="User menu"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-xl border-white/20">
              <DropdownMenuLabel className="text-white">Emergency Coordinator</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem className="text-white hover:bg-white/10">Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-white/10">Preferences</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem className="text-white hover:bg-white/10">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}