import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  MapPin, 
  Calendar as CalendarIcon,
  Filter,
  Download,
  Zap,
  Droplets,
  Mountain,
  Waves,
  FileSpreadsheet,
  FileText,
  Database,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

export default function Analytics() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [selectedDisasterType, setSelectedDisasterType] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  type AnalyticsData = typeof baseAnalyticsData;
  const [filteredData, setFilteredData] = useState<AnalyticsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock analytics data
  const baseAnalyticsData = {
    totalIncidents: 247,
    criticalAlerts: 18,
    averageRiskScore: 42,
    trendsData: [
      { month: 'Jan', incidents: 15, riskScore: 35 },
      { month: 'Feb', incidents: 22, riskScore: 41 },
      { month: 'Mar', incidents: 18, riskScore: 38 },
      { month: 'Apr', incidents: 31, riskScore: 52 },
      { month: 'May', incidents: 28, riskScore: 48 },
      { month: 'Jun', incidents: 35, riskScore: 55 },
    ],
    disasterTypes: [
      { type: 'Flood', count: 89, percentage: 36, trend: 'up', icon: Droplets },
      { type: 'Earthquake', count: 67, percentage: 27, trend: 'down', icon: Zap },
      { type: 'Landslide', count: 45, percentage: 18, trend: 'up', icon: Mountain },
      { type: 'Tsunami', count: 46, percentage: 19, trend: 'stable', icon: Waves },
    ],
    regionData: [
      { region: 'North India', incidents: 78, riskLevel: 'High' },
      { region: 'South India', incidents: 65, riskLevel: 'Medium' },
      { region: 'East India', incidents: 52, riskLevel: 'Medium' },
      { region: 'West India', incidents: 52, riskLevel: 'Low' },
    ],
    riskPredictions: [
      { location: 'Mumbai', predictedRisk: 85, timeframe: '7 days', type: 'Flood' },
      { location: 'Delhi', predictedRisk: 72, timeframe: '14 days', type: 'Air Quality' },
      { location: 'Chennai', predictedRisk: 68, timeframe: '10 days', type: 'Cyclone' },
      { location: 'Kolkata', predictedRisk: 61, timeframe: '21 days', type: 'Flood' },
    ]
  };

  // Filter data based on selections
  useEffect(() => {
    const filtered = { ...baseAnalyticsData };

    // Filter by disaster type
    if (selectedDisasterType !== 'all') {
      filtered.disasterTypes = filtered.disasterTypes.filter(
        disaster => disaster.type.toLowerCase().includes(selectedDisasterType)
      );
    }

    // Filter by region
    if (selectedRegion !== 'all') {
      const regionMap: { [key: string]: string } = {
        'north': 'North India',
        'south': 'South India',
        'east': 'East India',
        'west': 'West India'
      };
      filtered.regionData = filtered.regionData.filter(
        region => region.region === regionMap[selectedRegion]
      );
    }

    // Simulate date range filtering
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 30) {
      filtered.totalIncidents = Math.floor(filtered.totalIncidents * 0.7);
      filtered.criticalAlerts = Math.floor(filtered.criticalAlerts * 0.6);
    }

    setFilteredData(filtered);
  }, [selectedDisasterType, selectedRegion, dateRange]);

  const handleExportData = async (exportFormat: 'excel' | 'pdf' | 'csv' | 'json') => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock data for download
      const exportData = {
        dateRange: `${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}`,
        filters: {
          disasterType: selectedDisasterType,
          region: selectedRegion
        },
        data: filteredData || baseAnalyticsData,
        exportedAt: new Date().toISOString()
      };

      // Create and download file
      const dataStr = exportFormat === 'json' 
        ? JSON.stringify(exportData, null, 2)
        : `Analytics Report - ${exportFormat.toUpperCase()}\n\nGenerated: ${new Date().toLocaleString()}\nDate Range: ${exportData.dateRange}\n\nTotal Incidents: ${exportData.data.totalIncidents}\nCritical Alerts: ${exportData.data.criticalAlerts}\nAverage Risk Score: ${exportData.data.averageRiskScore}%`;

      const blob = new Blob([dataStr], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diaps-analytics-${exportFormat}-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat === 'json' ? 'json' : 'txt'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Analytics data exported as ${exportFormat.toUpperCase()} file.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastUpdated(new Date());
      toast({
        title: "Data Refreshed",
        description: "Analytics data has been updated with the latest information.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const analyticsData = filteredData || baseAnalyticsData;

  return (
    <main className="container mx-auto px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-white/70 mt-2">
            Comprehensive disaster data analysis and insights
            <span className="ml-2 text-white/50 text-sm">
              Last updated: {format(lastUpdated, 'HH:mm:ss')}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-slate-800/95 backdrop-blur-xl border-white/20">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => handleExportData('excel')}
                  disabled={isExporting}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => handleExportData('pdf')}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => handleExportData('csv')}
                  disabled={isExporting}
                >
                  <Database className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => handleExportData('json')}
                  disabled={isExporting}
                >
                  <Database className="h-4 w-4 mr-2" />
                  JSON
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-white/70" />
              <span className="text-white/70 text-sm">Filters:</span>
            </div>
            
            <Select value={selectedDisasterType} onValueChange={setSelectedDisasterType}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Disaster Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/20">
                <SelectItem value="all">All Disasters</SelectItem>
                <SelectItem value="flood">Flood</SelectItem>
                <SelectItem value="earthquake">Earthquake</SelectItem>
                <SelectItem value="landslide">Landslide</SelectItem>
                <SelectItem value="tsunami">Tsunami</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/20">
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="north">North India</SelectItem>
                <SelectItem value="south">South India</SelectItem>
                <SelectItem value="east">East India</SelectItem>
                <SelectItem value="west">West India</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-800/95 backdrop-blur-xl border-white/20">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                      toast({
                        title: "Date Range Updated",
                        description: `Showing data from ${format(range.from, 'MMM dd')} to ${format(range.to, 'MMM dd')}`,
                      });
                    }
                  }}
                  numberOfMonths={2}
                  className="text-white"
                />
              </PopoverContent>
            </Popover>

            {(selectedDisasterType !== 'all' || selectedRegion !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDisasterType('all');
                  setSelectedRegion('all');
                  toast({
                    title: "Filters Cleared",
                    description: "All filters have been reset to show complete data.",
                  });
                }}
                className="text-white/70 hover:text-white"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Incidents</p>
                <p className="text-3xl font-bold text-white">{analyticsData.totalIncidents}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">+12% from last month</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Critical Alerts</p>
                <p className="text-3xl font-bold text-white">{analyticsData.criticalAlerts}</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
                  <span className="text-red-400 text-sm">-8% from last month</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Avg Risk Score</p>
                <p className="text-3xl font-bold text-white">{analyticsData.averageRiskScore}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-sm">+3% from last month</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Regions Monitored</p>
                <p className="text-3xl font-bold text-white">{analyticsData.regionData.length}</p>
                <div className="flex items-center mt-2">
                  <MapPin className="h-4 w-4 text-blue-400 mr-1" />
                  <span className="text-blue-400 text-sm">Real-time coverage</span>
                </div>
              </div>
              <MapPin className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disaster Types Analysis */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <span>Disaster Types Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.disasterTypes.map((disaster, index) => {
              const Icon = disaster.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => {
                    toast({
                      title: `${disaster.type} Details`,
                      description: `${disaster.count} incidents recorded with ${disaster.trend} trend`,
                    });
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">{disaster.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm">{disaster.count} incidents</span>
                      {disaster.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-400" />}
                      {disaster.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-400" />}
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500 hover:bg-blue-400"
                      style={{ width: `${disaster.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>{disaster.percentage}% of total</span>
                    <span>Last 30 days</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Regional Analysis */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-400" />
              <span>Regional Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analyticsData.regionData.map((region, index) => (
              <div 
                key={index} 
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => {
                  toast({
                    title: `${region.region} Analysis`,
                    description: `${region.incidents} incidents with ${region.riskLevel} risk level`,
                  });
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{region.region}</h4>
                    <p className="text-white/70 text-sm">{region.incidents} incidents recorded</p>
                  </div>
                  <Badge 
                    variant={
                      region.riskLevel === 'High' ? 'destructive' :
                      region.riskLevel === 'Medium' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {region.riskLevel} Risk
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Risk Predictions */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span>Predictive Risk Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.riskPredictions.map((prediction, index) => (
              <div 
                key={index} 
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => {
                  toast({
                    title: `${prediction.location} Prediction`,
                    description: `${prediction.predictedRisk}% risk of ${prediction.type} in ${prediction.timeframe}`,
                  });
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">{prediction.location}</h4>
                  <Badge 
                    variant={
                      prediction.predictedRisk >= 80 ? 'destructive' :
                      prediction.predictedRisk >= 60 ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {prediction.predictedRisk}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 hover:opacity-80 ${
                        prediction.predictedRisk >= 80 ? 'bg-red-500' :
                        prediction.predictedRisk >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${prediction.predictedRisk}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/70">
                    <span>{prediction.type}</span>
                    <span>{prediction.timeframe}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}