import {
  CloudSun,
  CloudRain,
  Sun,
  CloudLightning,
  Cloud,
  Droplets,
  Wind,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { UTILITIES_DATA, DEFAULT_DATA } from "./mockData";

// Icon map helper
const iconMap: Record<string, React.ElementType> = {
  CloudSun,
  CloudRain,
  Sun,
  CloudLightning,
  Cloud,
};

interface SevenDayForecastProps {
  selectedUtility: string;
}

export function SevenDayForecast({ selectedUtility }: SevenDayForecastProps) {
  const data = UTILITIES_DATA[selectedUtility] || DEFAULT_DATA;
  const forecast = data.forecastDaily;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">7-Day Forecast</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {data.location} — Extended outlook
          </p>
        </div>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="overflow-x-auto custom-scrollbar -mx-5 md:mx-0 px-5 md:px-0 pb-2">
        <div className="flex md:grid md:grid-cols-7 gap-3 min-w-[560px] md:min-w-0">
          {forecast.map((day: any, i: number) => {
            const Icon = iconMap[day.icon] || Cloud;
            // Determine icon color based on icon type name for visual pop
            let iconColor = "text-slate-400";
            if (day.icon === "Sun") iconColor = "text-amber-400";
            if (day.icon === "CloudSun") iconColor = "text-amber-500";
            if (day.icon === "CloudRain") iconColor = "text-blue-400";
            if (day.icon === "CloudLightning") iconColor = "text-purple-400";

            return (
              <div
                key={day.date}
                className={`rounded-xl p-3 text-center flex-shrink-0 w-[80px] md:w-auto transition-all duration-300 cursor-pointer border ${
                  i === 0
                    ? "bg-blue-600/10 border-blue-500/30 shadow-lg shadow-blue-900/10"
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                <div className={`text-[12px] ${i === 0 ? "text-white font-semibold" : "text-slate-300 font-medium"}`}>
                  {day.day}
                </div>
                <div className="text-[10px] text-slate-500 mb-3">{day.date}</div>
                <div className="flex justify-center mb-3 transform transition-transform hover:scale-110 duration-300">
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div className="text-[11px] text-slate-400 mb-3 truncate font-medium">{day.condition}</div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ArrowUp className="w-2.5 h-2.5 text-red-400" />
                  <span className="text-[13px] text-white font-semibold">
                    {day.high}°
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <ArrowDown className="w-2.5 h-2.5 text-blue-400" />
                  <span className="text-[12px] text-slate-500">{day.low}°</span>
                </div>
                <div className="border-t border-white/5 pt-3 space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    {day.rainProbability}%
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                    <Wind className="w-3 h-3 text-emerald-400" />
                    {day.wind}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
