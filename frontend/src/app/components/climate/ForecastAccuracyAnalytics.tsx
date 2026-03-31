import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  ChevronDown,
  Check,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════
   FORECAST ACCURACY ANALYTICS — Enterprise Edition
   Evaluates forecast vs actual weather data to measure prediction performance
   Accessible: Admin & Super Admin Only
   
   ✨ COMPREHENSIVE FORECAST ACCURACY SUITE:
   • Error Metrics Cards (MAE, RMSE, MAPE)
   • Forecast Error Trend Chart
   • Forecast Error Heatmap (Time × Parameters)
   • Forecast Accuracy Resolution Comparison (1min, 15min, 15day)
   ═══════════════════════════════════════════════════════════════════ */

type ForecastResolution = "1min" | "15min" | "15day";

// Mock Data: Error Metrics
const ERROR_METRICS = {
  mae: {
    current: 1.24,
    previous: 1.58,
    trend: "down" as const,
    label: "Mean Absolute Error",
    unit: "°C",
  },
  rmse: {
    current: 1.87,
    previous: 2.15,
    trend: "down" as const,
    label: "Root Mean Square Error",
    unit: "°C",
  },
  mape: {
    current: 3.42,
    previous: 4.21,
    trend: "down" as const,
    label: "Mean Absolute Percentage Error",
    unit: "%",
  },
};

// Mock Data: Forecast Error Trend (Last 14 days)
const FORECAST_ERROR_TREND = [
  { date: "Jan 1", error: 2.1 },
  { date: "Jan 2", error: 1.9 },
  { date: "Jan 3", error: 2.3 },
  { date: "Jan 4", error: 1.7 },
  { date: "Jan 5", error: 1.5 },
  { date: "Jan 6", error: 1.8 },
  { date: "Jan 7", error: 1.4 },
  { date: "Jan 8", error: 1.6 },
  { date: "Jan 9", error: 1.3 },
  { date: "Jan 10", error: 1.5 },
  { date: "Jan 11", error: 1.2 },
  { date: "Jan 12", error: 1.4 },
  { date: "Jan 13", error: 1.1 },
  { date: "Jan 14", error: 1.2 },
];

// Mock Data: Heatmap (Time periods × Weather parameters)
const HEATMAP_DATA = [
  // Temperature
  { parameter: "Temperature", "00-04": 0.8, "04-08": 1.2, "08-12": 1.5, "12-16": 2.1, "16-20": 1.8, "20-24": 1.1 },
  // Humidity
  { parameter: "Humidity", "00-04": 2.5, "04-08": 2.2, "08-12": 1.8, "12-16": 1.5, "16-20": 2.0, "20-24": 2.8 },
  // Rainfall
  { parameter: "Rainfall", "00-04": 3.2, "04-08": 2.8, "08-12": 2.1, "12-16": 1.9, "16-20": 2.5, "20-24": 3.5 },
  // Wind Speed
  { parameter: "Wind Speed", "00-04": 1.1, "04-08": 1.5, "08-12": 2.0, "12-16": 2.5, "16-20": 2.2, "20-24": 1.3 },
  // Pressure
  { parameter: "Pressure", "00-04": 0.5, "04-08": 0.7, "08-12": 0.9, "12-16": 1.1, "16-20": 0.8, "20-24": 0.6 },
  // Cloud Cover
  { parameter: "Cloud Cover", "00-04": 1.8, "04-08": 1.5, "08-12": 1.2, "12-16": 1.6, "16-20": 1.9, "20-24": 2.1 },
];

// Mock Data: Resolution Comparison
const RESOLUTION_COMPARISON = {
  "1min": { mae: 0.85, rmse: 1.12, mape: 2.31, accuracy: 94.2 },
  "15min": { mae: 1.24, rmse: 1.87, mape: 3.42, accuracy: 91.5 },
  "15day": { mae: 3.58, rmse: 4.92, mape: 9.85, accuracy: 78.3 },
};

// Helper: Get error color
function getErrorColor(error: number): string {
  if (error <= 1.5) return "bg-emerald-500";
  if (error <= 2.5) return "bg-yellow-500";
  return "bg-red-500";
}

// Helper: Get error opacity
function getErrorOpacity(error: number): string {
  if (error <= 1.0) return "opacity-30";
  if (error <= 1.5) return "opacity-50";
  if (error <= 2.0) return "opacity-70";
  if (error <= 2.5) return "opacity-85";
  return "opacity-100";
}

export function ForecastAccuracyAnalytics() {
  const [selectedResolution, setSelectedResolution] = useState<ForecastResolution>("15min");
  const [resolutionDropdownOpen, setResolutionDropdownOpen] = useState(false);

  const resolutionData = RESOLUTION_COMPARISON[selectedResolution];

  const resolutionOptions = [
    { value: "1min" as const, label: "1 Minute Forecast" },
    { value: "15min" as const, label: "15 Minute Forecast" },
    { value: "15day" as const, label: "15 Day Ahead Forecast" },
  ];

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-[20px] border border-blue-500/20 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-foreground">Forecast Accuracy Analytics</h2>
            <p className="text-[12px] text-muted-foreground">
              Evaluate prediction performance with forecast vs actual weather data
            </p>
          </div>
        </div>
      </div>

      {/* 1️⃣ Error Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MAE Card */}
        <div className="bg-card rounded-[20px] border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                {ERROR_METRICS.mae.label}
              </h3>
            </div>
          </div>
          <div className="mb-3">
            <span className="text-3xl font-bold text-foreground">
              {ERROR_METRICS.mae.current}
            </span>
            <span className="text-sm text-muted-foreground ml-1">{ERROR_METRICS.mae.unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              {ERROR_METRICS.mae.trend === "down" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span className="text-[12px] font-semibold">
                {((Math.abs(ERROR_METRICS.mae.current - ERROR_METRICS.mae.previous) / ERROR_METRICS.mae.previous) * 100).toFixed(1)}%
              </span>
            </div>
            <span className="text-[12px] text-muted-foreground">vs previous period</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Previous:</span>
              <span className="text-foreground font-medium">{ERROR_METRICS.mae.previous} {ERROR_METRICS.mae.unit}</span>
            </div>
          </div>
        </div>

        {/* RMSE Card */}
        <div className="bg-card rounded-[20px] border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/30">
              <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                {ERROR_METRICS.rmse.label}
              </h3>
            </div>
          </div>
          <div className="mb-3">
            <span className="text-3xl font-bold text-foreground">
              {ERROR_METRICS.rmse.current}
            </span>
            <span className="text-sm text-muted-foreground ml-1">{ERROR_METRICS.rmse.unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              {ERROR_METRICS.rmse.trend === "down" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span className="text-[12px] font-semibold">
                {((Math.abs(ERROR_METRICS.rmse.current - ERROR_METRICS.rmse.previous) / ERROR_METRICS.rmse.previous) * 100).toFixed(1)}%
              </span>
            </div>
            <span className="text-[12px] text-muted-foreground">vs previous period</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Previous:</span>
              <span className="text-foreground font-medium">{ERROR_METRICS.rmse.previous} {ERROR_METRICS.rmse.unit}</span>
            </div>
          </div>
        </div>

        {/* MAPE Card */}
        <div className="bg-card rounded-[20px] border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/30">
              <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                {ERROR_METRICS.mape.label}
              </h3>
            </div>
          </div>
          <div className="mb-3">
            <span className="text-3xl font-bold text-foreground">
              {ERROR_METRICS.mape.current}
            </span>
            <span className="text-sm text-muted-foreground ml-1">{ERROR_METRICS.mape.unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              {ERROR_METRICS.mape.trend === "down" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span className="text-[12px] font-semibold">
                {((Math.abs(ERROR_METRICS.mape.current - ERROR_METRICS.mape.previous) / ERROR_METRICS.mape.previous) * 100).toFixed(1)}%
              </span>
            </div>
            <span className="text-[12px] text-muted-foreground">vs previous period</span>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Previous:</span>
              <span className="text-foreground font-medium">{ERROR_METRICS.mape.previous} {ERROR_METRICS.mape.unit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2️⃣ Forecast Error Trend Chart */}
      <div className="bg-card rounded-[20px] border border-border p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-[14px] font-bold text-foreground mb-1">Forecast Error Trend</h3>
          <p className="text-[12px] text-muted-foreground">
            Daily forecast error over the last 14 days
          </p>
        </div>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={FORECAST_ERROR_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                label={{
                  value: "Error (°C)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#64748b", fontSize: 12, fontWeight: 600 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  padding: "8px 12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="error"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6" }}
                name="Forecast Error"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3️⃣ Forecast Error Heatmap */}
      <div className="bg-card rounded-[20px] border border-border p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-[14px] font-bold text-foreground mb-1">Forecast Error Heatmap</h3>
              <p className="text-[12px] text-muted-foreground">
                Error distribution across time intervals and weather parameters
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500 opacity-50" />
                <span className="text-muted-foreground">Low Error</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-yellow-500 opacity-70" />
                <span className="text-muted-foreground">Medium Error</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500 opacity-100" />
                <span className="text-muted-foreground">High Error</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground min-w-[140px]">
                  Parameter
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground min-w-[100px]">
                  00:00-04:00
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground min-w-[100px]">
                  04:00-08:00
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground min-w-[100px]">
                  08:00-12:00
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground min-w-[100px]">
                  12:00-16:00
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground min-w-[100px]">
                  16:00-20:00
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground min-w-[100px]">
                  20:00-24:00
                </th>
              </tr>
            </thead>
            <tbody>
              {HEATMAP_DATA.map((row, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{row.parameter}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-12 h-8 rounded flex items-center justify-center text-white text-[11px] font-semibold ${getErrorColor(
                          row["00-04"]
                        )} ${getErrorOpacity(row["00-04"])}`}
                      >
                        {row["00-04"].toFixed(1)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-12 h-8 rounded flex items-center justify-center text-white text-[11px] font-semibold ${getErrorColor(
                          row["04-08"]
                        )} ${getErrorOpacity(row["04-08"])}`}
                      >
                        {row["04-08"].toFixed(1)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-12 h-8 rounded flex items-center justify-center text-white text-[11px] font-semibold ${getErrorColor(
                          row["08-12"]
                        )} ${getErrorOpacity(row["08-12"])}`}
                      >
                        {row["08-12"].toFixed(1)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-12 h-8 rounded flex items-center justify-center text-white text-[11px] font-semibold ${getErrorColor(
                          row["12-16"]
                        )} ${getErrorOpacity(row["12-16"])}`}
                      >
                        {row["12-16"].toFixed(1)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-12 h-8 rounded flex items-center justify-center text-white text-[11px] font-semibold ${getErrorColor(
                          row["16-20"]
                        )} ${getErrorOpacity(row["16-20"])}`}
                      >
                        {row["16-20"].toFixed(1)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-12 h-8 rounded flex items-center justify-center text-white text-[11px] font-semibold ${getErrorColor(
                          row["20-24"]
                        )} ${getErrorOpacity(row["20-24"])}`}
                      >
                        {row["20-24"].toFixed(1)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4️⃣ Forecast Accuracy Resolution Comparison */}
      <div className="bg-card rounded-[20px] border border-border p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-[14px] font-bold text-foreground mb-1">Forecast Accuracy Resolution Comparison</h3>
            <p className="text-[12px] text-muted-foreground">
              Compare forecast accuracy across different time resolutions
            </p>
          </div>

          {/* Resolution Selector */}
          <div className="relative">
            <button
              onClick={() => setResolutionDropdownOpen(!resolutionDropdownOpen)}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-[12px] font-medium text-foreground flex items-center gap-2 transition-colors border border-border min-w-[200px] justify-between"
            >
              <span>{resolutionOptions.find((o) => o.value === selectedResolution)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${resolutionDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {resolutionDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setResolutionDropdownOpen(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-full bg-popover border border-border rounded-lg shadow-xl z-20 py-1">
                  {resolutionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedResolution(option.value);
                        setResolutionDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-[12px] hover:bg-secondary transition-colors flex items-center justify-between"
                    >
                      <span className="text-foreground font-medium">{option.label}</span>
                      {selectedResolution === option.value && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Resolution Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-lg border border-emerald-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">MAE</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{resolutionData.mae}</div>
            <div className="text-[11px] text-muted-foreground">°C</div>
          </div>

          <div className="bg-gradient-to-br from-sky-500/10 to-sky-600/10 rounded-lg border border-sky-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">RMSE</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{resolutionData.rmse}</div>
            <div className="text-[11px] text-muted-foreground">°C</div>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/10 rounded-lg border border-violet-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">MAPE</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{resolutionData.mape}</div>
            <div className="text-[11px] text-muted-foreground">%</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 rounded-lg border border-indigo-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{resolutionData.accuracy}</div>
            <div className="text-[11px] text-muted-foreground">%</div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30 p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[12px] font-semibold text-blue-900 dark:text-blue-100 mb-1">Resolution Insight</h4>
              <p className="text-[11px] text-blue-800 dark:text-blue-200">
                {selectedResolution === "1min" && "1-minute forecasts provide the highest accuracy with minimal error, ideal for immediate operational decisions."}
                {selectedResolution === "15min" && "15-minute forecasts balance accuracy and planning horizon, suitable for short-term grid management."}
                {selectedResolution === "15day" && "15-day ahead forecasts show higher variance but are essential for long-term capacity planning and resource allocation."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
