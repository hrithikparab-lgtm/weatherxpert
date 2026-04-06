import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { BarChart3, ToggleLeft, ToggleRight, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

/* ═══════════════════════════════════════════════════
   FORECAST vs ACTUAL — 15-min resolution overlay
   ═══════════════════════════════════════════════════ */

function generate15MinData() {
  const data: {
    time: string;
    forecast: number;
    actual: number | null;
    upper: number | null;
    lower: number | null;
    deviation: number | null;
  }[] = [];

  const baseTemp = 28;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Use a seeded approach so data is stable per render
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      const t = h + m / 60;
      // Bell-shaped forecast curve peaking around 14:00
      const forecast =
        baseTemp + 10 * Math.sin(((t - 6) / 18) * Math.PI) + (rand() - 0.5) * 0.6;
      const fVal = Math.round(forecast * 10) / 10;

      // Confidence band ±1.5°C
      const bandWidth = 1.2 + rand() * 0.6;
      const upper = Math.round((fVal + bandWidth) * 10) / 10;
      const lower = Math.round((fVal - bandWidth) * 10) / 10;

      const isPast =
        h < currentHour || (h === currentHour && m <= currentMinute);

      // Actual slightly deviates from forecast — more realistic pattern
      const deviation = isPast
        ? Math.round(((rand() - 0.5) * 3 + (t > 12 ? 0.8 : -0.3)) * 10) / 10
        : null;
      const actual = isPast ? Math.round((fVal + (deviation ?? 0)) * 10) / 10 : null;

      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      data.push({ time: timeStr, forecast: fVal, actual, upper: isPast ? upper : null, lower: isPast ? lower : null, deviation });
    }
  }
  return data;
}

const CHART_DATA = generate15MinData();

// Current time label for reference line
const nowHour = new Date().getHours();
const nowMin = Math.floor(new Date().getMinutes() / 15) * 15;
const NOW_LABEL = `${String(nowHour).padStart(2, "0")}:${String(nowMin).padStart(2, "0")}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const entries = payload.filter(
    (e: any) => e.dataKey !== "upper" && e.dataKey !== "lower" && e.value !== null
  );

  return (
    <div className="bg-popover border border-border rounded-xl shadow-xl px-3.5 py-2.5 text-[12px] min-w-[160px]">
      <p className="text-muted-foreground mb-2 font-semibold text-[11px] border-b border-border/60 pb-1.5">
        {label}
      </p>
      {entries.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
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
  const [showBand, setShowBand] = useState(true);

  const withActual = CHART_DATA.filter((d) => d.actual !== null);

  const accuracy = useMemo(() => {
    if (withActual.length === 0) return 0;
    const avgDev =
      withActual.reduce((s, d) => s + Math.abs(d.deviation ?? 0), 0) /
      withActual.length;
    return Math.round((1 - avgDev / 10) * 100);
  }, []);

  const maxTemp = useMemo(
    () => Math.max(...CHART_DATA.map((d) => d.forecast)),
    []
  );
  const currentActual = withActual[withActual.length - 1]?.actual ?? null;
  const currentForecast = withActual[withActual.length - 1]?.forecast ?? null;
  const currentDiff =
    currentActual !== null && currentForecast !== null
      ? Math.round((currentActual - currentForecast) * 10) / 10
      : null;

  const allTemps = CHART_DATA.flatMap((d) => [
    d.forecast,
    d.actual ?? d.forecast,
  ]);
  const yMin = Math.floor(Math.min(...allTemps) - 1);
  const yMax = Math.ceil(Math.max(...allTemps) + 1);

  return (
    <div className="rounded-xl border border-border bg-card transition-colors duration-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[14px] text-foreground font-semibold">
              Forecast vs Actual — Temperature
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              15-min resolution · {selectedUtility}
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <span className="text-[10px] text-muted-foreground font-medium">Accuracy</span>
            <span className="text-[13px] text-emerald-500 font-bold tabular-nums">{accuracy}%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <span className="text-[10px] text-muted-foreground font-medium">Peak</span>
            <span className="text-[13px] text-orange-500 font-bold tabular-nums">{maxTemp.toFixed(1)}°C</span>
          </div>
          {currentDiff !== null && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                currentDiff > 0
                  ? "bg-red-500/10 border-red-500/20"
                  : currentDiff < 0
                  ? "bg-blue-500/10 border-blue-500/20"
                  : "bg-muted/40 border-border"
              }`}
            >
              {currentDiff > 0 ? (
                <TrendingUp className="w-3 h-3 text-red-500" />
              ) : currentDiff < 0 ? (
                <TrendingDown className="w-3 h-3 text-blue-500" />
              ) : (
                <Minus className="w-3 h-3 text-muted-foreground" />
              )}
              <span className="text-[10px] text-muted-foreground font-medium">Now</span>
              <span
                className={`text-[13px] font-bold tabular-nums ${
                  currentDiff > 0
                    ? "text-red-500"
                    : currentDiff < 0
                    ? "text-blue-500"
                    : "text-muted-foreground"
                }`}
              >
                {currentDiff > 0 ? "+" : ""}
                {currentDiff}°
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toggle bar */}
      <div className="flex items-center gap-2 px-5 pb-3 flex-wrap">
        {[
          {
            key: "forecast",
            label: "Forecast",
            state: showForecast,
            toggle: () => setShowForecast(!showForecast),
            color: "primary",
          },
          {
            key: "actual",
            label: "Actual",
            state: showActual,
            toggle: () => setShowActual(!showActual),
            color: "emerald",
          },
          {
            key: "deviation",
            label: "Deviation",
            state: showDeviation,
            toggle: () => setShowDeviation(!showDeviation),
            color: "amber",
          },
          {
            key: "band",
            label: "Conf. Band",
            state: showBand,
            toggle: () => setShowBand(!showBand),
            color: "slate",
          },
        ].map(({ key, label, state, toggle, color }) => (
          <button
            key={key}
            onClick={toggle}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all duration-200 ${
              state
                ? color === "primary"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : color === "emerald"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : color === "amber"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400"
                : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {state ? (
              <ToggleRight className="w-3.5 h-3.5" />
            ) : (
              <ToggleLeft className="w-3.5 h-3.5" />
            )}
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="px-2 pb-2 flex-1" style={{ minHeight: 280 }}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart
            data={CHART_DATA}
            margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.08} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))", opacity: 0.4 }}
              interval={7}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              domain={[yMin, yMax]}
              unit="°"
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* "Now" reference line */}
            <ReferenceLine
              x={NOW_LABEL}
              stroke="hsl(var(--primary))"
              strokeDasharray="4 3"
              strokeOpacity={0.7}
              label={{
                value: "Now",
                position: "insideTopRight",
                fill: "hsl(var(--primary))",
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Confidence band */}
            {showBand && (
              <>
                <Area
                  type="monotone"
                  dataKey="upper"
                  name="Upper Band"
                  stroke="none"
                  fill="url(#bandGrad)"
                  dot={false}
                  connectNulls={false}
                  legendType="none"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  name="Lower Band"
                  stroke="none"
                  fill="white"
                  fillOpacity={0}
                  dot={false}
                  connectNulls={false}
                  legendType="none"
                  isAnimationActive={false}
                />
              </>
            )}

            {/* Deviation area */}
            {showDeviation && (
              <Area
                type="monotone"
                dataKey="deviation"
                name="Deviation"
                fill="#f59e0b"
                fillOpacity={0.12}
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                connectNulls={false}
              />
            )}

            {/* Forecast line */}
            {showForecast && (
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 3"
                connectNulls
              />
            )}

            {/* Actual line */}
            {showActual && (
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 pt-2 pb-4 border-t border-border/60 flex-wrap">
        {showForecast && (
          <div className="flex items-center gap-1.5">
            <svg width="20" height="8">
              <line x1="0" y1="4" x2="20" y2="4" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="6 3" />
            </svg>
            <span className="text-[11px] text-muted-foreground">Forecast</span>
          </div>
        )}
        {showActual && (
          <div className="flex items-center gap-1.5">
            <svg width="20" height="8">
              <line x1="0" y1="4" x2="20" y2="4" stroke="#10b981" strokeWidth="2.5" />
            </svg>
            <span className="text-[11px] text-muted-foreground">Actual</span>
          </div>
        )}
        {showBand && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm bg-primary/15 border border-primary/20" />
            <span className="text-[11px] text-muted-foreground">Confidence Band</span>
          </div>
        )}
        {showDeviation && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm bg-amber-500/20 border border-amber-500/30" />
            <span className="text-[11px] text-muted-foreground">Deviation</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          Updated:{" "}
          {new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
