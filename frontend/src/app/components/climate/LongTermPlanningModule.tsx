import { Download, TrendingUp, CloudRain, Thermometer } from "lucide-react";

type ForecastHorizon = "1month" | "3months" | "6months" | "1year";

interface LongTermPlanningModuleProps {
  forecastHorizon: ForecastHorizon;
  setForecastHorizon: (horizon: ForecastHorizon) => void;
}

export function LongTermPlanningModule({ forecastHorizon, setForecastHorizon }: LongTermPlanningModuleProps) {
  // Dynamic metrics based on horizon
  const getMetrics = () => {
    const horizonMultiplier = forecastHorizon === "1month" ? 1 : forecastHorizon === "3months" ? 3 : forecastHorizon === "6months" ? 6 : 12;
    return {
      avgTemp: (30 + Math.random() * 5).toFixed(1),
      rainfall: Math.floor(80 * horizonMultiplier),
      confidence: Math.floor(87 - horizonMultiplier * 2)
    };
  };
  
  const metrics = getMetrics();
  
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-xl border border-teal-500/20 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-[14px] font-bold text-foreground mb-2 flex items-center gap-2">
              🗓 Long-Term Planning (ABP Layer)
            </h3>
            <p className="text-[12px] text-muted-foreground">
              Strategic long-term weather forecasting for Annual Business Planning cycles. Provides 1 month to 1 year forecast support with confidence bands.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/20 rounded-lg border border-teal-500/30">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">Strategic View</span>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-muted/30 rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Forecast Horizon */}
          <div>
            <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
              Forecast Horizon
            </label>
            <select
              value={forecastHorizon}
              onChange={(e) => setForecastHorizon(e.target.value as ForecastHorizon)}
              className="w-full px-3 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-primary/50 transition-colors"
            >
              <option value="1month">1 Month</option>
              <option value="3months">3 Months (Quarterly)</option>
              <option value="6months">6 Months (Half-Yearly)</option>
              <option value="1year">1 Year (Annual)</option>
            </select>
          </div>
          
          {/* Aggregation Type */}
          <div>
            <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
              Aggregation Type
            </label>
            <select className="w-full px-3 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-primary/50 transition-colors">
              <option>Monthly Average</option>
              <option>Weekly Average</option>
              <option>Daily Max/Min</option>
              <option>Seasonal Trends</option>
            </select>
          </div>
          
          {/* Parameter */}
          <div>
            <label className="block text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-2">
              Parameter
            </label>
            <select className="w-full px-3 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-primary/50 transition-colors">
              <option>All Parameters</option>
              <option>Temperature</option>
              <option>Rainfall</option>
              <option>Humidity</option>
              <option>Wind Speed</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Planning Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Thermometer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
              Predicted Avg Temp
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{metrics.avgTemp}°C</div>
          <div className="text-[11px] text-muted-foreground">Next {forecastHorizon.replace('months', 'M').replace('month', 'M').replace('year', 'Y')}</div>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
              Expected Rainfall
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{metrics.rainfall}mm</div>
          <div className="text-[11px] text-muted-foreground">Total precipitation</div>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
              Confidence Level
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{metrics.confidence}%</div>
          <div className={`text-[11px] font-medium ${
            metrics.confidence >= 80 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-amber-600 dark:text-amber-400'
          }`}>
            {metrics.confidence >= 80 ? 'High confidence' : 'Moderate confidence'}
          </div>
        </div>
      </div>
      
      {/* Forecast Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-[13px] font-semibold text-foreground">
              Long-Term Forecast - {forecastHorizon.replace('months', ' Months').replace('month', ' Month').replace('year', ' Year')}
            </h4>
            <p className="text-[11px] text-muted-foreground mt-1">
              Smoothed area chart with confidence bands showing {forecastHorizon === "1year" ? "monthly" : "weekly"} aggregations
            </p>
          </div>
          <button className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center gap-2">
            <Download className="w-3 h-3" />
            Download Planning Data
          </button>
        </div>
        
        <div className="w-full h-[400px] bg-gradient-to-br from-muted/40 to-muted/10 rounded-lg border border-border flex items-center justify-center relative overflow-hidden">
          {/* Mock Confidence Band Visualization */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none">
              <defs>
                <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop key="conf-stop-start" offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
                  <stop key="conf-stop-end" offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.05 }} />
                </linearGradient>
              </defs>
              {/* Upper confidence bound */}
              <path 
                d="M 0 150 Q 200 120, 400 140 T 800 130" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                fill="none" 
                opacity="0.5"
                strokeDasharray="5,5"
              />
              {/* Central forecast line */}
              <path 
                d="M 0 200 Q 200 180, 400 190 T 800 185" 
                stroke="#3b82f6" 
                strokeWidth="3" 
                fill="none"
              />
              {/* Lower confidence bound */}
              <path 
                d="M 0 250 Q 200 240, 400 240 T 800 240" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                fill="none" 
                opacity="0.5"
                strokeDasharray="5,5"
              />
              {/* Confidence area fill */}
              <path 
                d="M 0 150 Q 200 120, 400 140 T 800 130 L 800 240 Q 600 240, 400 240 T 0 250 Z" 
                fill="url(#confidenceGradient)"
              />
            </svg>
          </div>
          
          <div className="text-center z-10">
            <div className="text-[13px] text-muted-foreground mb-2">Smoothed Area Chart with Confidence Bands</div>
            <div className="text-[11px] text-muted-foreground">
              {forecastHorizon === "1year" ? "Monthly" : forecastHorizon === "6months" ? "Bi-weekly" : "Weekly"} aggregated forecast visualization
            </div>
          </div>
        </div>
      </div>
      
      {/* Seasonal Breakdown */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h4 className="text-[13px] font-semibold text-foreground mb-4">Seasonal Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Spring', 'Summer', 'Monsoon', 'Winter'].map((season, index) => (
            <div key={season} className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="text-[11px] text-muted-foreground font-semibold mb-2">{season}</div>
              <div className="text-lg font-bold text-foreground">{28 + index * 3}°C</div>
              <div className="text-[10px] text-muted-foreground mt-1">{60 + index * 20}mm rain</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg px-4 py-3 flex items-start gap-3">
        <div className="w-1 h-1 bg-teal-500 rounded-full mt-1.5" />
        <div className="flex-1">
          <div className="text-[12px] font-medium text-foreground mb-1">Operational vs Strategic Separation</div>
          <div className="text-[11px] text-muted-foreground">
            This module separates short-term operational forecasting from long-term strategic planning. Smoothed visualizations avoid noisy live data, focusing on trend analysis for Annual Business Planning.
          </div>
        </div>
      </div>
    </div>
  );
}
