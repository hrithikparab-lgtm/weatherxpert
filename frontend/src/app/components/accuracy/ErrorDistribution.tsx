import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PROVIDERS, type ErrorBin } from "./accuracyData";

/* ═══════════════════════════════════════════════════
   ERROR DISTRIBUTION — Histogram of error magnitudes
   Per-provider bars · Grouped by error bin
   ═══════════════════════════════════════════════════ */

interface ErrorDistributionProps {
  data: ErrorBin[];
  selectedProviders: Set<string>;
}

export function ErrorDistribution({ data, selectedProviders }: ErrorDistributionProps) {
  const [mounted, setMounted] = useState(false);
  const visibleProviders = PROVIDERS.filter((p) => selectedProviders.has(p.id));

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/60 bg-secondary/10">
        <h4 className="text-[12px] text-foreground font-medium">Error Distribution</h4>
        <p className="text-[9px] text-muted-foreground mt-0.5">
          Frequency histogram of absolute forecast errors (°C bins)
        </p>
      </div>

      <div className="px-4 py-3">
        <div className="h-[240px]" style={{ minHeight: 240 }}>
          {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={240}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" opacity={0.5} vertical={false} />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Error (°C)", position: "insideBottom", offset: -2, fontSize: 9, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Count", angle: -90, position: "insideLeft", offset: 20, fontSize: 9, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 11,
                  color: "var(--foreground)",
                }}
                formatter={(value: number, name: string) => {
                  const prov = PROVIDERS.find((p) => p.id === name);
                  return [`${value} occurrences`, prov?.name ?? name];
                }}
              />
              <Legend
                verticalAlign="top"
                height={30}
                iconSize={8}
                wrapperStyle={{ fontSize: 10 }}
                formatter={(value: string) => {
                  const prov = PROVIDERS.find((p) => p.id === value);
                  return prov?.name ?? value;
                }}
              />
              {visibleProviders.map((provider) => (
                <Bar
                  key={provider.id}
                  dataKey={provider.id}
                  name={provider.id}
                  fill={provider.color}
                  fillOpacity={0.75}
                  radius={[3, 3, 0, 0]}
                  barSize={14}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          ) : null}
        </div>
      </div>
    </div>
  );
}