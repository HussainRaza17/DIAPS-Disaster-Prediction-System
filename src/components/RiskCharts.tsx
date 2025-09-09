import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { RiskScore } from '@/lib/types';

interface RiskChartsProps {
  riskScore: RiskScore | null;
  isLoading: boolean;
}

interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  label: string;
}

interface TrendDataPoint {
  time: string;
  flood: number;
  rain: number;
  landslide: number;
  tsunami: number;
  earthquake: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
    value: number;
  }>;
  label?: string;
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium">{data.label}</p>
        <p className="text-white/80 text-sm">
          Risk Level: <span className="font-bold">{data.value}%</span>
        </p>
      </div>
    );
  }
  return null;
}

function TrendTooltip({ active, payload, label }: TrendTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function RiskCharts({ riskScore, isLoading }: RiskChartsProps) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!riskScore) return [];
    
    return [
      {
        name: 'Flood',
        value: riskScore.flood,
        color: '#3B82F6',
        label: 'Flood Risk'
      },
      {
        name: 'Rain',
        value: riskScore.rain,
        color: '#64748B',
        label: 'Heavy Rain Risk'
      },
      {
        name: 'Landslide',
        value: riskScore.landslide,
        color: '#F59E0B',
        label: 'Landslide Risk'
      },
      {
        name: 'Tsunami',
        value: riskScore.tsunami,
        color: '#06B6D4',
        label: 'Tsunami Risk'
      },
      {
        name: 'Earthquake',
        value: riskScore.earthquake,
        color: '#EAB308',
        label: 'Earthquake Risk'
      }
    ];
  }, [riskScore]);

  // Generate simulated trend data for the last 24 hours
  const trendData = useMemo<TrendDataPoint[]>(() => {
    if (!riskScore) return [];

    const hours = Array.from({ length: 24 }, (_, i) => {
      const time = new Date();
      time.setHours(time.getHours() - (23 - i));
      return time.getHours().toString().padStart(2, '0') + ':00';
    });

    return hours.map((time) => {
      // Simulate realistic trend variations
      const variation = () => Math.random() * 20 - 10; // ±10% variation
      
      return {
        time,
        flood: Math.max(0, Math.min(100, riskScore.flood + variation())),
        rain: Math.max(0, Math.min(100, riskScore.rain + variation())),
        landslide: Math.max(0, Math.min(100, riskScore.landslide + variation())),
        tsunami: Math.max(0, Math.min(100, riskScore.tsunami + variation())),
        earthquake: Math.max(0, Math.min(100, riskScore.earthquake + variation()))
      };
    });
  }, [riskScore]);

  const maxRisk = Math.max(...chartData.map(d => d.value));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="h-6 bg-white/10 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-white/10 rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="h-6 bg-white/10 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-white/10 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Risk Levels Bar Chart */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <span>Current Risk Levels</span>
            </div>
            <Badge 
              variant={maxRisk >= 80 ? "destructive" : maxRisk >= 60 ? "secondary" : "outline"}
              className="text-xs"
            >
              Peak: {Math.round(maxRisk)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill="url(#riskGradient)"
                />
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 24-Hour Risk Trend */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span>24-Hour Risk Trends</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Live Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={10}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={10}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<TrendTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="flood" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                  name="Flood"
                />
                <Line 
                  type="monotone" 
                  dataKey="rain" 
                  stroke="#64748B" 
                  strokeWidth={2}
                  dot={false}
                  name="Rain"
                />
                <Line 
                  type="monotone" 
                  dataKey="landslide" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={false}
                  name="Landslide"
                />
                <Line 
                  type="monotone" 
                  dataKey="tsunami" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  dot={false}
                  name="Tsunami"
                />
                <Line 
                  type="monotone" 
                  dataKey="earthquake" 
                  stroke="#EAB308" 
                  strokeWidth={2}
                  dot={false}
                  name="Earthquake"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Distribution Area Chart */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Activity className="h-5 w-5 text-purple-400" />
            <span>Risk Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.slice(-6)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={10}
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis hide />
                <Tooltip content={<TrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="flood"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="rain"
                  stackId="1"
                  stroke="#64748B"
                  fill="#64748B"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="landslide"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="tsunami"
                  stackId="1"
                  stroke="#06B6D4"
                  fill="#06B6D4"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="earthquake"
                  stackId="1"
                  stroke="#EAB308"
                  fill="#EAB308"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}