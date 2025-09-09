import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Filter,
  Eye,
  Share,
  Printer,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export default function Reports() {
  const { toast } = useToast();
  const [selectedReportType, setSelectedReportType] = useState<string>('summary');
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date()
  });
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['all-regions']);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock report data
  const reportTemplates = [
    {
      id: 'summary',
      name: 'Executive Summary',
      description: 'High-level overview of disaster incidents and risk assessments',
      icon: TrendingUp,
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'detailed',
      name: 'Detailed Analysis',
      description: 'Comprehensive analysis with charts, maps, and statistical data',
      icon: BarChart3,
      estimatedTime: '5-7 minutes'
    },
    {
      id: 'incident',
      name: 'Incident Report',
      description: 'Specific incident documentation with timeline and impact analysis',
      icon: AlertCircle,
      estimatedTime: '3-4 minutes'
    },
    {
      id: 'risk',
      name: 'Risk Assessment',
      description: 'Regional risk evaluation with predictive modeling results',
      icon: CheckCircle,
      estimatedTime: '4-5 minutes'
    }
  ];

  const recentReports = [
    {
      id: '1',
      name: 'Monthly Disaster Summary - November 2024',
      type: 'Executive Summary',
      generatedAt: '2024-11-28T10:30:00Z',
      status: 'completed',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: '2',
      name: 'Flood Risk Analysis - Delhi Region',
      type: 'Risk Assessment',
      generatedAt: '2024-11-27T15:45:00Z',
      status: 'completed',
      size: '5.1 MB',
      format: 'PDF'
    },
    {
      id: '3',
      name: 'Seismic Activity Report - October 2024',
      type: 'Incident Report',
      generatedAt: '2024-11-26T09:15:00Z',
      status: 'completed',
      size: '3.8 MB',
      format: 'Excel'
    },
    {
      id: '4',
      name: 'Weekly Analytics Dashboard Export',
      type: 'Detailed Analysis',
      generatedAt: '2024-11-25T14:20:00Z',
      status: 'completed',
      size: '7.2 MB',
      format: 'PDF'
    }
  ];

  const regions = [
    { id: 'all-regions', label: 'All Regions' },
    { id: 'north-india', label: 'North India' },
    { id: 'south-india', label: 'South India' },
    { id: 'east-india', label: 'East India' },
    { id: 'west-india', label: 'West India' }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create mock report data
      const reportData = {
        type: selectedReportType,
        format: selectedFormat,
        dateRange,
        regions: selectedRegions,
        generatedAt: new Date().toISOString()
      };

      // Simulate file creation and download
      let content = '';
      let mimeType = '';
      let extension = '';

      switch (selectedFormat) {
        case 'pdf':
          content = `DIAPS Report - ${reportTemplates.find(t => t.id === selectedReportType)?.name}\n\nGenerated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\nDate Range: ${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}\nRegions: ${selectedRegions.join(', ')}\n\nThis would be a comprehensive PDF report with charts, maps, and detailed analysis.`;
          mimeType = 'application/pdf';
          extension = 'pdf';
          break;
        case 'excel':
          content = `Date,Type,Region,Risk Score,Incidents\n${format(new Date(), 'yyyy-MM-dd')},Sample,Delhi,75,12\n${format(new Date(), 'yyyy-MM-dd')},Sample,Mumbai,82,8`;
          mimeType = 'application/vnd.ms-excel';
          extension = 'xlsx';
          break;
        case 'csv':
          content = `Date,Type,Region,Risk Score,Incidents\n${format(new Date(), 'yyyy-MM-dd')},Sample,Delhi,75,12\n${format(new Date(), 'yyyy-MM-dd')},Sample,Mumbai,82,8`;
          mimeType = 'text/csv';
          extension = 'csv';
          break;
        case 'json':
          content = JSON.stringify(reportData, null, 2);
          mimeType = 'application/json';
          extension = 'json';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diaps-report-${selectedReportType}-${format(new Date(), 'yyyy-MM-dd')}.${extension}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report Generated Successfully",
        description: `${reportTemplates.find(t => t.id === selectedReportType)?.name} has been generated and downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    const report = recentReports.find(r => r.id === reportId);
    if (!report) return;

    try {
      // Simulate download
      const content = `Mock ${report.format} content for ${report.name}`;
      const blob = new Blob([content], { 
        type: report.format === 'PDF' ? 'application/pdf' : 'application/vnd.ms-excel' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '-').toLowerCase()}.${report.format.toLowerCase()}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${report.name}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewReport = (reportId: string) => {
    const report = recentReports.find(r => r.id === reportId);
    if (!report) return;

    toast({
      title: "Opening Report",
      description: `Opening ${report.name} in a new window`,
    });
    // In a real app, this would open the report in a new tab
  };

  const handleShareReport = async () => {
    try {
      const shareUrl = `${window.location.origin}/reports/shared/${Date.now()}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Share Link Copied",
        description: "Report share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to create share link",
        variant: "destructive",
      });
    }
  };

  const handlePrintReport = () => {
    window.print();
    toast({
      title: "Print Dialog Opened",
      description: "Report is ready for printing",
    });
  };

  const handleRegionChange = (regionId: string, checked: boolean) => {
    if (regionId === 'all-regions') {
      setSelectedRegions(checked ? ['all-regions'] : []);
    } else {
      setSelectedRegions(prev => {
        const newSelection = prev.filter(id => id !== 'all-regions');
        if (checked) {
          return [...newSelection, regionId];
        } else {
          return newSelection.filter(id => id !== regionId);
        }
      });
    }
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      toast({
        title: "Date Range Updated",
        description: `Report will include data from ${format(range.from, 'MMM dd')} to ${format(range.to, 'MMM dd')}`,
      });
    }
  };

  return (
    <main className="container mx-auto px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Documentation</h1>
          <p className="text-white/70 mt-2">Generate comprehensive disaster monitoring reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleShareReport}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrintReport}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Templates */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <span>Report Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <div 
                    key={template.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      selectedReportType === template.id 
                        ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                    onClick={() => {
                      setSelectedReportType(template.id);
                      toast({
                        title: "Template Selected",
                        description: `Selected ${template.name} template`,
                      });
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`h-6 w-6 mt-1 ${
                        selectedReportType === template.id ? 'text-blue-400' : 'text-white/70'
                      }`} />
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{template.name}</h4>
                        <p className="text-white/70 text-sm mt-1">{template.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-white/50" />
                            <span className="text-white/50 text-xs">{template.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Report Configuration */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Filter className="h-5 w-5 text-green-400" />
                <span>Report Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-800/95 backdrop-blur-xl border-white/20">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Format Selection */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Export Format</label>
                <Select value={selectedFormat} onValueChange={(value) => {
                  setSelectedFormat(value);
                  toast({
                    title: "Format Selected",
                    description: `Report will be generated in ${value.toUpperCase()} format`,
                  });
                }}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-white/20">
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Region Selection */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Regions</label>
                <div className="space-y-2">
                  {regions.map((region) => (
                    <div key={region.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={region.id}
                        checked={selectedRegions.includes(region.id)}
                        onCheckedChange={(checked) => handleRegionChange(region.id, checked as boolean)}
                        className="border-white/30"
                      />
                      <label htmlFor={region.id} className="text-white text-sm cursor-pointer">
                        {region.label}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-white/50 text-xs mt-2">
                  {selectedRegions.length} region{selectedRegions.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerateReport}
                disabled={isGenerating || selectedRegions.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div className="space-y-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-400" />
                <span>Recent Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-white font-medium text-sm">{report.name}</h4>
                      <p className="text-white/70 text-xs">{report.type}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs bg-green-500/20 text-green-200 border-green-500/30">
                          {report.status}
                        </Badge>
                        <span className="text-white/50 text-xs">{report.size}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {report.format}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/50 text-xs">
                        {format(new Date(report.generatedAt), 'MMM dd, HH:mm')}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewReport(report.id)}
                          className="h-6 w-6 p-0 text-white/70 hover:text-white"
                          title="View Report"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDownloadReport(report.id)}
                          className="h-6 w-6 p-0 text-white/70 hover:text-white"
                          title="Download Report"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={handleShareReport}
                          className="h-6 w-6 p-0 text-white/70 hover:text-white"
                          title="Share Report"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-orange-400" />
                <span>Report Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Reports Generated</span>
                <span className="text-white font-medium">247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">This Month</span>
                <span className="text-white font-medium">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Total Downloads</span>
                <span className="text-white font-medium">1,429</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Avg Generation Time</span>
                <span className="text-white font-medium">3.2 min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}