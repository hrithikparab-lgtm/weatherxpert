import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Sun, Clock } from "lucide-react";
import { useId } from "react";

/* ═══════════════════════════════════════════════════
   SOLAR IRRADIANCE CHART — GHI / DNI / DHI trend
   ═══════════════════════════════════════════════════ */

// Generate 15-minute resolution data for a full day (06:00-18:00)
function generateIrradianceData() {
  const data: { time: string; GHI: number; DNI: number; DHI: number }[] = [];
  for (let h = 6; h <= 18; h++) {
    for (let m = 0; m < 60; m += 15) {
      const t = h + m / 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      
      // Peak irradiance around noon
      const solarAngle = Math.sin(((t - 6) / 12) * Math.PI);
      const GHI = Math.max(0, Math.round(1000 * solarAngle + (Math.random() - 0.5) * 50));
      const DNI = Math.max(0, Math.round(900 * solarAngle + (Math.random() - 0.5) * 60));
      const DHI = Math.max(0, Math.round(GHI * 0.15 + (Math.random() - 0.5) * 30));
      
      data.push({ time: timeStr, GHI, DNI, DHI });
    }
  }
  return data;
}

const IRRADIANCE_DATA = generateIrradianceData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-[12px]">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="text-foreground font-semibold tabular-nums ml-auto">
            {entry.value} W/m²
          </span>
        </div>
      ))}
    </div>
  );
};

interface SolarIrradianceChartProps {
  comparePrevious?: boolean;
}

export function SolarIrradianceChart({ comparePrevious = false }: SolarIrradianceChartProps) {
  const gradientId1 = useId();
  const gradientId2 = useId();
  
  // Peak values
  const peakGHI = Math.max(...IRRADIANCE_DATA.map((d) => d.GHI));
  const peakDNI = Math.max(...IRRADIANCE_DATA.map((d) => d.DNI));

  return (
    <div className="rounded-xl border border-border bg-card transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-chart-2/10 ring-1 ring-chart-2/20 flex items-center justify-center">
            <Sun className="w-4 h-4 text-chart-2" />
          </div>
          <div>
            <h3 className="text-[14px] text-foreground font-medium">
              Solar Irradiance — GHI / DNI / DHI
            </h3>
            <p className="text-[11px] text-muted-foreground">
              15-min resolution · Charanka Solar Park
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Peak GHI</p>
            <p className="text-[14px] text-foreground tabular-nums">
              {peakGHI}{" "}
              <span className="text-[10px] text-muted-foreground">W/m²</span>
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Peak DNI</p>
            <p className="text-[14px] text-foreground tabular-nums">
              {peakDNI}{" "}
              <span className="text-[10px] text-muted-foreground">W/m²</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-4 h-[280px] relative" style={{ minHeight: 280 }}>
        {/* Gradients hoisted outside Recharts to prevent duplicate-key warnings */}
        <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId1} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={gradientId2} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
          <ComposedChart
            data={IRRADIANCE_DATA}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
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
              unit=" W/m²"
              width={58}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={28}
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: 10 }}
            />

            <Area
              type="monotone"
              dataKey="GHI"
              name="GHI"
              fill={`url(#${gradientId1})`}
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="DNI"
              name="DNI"
              stroke="var(--chart-5)"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="6 3"
            />
            <Area
              type="monotone"
              dataKey="DHI"
              name="DHI"
              fill={`url(#${gradientId2})`}
              stroke="var(--chart-4)"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 pb-3 border-t border-border/60 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          Last updated:{" "}
          {new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <span className="text-[10px] text-muted-foreground/70">Source: Tomorrow.io API</span>
      </div>
    </div>
  );
}