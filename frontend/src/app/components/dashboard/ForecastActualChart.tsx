import { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { BarChart3, ToggleLeft, ToggleRight, Clock } from "lucide-react";

/* ═══════════════════════════════════════════════════
   FORECAST vs ACTUAL — 15-min resolution overlay
   ═══════════════════════════════════════════════════ */

// Generate 15-min resolution sample data for a full day (06:00 → 23:45)
function generate15MinData() {
  const data: {
    time: string;
    forecast: number;
    actual: number | null;
    deviation: number | null;
  }[] = [];

  const baseTemp = 28;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      const t = h + m / 60;
      // Simulated forecast curve (bell-shaped, peak around 14:00)
      const forecast =
        baseTemp + 10 * Math.sin(((t - 6) / 18) * Math.PI) + (Math.random() - 0.5) * 0.4;
      const fVal = Math.round(forecast * 10) / 10;

      // Actual data only up to current time
      const isPast = h < currentHour || (h === currentHour && m <= currentMinute);
      const actual = isPast
        ? Math.round((fVal + (Math.random() - 0.5) * 2.5) * 10) / 10
        : null;
      const deviation = actual !== null ? Math.round((actual - fVal) * 10) / 10 : null;

      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      data.push({ time: timeStr, forecast: fVal, actual, deviation });
    }
  }
  return data;
}

const CHART_DATA = generate15MinData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-[12px]">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-foreground">{entry.name}:</span>
          <span className="text-foreground font-semibold tabular-nums">
            {entry.value !== null ? `${entry.value}°C` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

interface ForecastActualChartProps {
  selectedUtility: string;
}

export function ForecastActualChart({ selectedUtility }: ForecastActualChartProps) {
  const [showForecast, setShowForecast] = useState(true);
  const [showActual, setShowActual] = useState(true);
  const [showDeviation, setShowDeviation] = useState(false);

  // Calculate accuracy metric
  const accuracy = useMemo(() => {
    const withActual = CHART_DATA.filter((d) => d.actual !== null);
    if (withActual.length === 0) return 0;
    const avgDev =
      withActual.reduce((s, d) => s + Math.abs(d.deviation ?? 0), 0) / withActual.length;
    return Math.round((1 - avgDev / 10) * 100);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[14px] text-foreground font-medium">
              Forecast vs Actual — Temperature
            </h3>
            <p className="text-[11px] text-muted-foreground">
              15-min resolution · {selectedUtility}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Accuracy badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-chart-3/10 border border-chart-3/20 rounded-lg">
            <span className="text-[11px] text-muted-foreground">Accuracy</span>
            <span className="text-[12px] text-chart-3 font-semibold tabular-nums">{accuracy}%</span>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForecast(!showForecast)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                showForecast
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-secondary/50 border-border text-muted-foreground"
              }`}
            >
              {showForecast ? (
                <ToggleRight className="w-3.5 h-3.5" />
              ) : (
                <ToggleLeft className="w-3.5 h-3.5" />
              )}
              Forecast
            </button>
            <button
              onClick={() => setShowActual(!showActual)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                showActual
                  ? "bg-chart-3/10 border-chart-3/20 text-chart-3"
                  : "bg-secondary/50 border-border text-muted-foreground"
              }`}
            >
              {showActual ? (
                <ToggleRight className="w-3.5 h-3.5" />
              ) : (
                <ToggleLeft className="w-3.5 h-3.5" />
              )}
              Actual
            </button>
            <button
              onClick={() => setShowDeviation(!showDeviation)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                showDeviation
                  ? "bg-chart-2/10 border-chart-2/20 text-chart-2"
                  : "bg-secondary/50 border-border text-muted-foreground"
              }`}
            >
              {showDeviation ? (
                <ToggleRight className="w-3.5 h-3.5" />
              ) : (
                <ToggleLeft className="w-3.5 h-3.5" />
              )}
              Deviation
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-4 h-[320px]" style={{ minHeight: 320 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
          <ComposedChart data={CHART_DATA} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--chart-grid)"
              opacity={0.5}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval={7}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              unit="°"
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Current time reference */}
            <ReferenceLine
              x={`${String(new Date().getHours()).padStart(2, "0")}:${String(
                Math.floor(new Date().getMinutes() / 15) * 15
              ).padStart(2, "0")}`}
              stroke="var(--primary)"
              strokeDasharray="4 4"
              opacity={0.5}
              label={{
                value: "Now",
                position: "top",
                fill: "var(--primary)",
                fontSize: 10,
              }}
            />

            {showDeviation && (
              <Area
                type="monotone"
                dataKey="deviation"
                name="Deviation"
                fill="var(--chart-2)"
                fillOpacity={0.15}
                stroke="var(--chart-2)"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                connectNulls={false}
              />
            )}

            {showForecast && (
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 3"
              />
            )}

            {showActual && (
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 pb-3 border-t border-border/60 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          Last updated: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <span className="text-[10px] text-muted-foreground/70">
          Source: IMD · Tomorrow.io · 15-min resolution
        </span>
      </div>
    </div>
  );
}