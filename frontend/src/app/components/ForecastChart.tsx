import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { UTILITIES_DATA, DEFAULT_DATA } from "./mockData";

interface ForecastChartProps {
  selectedUtility: string;
}

const tabs = [
  { id: "temp", label: "Temp" },
  { id: "rainfall", label: "Rain" },
  { id: "combined", label: "Combined" },
];

export function ForecastChart({ selectedUtility }: ForecastChartProps) {
  const [activeTab, setActiveTab] = useState("combined");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  
  const data = UTILITIES_DATA[selectedUtility] || DEFAULT_DATA;
  const hourlyData = data.forecastHourly;
  
  const maxTemp = Math.max(...hourlyData.map((d: any) => Math.max(d.temp, d.feelsLike)));
  const minTemp = Math.min(...hourlyData.map((d: any) => Math.min(d.temp, d.feelsLike)));
  const yDomain = [Math.floor(minTemp - 2), Math.ceil(maxTemp + 2)];

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Theme-aware colors
  const isDark = resolvedTheme === 'dark';
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const axisColor = isDark ? "#94a3b8" : "#64748B"; // slate-400 : slate-500
  const tooltipBg = isDark ? "#1E293B" : "#FFFFFF"; // card color
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0";
  const tooltipText = isDark ? "#e2e8f0" : "#334155";
  
  // Chart colors
  const colorTemp = "var(--color-chart-5)"; // Red/Orange
  const colorRain = "var(--color-chart-1)"; // Blue
  const colorWind = "var(--color-chart-3)"; // Emerald/Green
  const colorFeelsLike = "var(--color-chart-2)"; // Amber

  return (
    <div className="bg-card backdrop-blur-sm rounded-xl border border-border p-5 h-full flex flex-col transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-foreground font-semibold">24-Hour Forecast</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Hourly weather parameters
          </p>
        </div>
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 self-start sm:self-auto border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-[11px] transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-blue-900/20 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full" style={{ height: 250, minHeight: 250 }}>
        {/* Gradients hoisted outside Recharts to prevent duplicate-key warnings */}
        <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden="true">
          <defs>
            <linearGradient id="fc-tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorTemp} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colorTemp} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fc-tempGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorTemp} stopOpacity={0.2} />
              <stop offset="95%" stopColor={colorTemp} stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
        {mounted ? (
        <ResponsiveContainer width="100%" height={250} minHeight={250}>
          {activeTab === "temp" ? (
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 10, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                domain={yDomain}
                unit="°C"
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: 8,
                  fontSize: 12,
                  color: tooltipText,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
                itemStyle={{ color: tooltipText }}
                labelStyle={{ color: axisColor, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke={colorTemp}
                fill="url(#fc-tempGrad)"
                strokeWidth={2}
                name="Temperature (°C)"
                activeDot={{ r: 4, strokeWidth: 0, fill: colorTemp }}
              />
              <Area
                type="monotone"
                dataKey="feelsLike"
                stroke={colorFeelsLike}
                fill="none"
                strokeWidth={2}
                strokeDasharray="4 4"
                name="Feels Like (°C)"
              />
            </AreaChart>
          ) : activeTab === "rainfall" ? (
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 10, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                unit="mm"
                width={30}
              />
              <Tooltip
                cursor={{ fill: gridColor }}
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: 8,
                  fontSize: 12,
                  color: tooltipText,
                }}
                labelStyle={{ color: axisColor, marginBottom: 4 }}
                itemStyle={{ color: tooltipText }}
              />
              <Bar
                dataKey="rainfall"
                fill={colorRain}
                radius={[4, 4, 0, 0]}
                name="Rainfall (mm)"
                barSize={24}
              />
            </BarChart>
          ) : (
            <ComposedChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                dy={10}
              />
              <YAxis
                yAxisId="temp"
                tick={{ fontSize: 10, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                domain={yDomain}
                unit="°C"
                width={30}
              />
              <YAxis
                yAxisId="rain"
                orientation="right"
                tick={{ fontSize: 10, fill: axisColor }}
                axisLine={false}
                tickLine={false}
                unit="mm"
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: 8,
                  fontSize: 12,
                  color: tooltipText,
                }}
                labelStyle={{ color: axisColor, marginBottom: 4 }}
                itemStyle={{ color: tooltipText }}
              />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: axisColor, paddingTop: 10 }}
              />
              <Area
                yAxisId="temp"
                type="monotone"
                dataKey="temp"
                stroke={colorTemp}
                fill="url(#fc-tempGrad2)"
                strokeWidth={2}
                name="Temp (°C)"
              />
              <Bar
                yAxisId="rain"
                dataKey="rainfall"
                fill={colorRain}
                radius={[3, 3, 0, 0]}
                name="Rain (mm)"
                opacity={0.8}
                barSize={16}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="wind"
                stroke={colorWind}
                strokeWidth={2}
                dot={false}
                name="Wind (km/h)"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[12px]">
            Initializing chart engine...
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-6 text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-chart-5 shadow-[0_0_8px_currentColor] text-chart-5" />
          <span className="text-muted-foreground">Max Temp:</span>
          <span className="text-foreground font-semibold">{maxTemp}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-chart-1 shadow-[0_0_8px_currentColor] text-chart-1" />
          <span className="text-muted-foreground">Total Rain:</span>
          <span className="text-foreground font-semibold">
             {hourlyData.reduce((acc: number, curr: any) => acc + curr.rainfall, 0).toFixed(1)}mm
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-chart-3 shadow-[0_0_8px_currentColor] text-chart-3" />
          <span className="text-muted-foreground">Max Wind:</span>
          <span className="text-foreground font-semibold">
            {Math.max(...hourlyData.map((d: any) => d.wind))} km/h
          </span>
        </div>
      </div>
    </div>
  );
}