import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
  Label,
} from "recharts";
import {
  Zap,
  Clock,
  ToggleLeft,
  ToggleRight,
  CloudRain,
  Wind as WindIcon,
  AlertTriangle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   FORECAST vs ACTUAL ENERGY ESTIMATE
   Bar + Line overlay · Provider toggle · Event markers
   ═══════════════════════════════════════════════════ */

// Event annotation data
interface EventAnnotation {
  day: string;
  type: "cyclone" | "heavy_rain" | "high_wind";
  label: string;
  impact: string;
}

const EVENT_ANNOTATIONS: EventAnnotation[] = [
  { day: "Wed", type: "heavy_rain", label: "Heavy Rain", impact: "-12% output" },
  { day: "Fri", type: "cyclone", label: "Cyclone Alert", impact: "-28% output" },
];

function generateEnergyData(isSolar: boolean, comparePrevious: boolean) {
  const data: Record<string, any>[] = [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun

  for (let i = 0; i < 7; i++) {
    const dayIdx = (currentDay - 6 + i + 7) % 7;
    const label = days[dayIdx === 0 ? 6 : dayIdx - 1];
    const isPast = i < 6;

    // Check if this day has an event
    const event = EVENT_ANNOTATIONS.find(e => e.day === label);
    const impactFactor = event ? (event.type === "cyclone" ? 0.72 : 0.88) : 1.0;

    if (isSolar) {
      const baseForecast = 320 + Math.random() * 80;
      data.push({
        day: label,
        forecast: Math.round(baseForecast),
        actual: isPast
          ? Math.round(baseForecast * impactFactor + (Math.random() - 0.5) * 50)
          : null,
        previous: comparePrevious ? Math.round(baseForecast * 0.92 + (Math.random() - 0.5) * 40) : null,
        imd: Math.round(baseForecast * (0.96 + Math.random() * 0.08)),
        tomorrow_io: Math.round(baseForecast * (0.92 + Math.random() * 0.12)),
        hasEvent: !!event,
        eventType: event?.type,
      });
    } else {
      const baseForecast = 180 + Math.random() * 60;
      data.push({
        day: label,
        forecast: Math.round(baseForecast),
        actual: isPast
          ? Math.round(baseForecast * impactFactor + (Math.random() - 0.5) * 40)
          : null,
        previous: comparePrevious ? Math.round(baseForecast * 0.89 + (Math.random() - 0.5) * 35) : null,
        imd: Math.round(baseForecast * (0.95 + Math.random() * 0.1)),
        tomorrow_io: Math.round(baseForecast * (0.90 + Math.random() * 0.15)),
        hasEvent: !!event,
        eventType: event?.type,
      });
    }
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  
  const event = EVENT_ANNOTATIONS.find(e => e.day === label);
  
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-[12px]">
      <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>
      {event && (
        <div className="mb-2 pb-2 border-b border-border">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
            {event.type === "cyclone" ? (
              <WindIcon className="w-3 h-3" />
            ) : (
              <CloudRain className="w-3 h-3" />
            )}
            <span>{event.label}</span>
          </div>
          <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">{event.impact}</p>
        </div>
      )}
      {payload
        .filter((e: any) => e.value !== null)
        .map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="text-foreground font-semibold tabular-nums ml-auto">
              {entry.value} MWh
            </span>
          </div>
        ))}
    </div>
  );
};

interface EnergyEstimateChartProps {
  isSolar: boolean;
  comparePrevious?: boolean;
}

export function EnergyEstimateChart({ isSolar, comparePrevious = false }: EnergyEstimateChartProps) {
  const [showProviders, setShowProviders] = useState(false);
  const data = generateEnergyData(isSolar, comparePrevious);

  // Weekly totals
  const totalForecast = data.reduce((s, d) => s + d.forecast, 0);
  const totalActual = data
    .filter((d) => d.actual !== null)
    .reduce((s, d) => s + (d.actual ?? 0), 0);
  const totalPrevious = comparePrevious
    ? data.filter((d) => d.previous !== null).reduce((s, d) => s + (d.previous ?? 0), 0)
    : 0;

  return (
    <div className="rounded-xl border border-border bg-card transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-chart-1/10 ring-1 ring-chart-1/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-chart-1" />
          </div>
          <div>
            <h3 className="text-[14px] text-foreground font-medium">
              Forecast vs Actual — Energy
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Last 7 days · {isSolar ? "Solar Generation" : "Wind Generation"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Weekly totals */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Forecast</p>
              <p className="text-[14px] text-foreground tabular-nums">
                {totalForecast.toLocaleString()}{" "}
                <span className="text-[10px] text-muted-foreground">MWh</span>
              </p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Actual</p>
              <p className="text-[14px] text-foreground tabular-nums">
                {totalActual.toLocaleString()}{" "}
                <span className="text-[10px] text-muted-foreground">MWh</span>
              </p>
            </div>
            {comparePrevious && (
              <>
                <div className="w-px h-8 bg-border" />
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Previous</p>
                  <p className="text-[14px] text-foreground tabular-nums">
                    {totalPrevious.toLocaleString()}{" "}
                    <span className="text-[10px] text-muted-foreground">MWh</span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Provider overlay toggle */}
          <button
            onClick={() => setShowProviders(!showProviders)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
              showProviders
                ? "bg-chart-4/10 border-chart-4/20 text-chart-4"
                : "bg-secondary/50 border-border text-muted-foreground"
            }`}
          >
            {showProviders ? (
              <ToggleRight className="w-3.5 h-3.5" />
            ) : (
              <ToggleLeft className="w-3.5 h-3.5" />
            )}
            Providers
          </button>
        </div>
      </div>

      {/* Event Annotation Legend */}
      {EVENT_ANNOTATIONS.length > 0 && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Events:</span>
            {EVENT_ANNOTATIONS.map((event, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                {event.type === "cyclone" ? (
                  <WindIcon className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CloudRain className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                )}
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                  {event.day}: {event.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="px-2 pb-4 h-[280px]" style={{ minHeight: 280 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--chart-grid)"
              opacity={0.5}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              unit=" MWh"
              width={56}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={28}
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: 10 }}
            />

            <Bar
              dataKey="forecast"
              name="Forecast"
              fill="var(--chart-1)"
              fillOpacity={0.25}
              stroke="var(--chart-1)"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="var(--chart-3)"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />

            {comparePrevious && (
              <Line
                type="monotone"
                dataKey="previous"
                name="Previous Period"
                stroke="var(--chart-5)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                connectNulls={false}
              />
            )}

            {showProviders && (
              <>
                <Line
                  type="monotone"
                  dataKey="imd"
                  name="IMD"
                  stroke="var(--chart-4)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="6 3"
                />
                <Line
                  type="monotone"
                  dataKey="tomorrow_io"
                  name="Tomorrow.io"
                  stroke="var(--chart-2)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 4"
                />
              </>
            )}

            {/* Event annotation markers */}
            {data.map((d, idx) => {
              if (!d.hasEvent || d.actual === null) return null;
              return (
                <ReferenceDot
                  key={`event-${idx}`}
                  x={d.day}
                  y={d.actual}
                  r={6}
                  fill="var(--destructive)"
                  stroke="white"
                  strokeWidth={2}
                  opacity={0.9}
                />
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 pb-3 border-t border-border/60 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          Updated daily at 00:00 UTC
        </div>
        <span className="text-[10px] text-muted-foreground/70">
          Source: IMD + Tomorrow.io + Plant SCADA
        </span>
      </div>
    </div>
  );
}