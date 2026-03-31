import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Target, TrendingUp, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { UTILITIES_DATA, DEFAULT_DATA } from "./mockData";

interface ForecastAccuracyProps {
  selectedUtility: string;
}

const getBarColor = (accuracy: number, target: number) => {
  if (accuracy >= target + 5) return "#10b981";
  if (accuracy >= target) return "#3b82f6";
  return "#ef4444";
};

export function ForecastAccuracy({ selectedUtility }: ForecastAccuracyProps) {
  const [mounted, setMounted] = useState(false);
  const data = UTILITIES_DATA[selectedUtility] || DEFAULT_DATA;
  const accuracyData = data.accuracy.data;
  const summary = data.accuracy;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 p-5 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-white font-semibold">Forecast Accuracy</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Last 30 days — {data.location.split("—")[0]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2 h-2 rounded-sm bg-emerald-500" />
            <span className="text-slate-400">Above</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2 h-2 rounded-sm bg-blue-500" />
            <span className="text-slate-400">On</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2 h-2 rounded-sm bg-red-500" />
            <span className="text-slate-400">Below</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 flex items-center gap-3 group hover:bg-emerald-500/20 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xl text-emerald-400 font-bold leading-tight tracking-tight">{summary.overall}</div>
            <div className="text-[10px] text-emerald-500/80 truncate font-medium">Overall</div>
          </div>
        </div>
        <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20 flex items-center gap-3 group hover:bg-blue-500/20 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xl text-blue-400 font-bold leading-tight tracking-tight">{summary.onTarget}</div>
            <div className="text-[10px] text-blue-500/80 truncate font-medium">On Target</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3 group hover:bg-white/10 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xl text-white font-bold leading-tight tracking-tight">{summary.vsLast}</div>
            <div className="text-[10px] text-slate-500 truncate font-medium">vs Last Mo.</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: 180, minHeight: 180 }}>
        {mounted ? (
        <ResponsiveContainer width="100%" height={180} minHeight={180}>
          <BarChart data={accuracyData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              domain={[60, 100]}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <YAxis
              type="category"
              dataKey="parameter"
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={65}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 12,
                color: "#e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number, _name: string, entry: any) => [
                `${value}% (Target: ${entry.payload.target}%)`,
                "Accuracy",
              ]}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={12}>
              {accuracyData.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.accuracy, entry.target)}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-[12px]">
            Loading chart…
          </div>
        )}
      </div>
    </div>
  );
}