import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Wind, Clock } from "lucide-react";

/* ═══════════════════════════════════════════════════
   WIND PROFILE CHART — Speed across hub heights
   Height selector updates highlighted series
   ═══════════════════════════════════════════════════ */

interface WindProfileChartProps {
  selectedHeight: string;
  comparePrevious?: boolean;
}

// Mock wind data at different heights
const WIND_DATA = [
  { time: "00:00", "10m": 3.2, "50m": 5.8, "80m": 7.2, "100m": 8.1, "120m": 8.9, "150m": 9.8 },
  { time: "00:30", "10m": 3.4, "50m": 6.1, "80m": 7.5, "100m": 8.4, "120m": 9.2, "150m": 10.1 },
  { time: "01:00", "10m": 3.1, "50m": 5.9, "80m": 7.3, "100m": 8.2, "120m": 9.0, "150m": 9.9 },
  { time: "01:30", "10m": 2.9, "50m": 5.6, "80m": 7.0, "100m": 7.9, "120m": 8.7, "150m": 9.6 },
  { time: "02:00", "10m": 2.8, "50m": 5.4, "80m": 6.8, "100m": 7.7, "120m": 8.5, "150m": 9.4 },
  { time: "02:30", "10m": 2.7, "50m": 5.2, "80m": 6.6, "100m": 7.5, "120m": 8.3, "150m": 9.2 },
  { time: "03:00", "10m": 2.9, "50m": 5.5, "80m": 6.9, "100m": 7.8, "120m": 8.6, "150m": 9.5 },
  { time: "03:30", "10m": 3.2, "50m": 5.9, "80m": 7.3, "100m": 8.2, "120m": 9.0, "150m": 9.9 },
  { time: "04:00", "10m": 3.5, "50m": 6.3, "80m": 7.7, "100m": 8.6, "120m": 9.4, "150m": 10.3 },
  { time: "04:30", "10m": 3.8, "50m": 6.7, "80m": 8.1, "100m": 9.0, "120m": 9.8, "150m": 10.7 },
  { time: "05:00", "10m": 4.1, "50m": 7.1, "80m": 8.5, "100m": 9.4, "120m": 10.2, "150m": 11.1 },
  { time: "05:30", "10m": 4.3, "50m": 7.4, "80m": 8.8, "100m": 9.7, "120m": 10.5, "150m": 11.4 },
  { time: "06:00", "10m": 4.5, "50m": 7.7, "80m": 9.1, "100m": 10.0, "120m": 10.8, "150m": 11.7 },
  { time: "06:30", "10m": 4.8, "50m": 8.1, "80m": 9.5, "100m": 10.4, "120m": 11.2, "150m": 12.1 },
  { time: "07:00", "10m": 5.1, "50m": 8.5, "80m": 9.9, "100m": 10.8, "120m": 11.6, "150m": 12.5 },
  { time: "07:30", "10m": 5.3, "50m": 8.8, "80m": 10.2, "100m": 11.1, "120m": 11.9, "150m": 12.8 },
  { time: "08:00", "10m": 5.6, "50m": 9.2, "80m": 10.6, "100m": 11.5, "120m": 12.3, "150m": 13.2 },
  { time: "08:30", "10m": 5.8, "50m": 9.5, "80m": 10.9, "100m": 11.8, "120m": 12.6, "150m": 13.5 },
  { time: "09:00", "10m": 6.1, "50m": 9.9, "80m": 11.3, "100m": 12.2, "120m": 13.0, "150m": 13.9 },
  { time: "09:30", "10m": 6.3, "50m": 10.2, "80m": 11.6, "100m": 12.5, "120m": 13.3, "150m": 14.2 },
  { time: "10:00", "10m": 6.5, "50m": 10.5, "80m": 11.9, "100m": 12.8, "120m": 13.6, "150m": 14.5 },
  { time: "10:30", "10m": 6.7, "50m": 10.8, "80m": 12.2, "100m": 13.1, "120m": 13.9, "150m": 14.8 },
  { time: "11:00", "10m": 6.9, "50m": 11.1, "80m": 12.5, "100m": 13.4, "120m": 14.2, "150m": 15.1 },
  { time: "11:30", "10m": 7.1, "50m": 11.4, "80m": 12.8, "100m": 13.7, "120m": 14.5, "150m": 15.4 },
  { time: "12:00", "10m": 7.2, "50m": 11.6, "80m": 13.0, "100m": 13.9, "120m": 14.7, "150m": 15.6 },
];

// Color scheme for different heights
const HEIGHT_COLORS: Record<string, { stroke: string }> = {
  "10m": { stroke: "#94A3B8" },
  "50m": { stroke: "#3B82F6" },
  "80m": { stroke: "#10B981" },
  "100m": { stroke: "#F59E0B" },
  "120m": { stroke: "#8B5CF6" },
  "150m": { stroke: "#EF4444" },
};

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-[11px] text-muted-foreground mb-1.5">{label}</p>
      <div className="space-y-0.5">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-foreground">{entry.dataKey}:</span>
            <span className="text-[11px] font-medium tabular-nums" style={{ color: entry.color }}>
              {entry.value} m/s
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WindProfileChart({ selectedHeight, comparePrevious = false }: WindProfileChartProps) {
  const heights = ["10m", "50m", "80m", "100m", "120m", "150m"];

  // Current value at selected height
  const currentValue = useMemo(() => {
    const last = WIND_DATA[WIND_DATA.length - 1];
    return last?.[selectedHeight as keyof typeof last] ?? "—";
  }, [selectedHeight]);

  return (
    <div className="rounded-xl border border-border bg-card transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-chart-3/10 ring-1 ring-chart-3/20 flex items-center justify-center">
            <Wind className="w-4 h-4 text-chart-3" />
          </div>
          <div>
            <h3 className="text-[14px] text-foreground font-medium">
              Wind Profile — Multi-Height
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Speed across hub heights · 30-min resolution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-muted-foreground">
              Current @ {selectedHeight}
            </p>
            <p className="text-[16px] text-foreground tabular-nums">
              {currentValue} <span className="text-[11px] text-muted-foreground">m/s</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-4 h-[280px]" style={{ minHeight: 280 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
          <LineChart data={WIND_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
              unit=" m/s"
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={28}
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: 10 }}
            />

            {heights.map((h) => {
              const isSelected = h === selectedHeight;
              return (
                <Line
                  key={h}
                  type="monotone"
                  dataKey={h}
                  name={h}
                  stroke={HEIGHT_COLORS[h].stroke}
                  strokeWidth={isSelected ? 2.5 : 1}
                  strokeOpacity={isSelected ? 1 : 0.35}
                  dot={false}
                  strokeDasharray={isSelected ? undefined : "4 3"}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 pb-3 border-t border-border/60 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          Highlighted: {selectedHeight} hub height
        </div>
        <span className="text-[10px] text-muted-foreground/70">
          Source: IMD · Tomorrow.io · Muppandal Farm
        </span>
      </div>
    </div>
  );
}