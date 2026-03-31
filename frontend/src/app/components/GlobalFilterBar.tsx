import {
  Calendar,
  ChevronDown,
  Filter,
  MapPin,
  Settings2,
  RefreshCw,
  Search,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useRole, UTILITIES } from "./RoleContext";

interface GlobalFilterBarProps {
  onFilterChange?: (filters: any) => void;
  className?: string;
}

const PRESETS = ["Today", "Tomorrow", "Next 7 Days"];
const PARAMETERS = ["Temperature", "Rainfall", "Wind Speed", "Humidity", "AQI"];
const PROVIDERS = ["IMD", "Tomorrow.io"];

export function GlobalFilterBar({ onFilterChange, className = "" }: GlobalFilterBarProps) {
  const { activeUtility, setActiveUtility } = useRole();
  const [activePreset, setActivePreset] = useState("Today");
  const [activeProvider, setActiveProvider] = useState("IMD");
  const [selectedParams, setSelectedParams] = useState<string[]>(["Temperature"]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock Date
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={`sticky top-[64px] z-30 flex flex-col gap-2 bg-background/95 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3 transition-colors duration-300 ${className}`}>
      
      {/* Top Row: Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Location & Time */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Utility Selector */}
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg border border-border min-w-max">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-[13px] text-foreground font-medium">{activeUtility}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
          </div>

          <div className="w-px h-6 bg-border mx-1 hidden lg:block" />

          {/* Date Presets */}
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border min-w-max">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setActivePreset(preset)}
                className={`px-3 py-1 rounded-md text-[12px] transition-all font-medium ${
                  activePreset === preset
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Custom Date Picker Trigger */}
          <button className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg border border-border text-[12px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors min-w-max">
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateStr}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>

        {/* Right: Providers & Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Provider Selector */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg border border-border">
            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Source:</span>
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value)}
              className="bg-transparent text-[12px] text-primary font-medium border-none outline-none cursor-pointer"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p} className="bg-popover text-foreground">{p}</option>
              ))}
            </select>
          </div>

          <div className="w-px h-6 bg-border hidden md:block" />

          <button 
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-blue-900/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Update View</span>
          </button>

          <button 
             onClick={() => setShowFilters(!showFilters)}
             className={`p-2 rounded-lg border transition-colors ${showFilters ? 'bg-secondary border-primary/50 text-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {showFilters && (
        <div className="mt-2 pt-3 border-t border-border animate-in slide-in-from-top-2">
          <div className="flex flex-wrap items-center gap-4">
             <div className="flex items-center gap-2">
               <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Parameters:</span>
               <div className="flex flex-wrap gap-2">
                 {PARAMETERS.map(param => (
                   <button
                     key={param}
                     onClick={() => setSelectedParams(prev => prev.includes(param) ? prev.filter(p => p !== param) : [...prev, param])}
                     className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                        selectedParams.includes(param)
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-secondary/50 border-border text-muted-foreground hover:border-muted-foreground/50"
                     }`}
                   >
                     {selectedParams.includes(param) && <Check className="w-3 h-3" />}
                     {param}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
