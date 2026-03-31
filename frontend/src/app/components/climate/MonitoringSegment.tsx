import { useState } from "react";
import { Maximize2, RefreshCw, ExternalLink, AlertCircle } from "lucide-react";

export function MonitoringSegment() {
  const [awsDashboardEnabled, setAwsDashboardEnabled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  const handleFullscreen = () => {
    // Fullscreen logic would go here
    alert("Fullscreen mode would be activated here");
  };
  
  return (
    <div className="space-y-6">
      {/* AWS Dashboard Toggle Card */}
      <div className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-orange-500/10 rounded-lg">
                <ExternalLink className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-[13px] font-semibold text-foreground">AWS Dashboard View</h4>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Embed external AWS monitoring dashboard for integrated system visibility. Toggle to show/hide embedded iframe.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>Access Validated</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span>Iframe Embed</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setAwsDashboardEnabled(!awsDashboardEnabled)}
            className={`px-4 py-2.5 text-[12px] font-semibold rounded-lg transition-all shadow-sm ${
              awsDashboardEnabled
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-foreground hover:bg-muted/80 border border-border"
            }`}
          >
            {awsDashboardEnabled ? "Hide Dashboard" : "Show Dashboard"}
          </button>
        </div>
      </div>
      
      {/* AWS Dashboard Embed */}
      {awsDashboardEnabled && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-orange-500/5 to-orange-500/10">
            <div>
              <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                <span className="text-lg">🔗</span>
                AWS Monitoring Dashboard
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">External embedded dashboard view</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={handleFullscreen}
                className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                <Maximize2 className="w-3 h-3" />
                Fullscreen
              </button>
            </div>
          </div>
          
          {/* Dashboard Content Area */}
          <div className="p-6 bg-muted/20">
            {/* Access Control Validation Banner */}
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-3">
              <div className="mt-0.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-medium text-foreground mb-1">Access Control Validated</div>
                <div className="text-[10px] text-muted-foreground">
                  User authenticated with AWS dashboard API. Embedded content loaded with proper security headers.
                </div>
              </div>
            </div>
            
            {/* Embedded Dashboard Placeholder */}
            <div className="w-full h-[600px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden">
              {/* Mock AWS Dashboard Content */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" viewBox="0 0 800 600">
                  {/* Grid pattern */}
                  {[...Array(12)].map((_, i) => (
                    <line 
                      key={`h-${i}`}
                      x1="0" 
                      y1={i * 50} 
                      x2="800" 
                      y2={i * 50}
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-slate-400 dark:text-slate-600"
                    />
                  ))}
                  {[...Array(16)].map((_, i) => (
                    <line 
                      key={`v-${i}`}
                      x1={i * 50} 
                      y1="0" 
                      x2={i * 50} 
                      y2="600"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-slate-400 dark:text-slate-600"
                    />
                  ))}
                </svg>
              </div>
              
              <div className="text-center z-10 max-w-md">
                <div className="text-5xl mb-4">☁️</div>
                <div className="text-[14px] font-semibold text-foreground mb-2">AWS Dashboard Embed Area</div>
                <div className="text-[12px] text-muted-foreground mb-4">
                  External iframe would load here with proper authentication and CORS headers
                </div>
                
                {/* Mock Dashboard Stats */}
                <div className="grid grid-cols-3 gap-3 mt-6 text-left">
                  <div className="p-3 bg-card/60 backdrop-blur-sm rounded-lg border border-border">
                    <div className="text-[10px] text-muted-foreground mb-1">CPU Usage</div>
                    <div className="text-lg font-bold text-foreground">42%</div>
                  </div>
                  <div className="p-3 bg-card/60 backdrop-blur-sm rounded-lg border border-border">
                    <div className="text-[10px] text-muted-foreground mb-1">Memory</div>
                    <div className="text-lg font-bold text-foreground">67%</div>
                  </div>
                  <div className="p-3 bg-card/60 backdrop-blur-sm rounded-lg border border-border">
                    <div className="text-[10px] text-muted-foreground mb-1">Requests</div>
                    <div className="text-lg font-bold text-foreground">1.2k</div>
                  </div>
                </div>
                
                <div className="mt-4 text-[10px] text-muted-foreground">
                  🔒 Secure connection established
                </div>
              </div>
            </div>
            
            {/* Dashboard Info */}
            <div className="mt-4 flex items-start justify-between gap-4 p-3 bg-card rounded-lg border border-border">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-[11px] font-medium text-foreground mb-1">Integration Note</div>
                  <div className="text-[10px] text-muted-foreground">
                    AWS Dashboard integration requires proper iframe permissions and CORS configuration. Contact IT Support if dashboard doesn't load.
                  </div>
                </div>
              </div>
              <button className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
                Configure →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* When Dashboard is Hidden - Info Card */}
      {!awsDashboardEnabled && (
        <div className="bg-muted/30 rounded-xl border border-border p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <div className="text-[13px] font-medium text-foreground mb-2">AWS Dashboard Integration Available</div>
          <div className="text-[11px] text-muted-foreground max-w-md mx-auto mb-4">
            Enable AWS Dashboard view to embed external monitoring dashboard alongside your weather data visualization.
          </div>
          <button
            onClick={() => setAwsDashboardEnabled(true)}
            className="px-4 py-2 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Enable AWS Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
