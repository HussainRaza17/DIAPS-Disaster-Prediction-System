import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Droplets, 
  Zap, 
  Mountain, 
  Waves, 
  Shield,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { RiskScore } from '@/lib/types';

interface RiskCardsProps {
  riskScore: RiskScore | null;
  isLoading?: boolean;
}

export function RiskCards({ riskScore, isLoading }: RiskCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!riskScore) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">No risk data available</p>
        </CardContent>
      </Card>
    );
  }

  const getRiskLevel = (score: number): { level: string; color: string; variant: "default" | "destructive" | "secondary" | "outline" } => {
    if (score >= 80) return { level: 'CRITICAL', color: 'text-red-400', variant: 'destructive' };
    if (score >= 60) return { level: 'HIGH', color: 'text-orange-400', variant: 'secondary' };
    if (score >= 40) return { level: 'MEDIUM', color: 'text-yellow-400', variant: 'secondary' };
    return { level: 'LOW', color: 'text-green-400', variant: 'outline' };
  };

  const overallRisk = getRiskLevel(riskScore.overall);

  const riskCategories = [
    { 
      name: 'Flood Risk', 
      score: riskScore.flood, 
      icon: Droplets, 
      color: 'text-blue-400',
      description: 'Water level and precipitation analysis'
    },
    { 
      name: 'Earthquake', 
      score: riskScore.earthquake, 
      icon: Zap, 
      color: 'text-yellow-400',
      description: 'Seismic activity monitoring'
    },
    { 
      name: 'Landslide', 
      score: riskScore.landslide, 
      icon: Mountain, 
      color: 'text-orange-400',
      description: 'Slope stability assessment'
    },
    { 
      name: 'Heavy Rain', 
      score: riskScore.heavyRain, 
      icon: Waves, 
      color: 'text-cyan-400',
      description: 'Precipitation intensity forecast'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Risk Assessment */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <span>Overall Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="text-6xl font-bold text-white mb-2">
                {riskScore.overall}%
              </div>
              <Badge 
                variant={overallRisk.variant}
                className="absolute -top-2 -right-12 text-xs"
              >
                {overallRisk.level}
              </Badge>
            </div>
            <p className="text-white/70 text-sm">Current Risk Level</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Risk Score</span>
              <span className={`font-medium ${overallRisk.color}`}>
                {riskScore.overall}%
              </span>
            </div>
            <Progress 
              value={riskScore.overall} 
              className="h-3 bg-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {riskScore.overall >= 60 ? '⚠️' : riskScore.overall >= 40 ? '⚡' : '✅'}
              </div>
              <p className="text-white/60 text-xs mt-1">Status</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-white/60 text-xs mt-1">Trend</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Risk Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {riskCategories.map((category, index) => {
          const Icon = category.icon;
          const categoryRisk = getRiskLevel(category.score);
          
          return (
            <Card 
              key={index} 
              className="bg-white/5 backdrop-blur-xl border-white/10 shadow-xl hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${category.color}`} />
                    <span className="text-white font-medium text-sm">{category.name}</span>
                  </div>
                  <Badge 
                    variant={categoryRisk.variant}
                    className="text-xs"
                  >
                    {categoryRisk.level}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">{category.score}%</span>
                    {category.score >= 60 && (
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                    )}
                  </div>
                  <Progress 
                    value={category.score} 
                    className="h-2 bg-white/10"
                  />
                  <p className="text-white/50 text-xs">{category.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}