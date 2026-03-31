import React from "react";

/**
 * Global SVG Definitions for Recharts and Shared Aesthetic Constants
 * Inject <ChartGlobalDefs /> once at the root of the app.
 */
export const ChartGlobalDefs = () => (
  <svg width="0" height="0" className="absolute pointer-events-none">
    <defs>
      <filter id="shadowLight" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
      </filter>
      <filter id="shadowMedium" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.2" />
      </filter>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Area / line chart fills */}
      <linearGradient id="colorGHI" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.6} />
        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="colorDHI" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="colorDNI" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.6} />
        <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="colorRainfall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.6} />
        <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
      </linearGradient>

      {/* Bar gradients */}
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.9} />
        <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
      </linearGradient>
      <linearGradient id="indigo-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.5} />
      </linearGradient>
      <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#34d399" stopOpacity={0.5} />
      </linearGradient>
      <linearGradient id="amber-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.5} />
      </linearGradient>

      {/* Scatter radial gradient */}
      <radialGradient id="scatterGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
      </radialGradient>
    </defs>
  </svg>
);

export const tooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--card) / 0.85)",
  backdropFilter: "blur(12px)",
  border: "1px solid hsl(var(--border) / 0.5)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  color: "hsl(var(--foreground))",
};

export const glassCardClass =
  "relative overflow-hidden bg-white/60 dark:bg-[#151e32]/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ring-1 ring-black/5 dark:ring-white/5 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] duration-300";

export const glassGlow = (
  null
);
