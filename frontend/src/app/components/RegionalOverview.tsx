import {
  CloudSun,
  CloudRain,
  Sun,
  CloudLightning,
  Wind,
  Cloud,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

interface Region {
  id: string;
  name: string;
  type: string;
  temp: number;
  humidity: number;
  wind: number;
  rainfall: number;
  condition: string;
  conditionIcon: React.ReactNode;
  status: "normal" | "warning" | "critical";
  forecast: string;
  alertCount: number;
}

const regions: Region[] = [
  {
    id: "1",
    name: "Mumbai Distribution",
    type: "Urban Grid",
    temp: 34.2,
    humidity: 78,
    wind: 23,
    rainfall: 12.4,
    condition: "Partly Cloudy",
    conditionIcon: <CloudSun className="w-4 h-4" />,
    status: "warning",
    forecast: "Thunderstorm expected 14:00-17:00",
    alertCount: 2,
  },
  {
    id: "2",
    name: "Delhi Distribution",
    type: "Urban Grid",
    temp: 42.1,
    humidity: 35,
    wind: 15,
    rainfall: 0,
    condition: "Clear & Hot",
    conditionIcon: <Sun className="w-4 h-4" />,
    status: "critical",
    forecast: "Heat wave continues through Thursday",
    alertCount: 1,
  },
  {
    id: "3",
    name: "Jaisalmer Wind Farm",
    type: "Renewables",
    temp: 38.5,
    humidity: 28,
    wind: 52,
    rainfall: 0,
    condition: "Windy",
    conditionIcon: <Wind className="w-4 h-4" />,
    status: "warning",
    forecast: "High winds — turbine curtailment advisory",
    alertCount: 1,
  },
  {
    id: "4",
    name: "Charanka Solar Park",
    type: "Renewables",
    temp: 36.8,
    humidity: 42,
    wind: 18,
    rainfall: 0,
    condition: "Sunny",
    conditionIcon: <Sun className="w-4 h-4" />,
    status: "normal",
    forecast: "Excellent solar irradiance expected",
    alertCount: 0,
  },
  {
    id: "5",
    name: "Mundra UMPP",
    type: "Thermal",
    temp: 37.2,
    humidity: 65,
    wind: 20,
    rainfall: 0,
    condition: "Overcast",
    conditionIcon: <Cloud className="w-4 h-4" />,
    status: "normal",
    forecast: "Stable conditions, light rain tonight",
    alertCount: 0,
  },
  {
    id: "6",
    name: "Maithon Power",
    type: "Thermal",
    temp: 33.5,
    humidity: 72,
    wind: 12,
    rainfall: 5.2,
    condition: "Thunderstorm",
    conditionIcon: <CloudLightning className="w-4 h-4" />,
    status: "warning",
    forecast: "Heavy rain and lightning activity",
    alertCount: 1,
  },
];

const statusBadge = {
  normal: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  critical: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const statusDot = {
  normal: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  warning: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
  critical: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
};

interface RegionalOverviewProps {
  selectedUtility: string;
}

export function RegionalOverview({ selectedUtility }: RegionalOverviewProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-white/5">
        <div>
          <h3 className="text-white font-semibold">Regional Overview</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            All monitored locations
          </p>
        </div>
        <button className="text-[12px] text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors font-medium">
          <span className="hidden sm:inline">View All Regions</span>
          <span className="sm:hidden">All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mobile: Card layout / Desktop: Table */}
      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-white/5">
        {regions.map((region) => {
          const isSelected = region.name === selectedUtility;
          return (
            <div 
              key={region.id} 
              className={`p-4 transition-colors cursor-pointer ${isSelected ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'hover:bg-white/5 border-l-2 border-l-transparent'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${statusDot[region.status]}`} />
                  <div>
                    <div className="text-[13px] text-white font-medium">{region.name}</div>
                    <div className="text-[10px] text-slate-500">{region.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${statusBadge[region.status]} text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide`}>
                    {region.status.toUpperCase()}
                  </span>
                  {region.alertCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{region.alertCount}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-3 bg-white/5 px-2 py-1.5 rounded-lg inline-flex">
                <span className="text-blue-400">{region.conditionIcon}</span>
                {region.condition}
              </div>
              <div className="grid grid-cols-4 gap-2 text-[11px] mb-3">
                <div>
                  <div className="text-slate-500 mb-0.5">Temp</div>
                  <div className="text-white font-semibold">{region.temp}°C</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">Humidity</div>
                  <div className="text-slate-300">{region.humidity}%</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">Wind</div>
                  <div className="text-slate-300">{region.wind} km/h</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">Rain</div>
                  <div className="text-slate-300">{region.rainfall > 0 ? `${region.rainfall}mm` : "—"}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 truncate italic">{region.forecast}</div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="text-left px-5 py-3 text-[11px] text-slate-400 font-semibold tracking-wider">
                Location
              </th>
              <th className="text-left px-4 py-3 text-[11px] text-slate-400 font-semibold tracking-wider">
                Condition
              </th>
              <th className="text-right px-4 py-3 text-[11px] text-slate-400 font-semibold tracking-wider">
                Temp
              </th>
              <th className="text-right px-4 py-3 text-[11px] text-slate-400 font-semibold tracking-wider">
                Humidity
              </th>
              <th className="text-right px-4 py-3 text-[11px] text-slate-400 font-semibold tracking-wider">
                Wind
              </th>
              <th className="text-right px-4 py-3 text-[11px] text-slate-400 font-semibold tracking-wider">
                Rain (24h)
              </th>
              <th className="text-left px-4 py-3 text-[11px] text-slate-400 font-semibold tracking-wider">
                Status
              </th>
              <th className="text-left px-5 py-3 text-[11px] text-slate-400 font-semibold tracking-wider">
                Forecast
              </th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => {
              const isSelected = region.name === selectedUtility;
              return (
                <tr
                  key={region.id}
                  className={`border-t border-white/5 cursor-pointer transition-colors group ${
                    isSelected ? "bg-blue-600/10 hover:bg-blue-600/15" : "hover:bg-white/5"
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${statusDot[region.status]}`} />
                      <div>
                        <div className={`text-[13px] font-medium ${isSelected ? "text-blue-200" : "text-slate-200 group-hover:text-white"}`}>
                          {region.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{region.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-[12px] text-slate-400">
                      <span className="text-blue-400">{region.conditionIcon}</span>
                      {region.condition}
                    </div>
                  </td>
                  <td className="text-right px-4 py-4 text-[13px] text-slate-200 font-semibold tabular-nums">
                    {region.temp}°C
                  </td>
                  <td className="text-right px-4 py-4 text-[13px] text-slate-400 tabular-nums">
                    {region.humidity}%
                  </td>
                  <td className="text-right px-4 py-4 text-[13px] text-slate-400 tabular-nums">
                    {region.wind} km/h
                  </td>
                  <td className="text-right px-4 py-4 text-[13px] text-slate-400 tabular-nums">
                    {region.rainfall > 0 ? `${region.rainfall}mm` : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`${statusBadge[region.status]} text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide`}
                      >
                        {region.status.toUpperCase()}
                      </span>
                      {region.alertCount > 0 && (
                        <span className="flex items-center gap-0.5 text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{region.alertCount}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[11px] text-slate-500 max-w-[200px] truncate group-hover:text-slate-400 transition-colors">
                    {region.forecast}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
