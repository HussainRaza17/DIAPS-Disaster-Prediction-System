import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  AlertTriangle, 
  Bell, 
  Settings, 
  User,
  BarChart3,
  FileText,
  LayoutDashboard,
  LogOut,
  UserCircle,
  Shield,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  X,
  Check,
  Trash2
} from 'lucide-react';
import { Alert } from '@/lib/types';

interface NavigationProps {
  alerts?: Alert[];
  onAlertClick?: (alert: Alert) => void;
}

export function Navigation({ alerts = [], onAlertClick }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const activeAlerts = alerts.filter(alert => alert.isActive && !alert.acknowledged);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowSettings(false);
    setShowProfile(false);
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    setShowNotifications(false);
    setShowProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
    setShowSettings(false);
  };

  const handleAlertAcknowledge = (alertId: string) => {
    // In a real app, this would update the alert status
    console.log(`Acknowledging alert: ${alertId}`);
  };

  const handleAlertDismiss = (alertId: string) => {
    // In a real app, this would dismiss the alert
    console.log(`Dismissing alert: ${alertId}`);
  };

  return (
    <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 relative z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DIAPS</h1>
              <p className="text-sm text-white/70">Disaster Information & Prediction</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className={`
                    relative px-6 py-2 text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-white/20 text-white border-white/30' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotificationClick}
                className="text-white/80 hover:text-white hover:bg-white/10 relative"
              >
                <Bell className="h-5 w-5" />
                {activeAlerts.length > 0 && (
                  <Badge 
                    variant={criticalAlerts.length > 0 ? "destructive" : "secondary"}
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeAlerts.length}
                  </Badge>
                )}
              </Button>
              
              {/* Notifications Dropdown - Enhanced Glass Effect */}
              {showNotifications && (
                <Card className="absolute right-0 top-12 w-96 bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl z-[100] max-h-96 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">Notifications</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotifications(false)}
                        className="text-white/70 hover:text-white h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-white/70 text-sm">{activeAlerts.length} active alerts</p>
                  </CardHeader>
                  <CardContent className="p-0 max-h-80 overflow-y-auto">
                    {activeAlerts.length > 0 ? (
                      <div className="space-y-1">
                        {activeAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="p-4 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/10 last:border-b-0"
                            onClick={() => onAlertClick?.(alert)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <AlertTriangle className={`h-4 w-4 mt-1 flex-shrink-0 ${
                                  alert.severity === 'critical' ? 'text-red-400' :
                                  alert.severity === 'high' ? 'text-orange-400' :
                                  alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{alert.title}</p>
                                  <p className="text-white/70 text-xs mt-1 line-clamp-2">{alert.message}</p>
                                  <p className="text-white/50 text-xs mt-1">
                                    {new Date(alert.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAlertAcknowledge(alert.id);
                                  }}
                                  className="h-7 w-7 p-0 bg-green-600/20 border border-green-500/30 text-green-200 hover:bg-green-600/30 hover:border-green-500/50 transition-all duration-200"
                                  title="Acknowledge"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAlertDismiss(alert.id);
                                  }}
                                  className="h-7 w-7 p-0 bg-red-600/20 border border-red-500/30 text-red-200 hover:bg-red-600/30 hover:border-red-500/50 transition-all duration-200"
                                  title="Dismiss"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <Badge 
                              variant={
                                alert.severity === 'critical' ? 'destructive' :
                                alert.severity === 'high' ? 'destructive' :
                                alert.severity === 'medium' ? 'secondary' : 'outline'
                              }
                              className="text-xs mt-2"
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-white/30 mx-auto mb-4" />
                        <p className="text-white/70">No active notifications</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Settings */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSettingsClick}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Settings Dropdown - Enhanced Glass Effect */}
              {showSettings && (
                <Card className="absolute right-0 top-12 w-80 bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl z-[100]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">Settings</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSettings(false)}
                        className="text-white/70 hover:text-white h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {darkMode ? <Moon className="h-4 w-4 text-white/70" /> : <Sun className="h-4 w-4 text-white/70" />}
                        <span className="text-white text-sm">Dark Mode</span>
                      </div>
                      <Switch
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                    
                    <Separator className="bg-white/20" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {soundEnabled ? <Volume2 className="h-4 w-4 text-white/70" /> : <VolumeX className="h-4 w-4 text-white/70" />}
                        <span className="text-white text-sm">Sound Notifications</span>
                      </div>
                      <Switch
                        checked={soundEnabled}
                        onCheckedChange={setSoundEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-white/70" />
                        <span className="text-white text-sm">Auto Refresh Data</span>
                      </div>
                      <Switch
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                      />
                    </div>
                    
                    <Separator className="bg-white/20" />
                    
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Privacy & Security
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notification Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Profile Dropdown - Enhanced Glass Effect */}
              {showProfile && (
                <Card className="absolute right-0 top-12 w-64 bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl z-[100]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Admin User</p>
                          <p className="text-white/70 text-sm">admin@diaps.gov</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProfile(false)}
                        className="text-white/70 hover:text-white h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </Button>
                    <Separator className="bg-white/20" />
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}