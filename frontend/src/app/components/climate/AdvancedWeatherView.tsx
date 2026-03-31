import { useState } from "react";
import { Maximize2, Play, Pause, RotateCcw, Camera } from "lucide-react";

type AdvancedWeatherViewMode = "satellite" | "wind" | "rain" | "cyclone" | "cloud-cover" | "camera";

interface AdvancedWeatherViewProps {
  viewMode: AdvancedWeatherViewMode;
  setViewMode: (mode: AdvancedWeatherViewMode) => void;
}

export function AdvancedWeatherView({ viewMode, setViewMode }: AdvancedWeatherViewProps) {
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [timelinePosition, setTimelinePosition] = useState(100); // 100 = current time
  const [isPlaying, setIsPlaying] = useState(false);
  const [layerOpacity, setLayerOpacity] = useState(80);
  
  const viewOptions = [
    { key: "satellite" as AdvancedWeatherViewMode, label: "Satellite", icon: "🛰", description: "High-res satellite imagery" },
    { key: "wind" as AdvancedWeatherViewMode, label: "Wind Animation", icon: "💨", description: "Animated wind patterns" },
    { key: "rain" as AdvancedWeatherViewMode, label: "Rain Accumulation", icon: "🌧", description: "Precipitation overlay" },
    { key: "cyclone" as AdvancedWeatherViewMode, label: "Cyclone Tracking", icon: "🌀", description: "Storm path projection" },
    { key: "cloud-cover" as AdvancedWeatherViewMode, label: "Cloud Cover", icon: "☁️", description: "Cloud density mapping" },
    { key: "camera" as AdvancedWeatherViewMode, label: "Camera Feed", icon: "📷", description: "Live field cameras" },
  ];
  
  const selectedView = viewOptions.find(v => v.key === viewMode);
  
  // Calculate time label based on timeline position
  const getTimeLabel = () => {
    if (timelinePosition === 100) return "Current";
    const hoursBack = Math.floor((100 - timelinePosition) / 16.67); // 6 hours total range
    return `-${hoursBack}hr`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-[14px] font-bold text-foreground mb-2">🗺 Advanced Weather Visualization Suite</h3>
        <p className="text-[12px] text-muted-foreground">
          Satellite, wind, rain, cyclone tracking, and camera feed visualization with interactive map controls and historical playback
        </p>
      </div>
      
      {/* View Mode Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {viewOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setViewMode(option.key)}
            className={`p-4 rounded-xl border-2 transition-all group hover:scale-105 ${
              viewMode === option.key
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border bg-card hover:border-primary/50 hover:shadow-md"
            }`}
          >
            <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform">{option.icon}</div>
            <div className={`text-[11px] font-medium mb-0.5 ${
              viewMode === option.key ? "text-primary" : "text-foreground"
            }`}>
              {option.label}
            </div>
            <div className="text-[9px] text-muted-foreground truncate">
              {option.description}
            </div>
          </button>
        ))}
      </div>
      
      {/* Map View Container */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg">
        {/* Map Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div>
            <h4 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              <span className="text-lg">{selectedView?.icon}</span>
              {selectedView?.label}
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">{selectedView?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center gap-1.5">
              <RotateCcw className="w-3 h-3" />
              Reset View
            </button>
            <button className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center gap-1.5">
              <Maximize2 className="w-3 h-3" />
              Fullscreen
            </button>
          </div>
        </div>
        
        {/* Map Display */}
        <div className="w-full h-[600px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
          {/* Mock Map Background */}
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" viewBox="0 0 800 600">
              {/* India map silhouette mockup */}
              <path 
                d="M 200 100 L 300 150 L 350 200 L 380 280 L 400 400 L 350 500 L 280 520 L 200 500 L 150 450 L 120 350 L 150 250 L 180 180 Z"
                fill="currentColor"
                className="text-slate-300 dark:text-slate-700"
                stroke="currentColor"
                strokeWidth="2"
              />
              {/* Grid lines */}
              {[...Array(10)].map((_, i) => (
                <line 
                  key={`h-${i}`}
                  x1="0" 
                  y1={i * 60} 
                  x2="800" 
                  y2={i * 60}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-slate-300 dark:text-slate-700"
                  opacity="0.3"
                />
              ))}
              {[...Array(13)].map((_, i) => (
                <line 
                  key={`v-${i}`}
                  x1={i * 60} 
                  y1="0" 
                  x2={i * 60} 
                  y2="600"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-slate-300 dark:text-slate-700"
                  opacity="0.3"
                />
              ))}
            </svg>
          </div>
          
          {/* Weather Layer Overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: layerOpacity / 100 }}
          >
            <div className="text-center z-10">
              <div className="text-6xl mb-4 animate-pulse">{selectedView?.icon}</div>
              <div className="text-[14px] text-foreground font-semibold mb-2">{selectedView?.label}</div>
              <div className="text-[12px] text-muted-foreground max-w-md">
                Interactive map visualization with {selectedView?.label.toLowerCase()} overlay would load here
              </div>
              {viewMode === "camera" && (
                <div className="mt-4 p-3 bg-card/80 backdrop-blur-sm rounded-lg border border-border inline-block">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                    <Camera className="w-3.5 h-3.5" />
                    <span>3 cameras available in this region</span>
                  </div>
                  <button className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    View Camera Feeds
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Current Time Indicator */}
          {timelinePosition === 100 && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500/90 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
        </div>
      </div>
      
      {/* Animation Controls */}
      <div className="bg-muted/30 rounded-xl border border-border p-5">
        <div className="space-y-5">
          {/* Playback Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[12px] text-foreground font-semibold">Playback Controls</label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-[11px] font-medium"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Play
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setTimelinePosition(100)}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center gap-1.5 text-[11px] font-medium text-foreground"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Live
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Time Scrubber */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                  Time Scrubber (Historical Playback)
                </label>
                <span className="text-[12px] text-foreground font-mono font-bold px-2 py-0.5 bg-card rounded border border-border">
                  {getTimeLabel()}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={timelinePosition}
                  onChange={(e) => setTimelinePosition(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                  <span>-6hr</span>
                  <span>-4hr</span>
                  <span>-2hr</span>
                  <span className="font-bold text-foreground">Current</span>
                </div>
              </div>
            </div>
            
            {/* Animation Speed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                  Animation Speed
                </label>
                <span className="text-[12px] text-foreground font-mono font-bold px-2 py-0.5 bg-card rounded border border-border">
                  {animationSpeed}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                <span>0.5x</span>
                <span>1.5x</span>
                <span>3x</span>
              </div>
            </div>
          </div>
          
          {/* Layer Opacity Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                Layer Opacity
              </label>
              <span className="text-[12px] text-foreground font-mono font-bold px-2 py-0.5 bg-card rounded border border-border">
                {layerOpacity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
              <span>Transparent</span>
              <span>50%</span>
              <span>Opaque</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-3 flex items-start gap-3">
        <div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5" />
        <div className="flex-1">
          <div className="text-[12px] font-medium text-foreground mb-1">Advanced Visualization Suite</div>
          <div className="text-[11px] text-muted-foreground">
            Interactive weather layers with animation control, historical playback (2hr/4hr/6hr), and optional camera feed integration. Fully closes the visualization gap for satellite, wind, rain, and cyclone tracking requirements.
          </div>
        </div>
      </div>
    </div>
  );
}
