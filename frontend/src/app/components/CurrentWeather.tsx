import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sun,
  CloudRain,
  Cloud,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { UTILITIES_DATA, DEFAULT_DATA } from "./mockData";

// Icon mapping helper
const iconMap: Record<string, React.ElementType> = {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sun,
  CloudRain,
  Cloud,
};

interface CurrentWeatherProps {
  selectedUtility: string;
}

export function CurrentWeather({ selectedUtility }: CurrentWeatherProps) {
  const data = UTILITIES_DATA[selectedUtility] || DEFAULT_DATA;
  const current = data.current;
  const ConditionIcon = iconMap[current.conditionIcon] || Cloud;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">Current Conditions</h2>
          <p className="text-[12px] text-slate-400 mt-1">
            {data.location}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
            <ConditionIcon className="w-4 h-4 text-blue-400" />
            <span className="text-[13px] text-slate-200 font-medium">
              {current.condition}
            </span>
          </div>
          <div className="hidden sm:block text-[12px] text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
            Feels like: <span className="text-white font-semibold ml-1">{current.feelsLike}°C</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {current.metrics.map((metric: any, index: number) => {
          const Icon = iconMap[metric.icon] || Cloud;
          return (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              unit={metric.unit}
              icon={<Icon className="w-4 h-4" />}
              trend={metric.trend}
              trendValue={metric.trendValue}
              trendLabel={metric.trendLabel}
              status={metric.status}
              subtitle={metric.subtitle}
            />
          );
        })}
      </div>
    </div>
  );
}
