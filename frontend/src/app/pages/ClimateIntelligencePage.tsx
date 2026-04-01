import React, { useState, useMemo } from "react";
import { useRole } from "../components/RoleContext";
import {
  TrendingUp,
  TrendingDown,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  AlertCircle,
  Activity,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Cell,
  ReferenceLine,
  ComposedChart,
  Customized,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { tooltipStyle, glassCardClass, glassGlow } from "../components/ChartGlobalDefs";
import { MonitoringSegment } from "../components/climate/MonitoringSegment";
import { AccuracyPerformanceLab } from "../components/climate/AccuracyPerformanceLab";
import { LongTermPlanningModule } from "../components/climate/LongTermPlanningModule";
import { AdvancedWeatherView } from "../components/climate/AdvancedWeatherView";
import { SolarIntelligenceDashboard } from "../components/climate/SolarIntelligenceDashboard";
import { ForecastAccuracyAnalytics } from "../components/climate/ForecastAccuracyAnalytics";

// Types
type UtilityType = "Mumbai Distribution" | "Renewable" | "Solar" | "Wind" | "Hybrid";
type TimeRange = "Today" | "7 Days" | "30 Days";
type ForecastHorizon = "1 Min" | "15 Min" | "Day Ahead" | "15 Day";
type Parameter = "Temperature" | "Wind" | "Irradiance" | "Humidity";
type Provider = "IMD" | "Tomorrow.io";

// Location data mapping based on utility type
const locationsByUtility: Record<UtilityType, string[]> = {
  "Mumbai Distribution": [
    "Bandra Grid Station",
    "Kurla Distribution Center",
    "Andheri Substation",
    "Borivali Transformer Hub",
    "Colaba Control Room",
    "Dadar Power Station"
  ],
  "Renewable": [
    "Jaisalmer Solar Park",
    "Kutch Wind Farm",
    "Gujarat Hybrid Plant",
    "Rajasthan Solar Zone",
    "Maharashtra Wind Corridor",
    "Tamil Nadu Renewable Hub"
  ],
  "Solar": [
    "Jaisalmer Solar Park",
    "Bhadla Solar Park",
    "Pavagada Solar Park",
    "Rewa Ultra Mega Solar",
    "Kamuthi Solar Plant",
    "Gujarat Solar Farm"
  ],
  "Wind": [
    "Kutch Wind Farm",
    "Jaisalmer Wind Park",
    "Tamil Nadu Wind Corridor",
    "Gujarat Wind Zone",
    "Maharashtra Wind Belt",
    "Karnataka Wind Farm"
  ],
  "Hybrid": [
    "Gujarat Hybrid Plant",
    "Rajasthan Hybrid Park",
    "Karnataka Hybrid Zone",
    "Andhra Pradesh Hybrid Hub",
    "Tamil Nadu Hybrid Facility",
    "Maharashtra Hybrid Station"
  ]
};

// Available weather data providers
const weatherProviders: Provider[] = [
  "IMD",
  "Tomorrow.io"
];

// Mock data generators
const generateForecastVsActualData = (provider: Provider, location: string, parameter: Parameter) => {
  const locationSeed = location.length;
  const paramBase = parameter === "Temperature" ? 25 : parameter === "Wind" ? 12 : parameter === "Irradiance" ? 600 : 70;
  // Weaving pattern: lines cross over each other at different time points
  const imdSwing = [1.0, -0.6, 0.8, -0.4, 0.3, -0.7];
  const tomSwing = [-0.8, 0.9, -0.3, 0.7, -0.5, 1.0];
  const actSwing = [0.2, 0.1, 0.5, -0.1, 0.6, 0.0];

  const amplitude = parameter === "Temperature" ? 8 : parameter === "Wind" ? 5 : parameter === "Irradiance" ? 100 : 12;
  const baseMuls = [0.88, 0.82, 0.98, 1.18, 1.10, 0.94];
  const times = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

  const swing = provider === "IMD" ? imdSwing : tomSwing;

  return times.map((time, i) => {
    const base = paramBase * baseMuls[i] + locationSeed * 0.85;
    return {
      time,
      forecast: Number((base + swing[i] * amplitude).toFixed(1)),
      actual: Number((base + actSwing[i] * amplitude).toFixed(1)),
    };
  });
};

const generateForecastDriftData = (horizon: ForecastHorizon, provider: Provider, location: string, parameter: Parameter) => {
  const providerAccuracy = provider === "Tomorrow.io" ? 0.98 : 0.92;
  const locationSeed = location.length % 10;
  
  // Parameter base values
  const paramBase = {
    "Temperature": 25,
    "Wind": 12,
    "Irradiance": 800,
    "Humidity": 65
  }[parameter];
  
  // Horizon impact - longer horizons have more drift
  const horizonDrift = {
    "1 Min": 0.02,
    "15 Min": 0.05,
    "Day Ahead": 0.15,
    "15 Day": 0.35
  }[horizon];

  return [
    {
      time: "00:00",
      "15Day": Number((paramBase * (0.95 + locationSeed * 0.01)).toFixed(1)),
      "7Day": Number((paramBase * (0.97 + locationSeed * 0.005)).toFixed(1)),
      "DayAhead": Number((paramBase * providerAccuracy * (0.98 + locationSeed * 0.003)).toFixed(1)),
      "Intraday": Number((paramBase * providerAccuracy * (0.99 + locationSeed * 0.002)).toFixed(1)),
      actual: Number((paramBase * (1.0 + locationSeed * 0.002)).toFixed(1))
    },
    {
      time: "04:00",
      "15Day": Number((paramBase * 0.85 * (0.92 + locationSeed * 0.01)).toFixed(1)),
      "7Day": Number((paramBase * 0.85 * (0.95 + locationSeed * 0.005)).toFixed(1)),
      "DayAhead": Number((paramBase * 0.85 * providerAccuracy * (0.97 + locationSeed * 0.003)).toFixed(1)),
      "Intraday": Number((paramBase * 0.85 * providerAccuracy * (0.98 + locationSeed * 0.002)).toFixed(1)),
      actual: Number((paramBase * 0.85 * (1.0 + locationSeed * 0.002)).toFixed(1))
    },
    {
      time: "08:00",
      "15Day": Number((paramBase * 1.05 * (0.93 + locationSeed * 0.01)).toFixed(1)),
      "7Day": Number((paramBase * 1.05 * (0.96 + locationSeed * 0.005)).toFixed(1)),
      "DayAhead": Number((paramBase * 1.05 * providerAccuracy * (0.98 + locationSeed * 0.003)).toFixed(1)),
      "Intraday": Number((paramBase * 1.05 * providerAccuracy * (0.99 + locationSeed * 0.002)).toFixed(1)),
      actual: Number((paramBase * 1.05 * (1.0 + locationSeed * 0.002)).toFixed(1))
    },
    {
      time: "12:00",
      "15Day": Number((paramBase * 1.25 * (0.90 + locationSeed * 0.01)).toFixed(1)),
      "7Day": Number((paramBase * 1.25 * (0.94 + locationSeed * 0.005)).toFixed(1)),
      "DayAhead": Number((paramBase * 1.25 * providerAccuracy * (0.97 + locationSeed * 0.003)).toFixed(1)),
      "Intraday": Number((paramBase * 1.25 * providerAccuracy * (0.98 + locationSeed * 0.002)).toFixed(1)),
      actual: Number((paramBase * 1.25 * (1.0 + locationSeed * 0.002)).toFixed(1))
    },
    {
      time: "16:00",
      "15Day": Number((paramBase * 1.15 * (0.92 + locationSeed * 0.01)).toFixed(1)),
      "7Day": Number((paramBase * 1.15 * (0.95 + locationSeed * 0.005)).toFixed(1)),
      "DayAhead": Number((paramBase * 1.15 * providerAccuracy * (0.98 + locationSeed * 0.003)).toFixed(1)),
      "Intraday": Number((paramBase * 1.15 * providerAccuracy * (0.99 + locationSeed * 0.002)).toFixed(1)),
      actual: Number((paramBase * 1.15 * (1.0 + locationSeed * 0.002)).toFixed(1))
    },
    {
      time: "20:00",
      "15Day": Number((paramBase * 0.95 * (0.93 + locationSeed * 0.01)).toFixed(1)),
      "7Day": Number((paramBase * 0.95 * (0.96 + locationSeed * 0.005)).toFixed(1)),
      "DayAhead": Number((paramBase * 0.95 * providerAccuracy * (0.98 + locationSeed * 0.003)).toFixed(1)),
      "Intraday": Number((paramBase * 0.95 * providerAccuracy * (0.99 + locationSeed * 0.002)).toFixed(1)),
      actual: Number((paramBase * 0.95 * (1.0 + locationSeed * 0.002)).toFixed(1))
    },
  ];
};

const generateDiurnalPatternData = (location: string, timeRange: TimeRange) => {
  const isSolar = location.includes("Solar") || location.includes("Jaisalmer");
  const isCoastal = location.includes("Mumbai") || location.includes("Coastal");

  const tempBase = isSolar ? 28 : isCoastal ? 24 : 22;
  const humidityBase = isCoastal ? 80 : isSolar ? 35 : 60;
  const windBase = location.includes("Wind") ? 15 : isCoastal ? 8 : 6;

  return [
    { hour: "00", temperature: tempBase - 8, humidity: humidityBase + 15, windSpeed: windBase - 3 },
    { hour: "04", temperature: tempBase - 10, humidity: humidityBase + 20, windSpeed: windBase - 4 },
    { hour: "08", temperature: tempBase - 4, humidity: humidityBase, windSpeed: windBase },
    { hour: "12", temperature: tempBase + 8, humidity: humidityBase - 25, windSpeed: windBase + 4 },
    { hour: "16", temperature: tempBase + 6, humidity: humidityBase - 20, windSpeed: windBase + 2 },
    { hour: "20", temperature: tempBase - 2, humidity: humidityBase + 5, windSpeed: windBase - 1 },
  ];
};

const generateCloudImpactData = (location: string) => {
  const data = [];
  const locationFactor = location.includes("Solar") ? 1.2 : 1.0;

  for (let i = 0; i < 80; i++) {
    const cloudCover = Math.random() * 100;
    const baseIrradiance = 1000 - (cloudCover * 8);
    data.push({
      cloudCover: Number(cloudCover.toFixed(1)),
      irradiance: Math.max(50, Number((baseIrradiance * locationFactor + (Math.random() * 100 - 50)).toFixed(1))),
    });
  }
  return data;
};

// Box Plot data generator for Distribution Analysis
// Generate time labels based on horizon
const getHorizonLabels = (horizon: ForecastHorizon): string[] => {
  switch (horizon) {
    case "1 Min":
      return Array.from({ length: 13 }, (_, i) => `${i * 5}s`);
    case "15 Min":
      return Array.from({ length: 16 }, (_, i) => `${i}m`);
    case "Day Ahead":
      return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
    case "15 Day":
      return Array.from({ length: 15 }, (_, i) => `${i + 1}`);
    default:
      return [];
  }
};

const generateBoxPlotData = (parameter: Parameter, horizon: ForecastHorizon) => {
  const labels = getHorizonLabels(horizon);
  const paramConfig: Record<Parameter, { base: number; range: number; unit: string }> = {
    "Temperature": { base: 28, range: 12, unit: "°C" },
    "Wind": { base: 12, range: 8, unit: "m/s" },
    "Irradiance": { base: 650, range: 300, unit: "W/m²" },
    "Humidity": { base: 65, range: 30, unit: "%" },
  };
  const cfg = paramConfig[parameter];
  const horizonNoise = horizon === "1 Min" ? 0.6 : horizon === "15 Min" ? 0.8 : horizon === "Day Ahead" ? 1.0 : 1.3;
  const n = labels.length;

  const seed = (s: number) => {
    const x = Math.sin(s * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };

  return labels.map((label, i) => {
    const phase = (i / (n - 1)) * Math.PI * 2;
    const seasonal = Math.sin(phase) * cfg.range * 0.25;

    const fMedian = cfg.base + seasonal;
    const fSpread = cfg.range * 0.15 * horizonNoise;
    const fQ1 = fMedian - fSpread * (0.8 + seed(i * 7) * 0.4);
    const fQ3 = fMedian + fSpread * (0.8 + seed(i * 11) * 0.4);
    const fMin = fQ1 - fSpread * (0.6 + seed(i * 3) * 0.5);
    const fMax = fQ3 + fSpread * (0.6 + seed(i * 5) * 0.5);
    const fMean = fMedian + (seed(i * 13) - 0.5) * fSpread * 0.3;

    const aMedian = fMedian + (seed(i * 17) - 0.5) * fSpread * 0.8;
    const aSpread = fSpread * (0.9 + seed(i * 19) * 0.3);
    const aQ1 = aMedian - aSpread * (0.8 + seed(i * 23) * 0.4);
    const aQ3 = aMedian + aSpread * (0.8 + seed(i * 29) * 0.4);
    const aMin = aQ1 - aSpread * (0.6 + seed(i * 31) * 0.5);
    const aMax = aQ3 + aSpread * (0.6 + seed(i * 37) * 0.5);
    const aMean = aMedian + (seed(i * 41) - 0.5) * aSpread * 0.3;

    const r = (v: number) => Math.round(v * 10) / 10;

    return {
      label,
      fMin: r(fMin), fQ1: r(fQ1), fMedian: r(fMedian), fMean: r(fMean), fQ3: r(fQ3), fMax: r(fMax),
      aMin: r(aMin), aQ1: r(aQ1), aMedian: r(aMedian), aMean: r(aMean), aQ3: r(aQ3), aMax: r(aMax),
    };
  });
};



const generateGHIData = (location: string, timeRange: TimeRange) => {
  const peakGHI = location.includes("Jaisalmer") ? 900 :
    location.includes("Gujarat") ? 850 :
      location.includes("Tamil Nadu") ? 820 : 850;

  return [
    { time: "06:00", GHI: peakGHI * 0.12, DHI: peakGHI * 0.05, DNI: peakGHI * 0.07 },
    { time: "08:00", GHI: peakGHI * 0.35, DHI: peakGHI * 0.14, DNI: peakGHI * 0.21 },
    { time: "10:00", GHI: peakGHI * 0.71, DHI: peakGHI * 0.24, DNI: peakGHI * 0.47 },
    { time: "12:00", GHI: peakGHI, DHI: peakGHI * 0.29, DNI: peakGHI * 0.71 },
    { time: "14:00", GHI: peakGHI * 0.88, DHI: peakGHI * 0.26, DNI: peakGHI * 0.62 },
    { time: "16:00", GHI: peakGHI * 0.53, DHI: peakGHI * 0.18, DNI: peakGHI * 0.35 },
    { time: "18:00", GHI: peakGHI * 0.18, DHI: peakGHI * 0.07, DNI: peakGHI * 0.11 },
  ];
};

const generateHeatmapData = (provider: Provider, location: string, parameter: Parameter) => {
  const parameters = ["Temperature", "Wind", "Humidity", "Irradiance"];
  const times = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
  const data: any[] = [];

  const providerFactor = {
    "IMD": 1.0,
    "Tomorrow.io": 0.6
  }[provider];

  const locationSeed = location.length;

  times.forEach((time, tIdx) => {
    parameters.forEach((param, pIdx) => {
      const baseError = Math.abs(Math.sin(tIdx * pIdx + locationSeed) * 8);
      const paramBonus = param === parameter ? 0.6 : 1.0;
      data.push({
        time,
        parameter: param,
        error: baseError * providerFactor * paramBonus,
      });
    });
  });

  return data;
};

const generateCorrelationData = () => [
  { param1: "Temperature", param2: "Humidity", correlation: -0.75 },
  { param1: "Temperature", param2: "Wind", correlation: 0.45 },
  { param1: "Temperature", param2: "Solar", correlation: 0.82 },
  { param1: "Humidity", param2: "Wind", correlation: -0.35 },
  { param1: "Humidity", param2: "Solar", correlation: -0.68 },
  { param1: "Wind", param2: "Solar", correlation: 0.25 },
];

// ── Distribution Box Plot Section ──
function DistributionBoxPlotSection({
  parameter,
  forecastHorizon,
  glassCardClass,
  glassGlow,
  tooltipStyle,
}: {
  parameter: Parameter;
  forecastHorizon: ForecastHorizon;
  glassCardClass: string;
  glassGlow: React.ReactNode;
  tooltipStyle: React.CSSProperties;
}) {
  const [boxHorizon, setBoxHorizon] = useState<ForecastHorizon>(forecastHorizon);
  const [showForecast, setShowForecast] = useState(true);
  const [showActual, setShowActual] = useState(true);

  const data = useMemo(() => generateBoxPlotData(parameter, boxHorizon), [parameter, boxHorizon]);

  const unitMap: Record<Parameter, string> = {
    "Temperature": "°C",
    "Wind": "m/s",
    "Irradiance": "W/m²",
    "Humidity": "%",
  };
  const unit = unitMap[parameter];

  const horizons: ForecastHorizon[] = ["1 Min", "15 Min", "Day Ahead", "15 Day"];

  // Compute Y domain
  const allVals = data.flatMap(d => [
    ...(showForecast ? [d.fMin, d.fMax] : []),
    ...(showActual ? [d.aMin, d.aMax] : []),
  ]);
  const yMin = Math.floor(Math.min(...allVals) - 2);
  const yMax = Math.ceil(Math.max(...allVals) + 2);

  const forecastColor = "#818cf8";
  const actualColor = "#f9a847";

  // Custom tooltip
  const BoxPlotTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={tooltipStyle} className="!px-3 !py-2.5 min-w-[200px]">
        <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {showForecast && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: forecastColor }} />
                <span className="text-[10px] font-semibold text-foreground">Forecast</span>
              </div>
              <div className="space-y-0.5 text-[10px] text-muted-foreground">
                <p>Max: <span className="text-foreground font-medium">{d.fMax}{unit}</span></p>
                <p>Q3: <span className="text-foreground font-medium">{d.fQ3}{unit}</span></p>
                <p>Mean: <span className="text-foreground font-medium">{d.fMean}{unit}</span></p>
                <p>Median: <span className="text-foreground font-medium">{d.fMedian}{unit}</span></p>
                <p>Q1: <span className="text-foreground font-medium">{d.fQ1}{unit}</span></p>
                <p>Min: <span className="text-foreground font-medium">{d.fMin}{unit}</span></p>
              </div>
            </div>
          )}
          {showActual && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: actualColor }} />
                <span className="text-[10px] font-semibold text-foreground">Actual</span>
              </div>
              <div className="space-y-0.5 text-[10px] text-muted-foreground">
                <p>Max: <span className="text-foreground font-medium">{d.aMax}{unit}</span></p>
                <p>Q3: <span className="text-foreground font-medium">{d.aQ3}{unit}</span></p>
                <p>Mean: <span className="text-foreground font-medium">{d.aMean}{unit}</span></p>
                <p>Median: <span className="text-foreground font-medium">{d.aMedian}{unit}</span></p>
                <p>Q1: <span className="text-foreground font-medium">{d.aQ1}{unit}</span></p>
                <p>Min: <span className="text-foreground font-medium">{d.aMin}{unit}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={glassCardClass}
    >
      {glassGlow}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Distribution Analysis</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {parameter} box plot · Forecast vs Actual · {boxHorizon} horizon
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Horizon pills */}
            <div className="flex items-center gap-1 bg-background/40 backdrop-blur-sm rounded-lg p-0.5 border border-border/40">
              {horizons.map(h => (
                <button
                  key={h}
                  onClick={() => setBoxHorizon(h)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                    boxHorizon === h
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend toggles */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`flex items-center gap-2 text-[11px] font-medium transition-all ${showForecast ? "opacity-100" : "opacity-40"}`}
          >
            <span className="w-3 h-3 rounded-sm border-2 flex items-center justify-center" style={{ borderColor: forecastColor, background: showForecast ? forecastColor + "25" : "transparent" }}>
              {showForecast && <span className="w-1.5 h-1.5 rounded-[1px]" style={{ background: forecastColor }} />}
            </span>
            <span className="text-foreground">Forecast</span>
          </button>
          <button
            onClick={() => setShowActual(!showActual)}
            className={`flex items-center gap-2 text-[11px] font-medium transition-all ${showActual ? "opacity-100" : "opacity-40"}`}
          >
            <span className="w-3 h-3 rounded-sm border-2 flex items-center justify-center" style={{ borderColor: actualColor, background: showActual ? actualColor + "25" : "transparent" }}>
              {showActual && <span className="w-1.5 h-1.5 rounded-[1px]" style={{ background: actualColor }} />}
            </span>
            <span className="text-foreground">Actual</span>
          </button>

          {/* Legend key */}
          <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-4 h-[2.5px] bg-muted-foreground rounded-full" /> Median
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rotate-45 bg-muted-foreground" /> Mean
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border border-muted-foreground rounded-[2px] bg-muted-foreground/10" /> IQR
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval={data.length > 16 ? 1 : 0} angle={data.length > 16 ? -45 : 0} textAnchor={data.length > 16 ? "end" : "middle"} height={data.length > 16 ? 45 : 30} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[yMin, yMax]}
                tickFormatter={(v: number) => `${v}`}
                label={{ value: unit, position: "insideTopLeft", offset: -5, style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }}
              />
              <Tooltip content={<BoxPlotTooltip />} />

              {/* Invisible line to establish scale — hidden */}
              <Line dataKey="fMedian" stroke="transparent" dot={false} isAnimationActive={false} legendType="none" />

              {/* Custom rendered box plots */}
              <Customized
                component={(rechartProps: any) => {
                  const { xAxisMap, yAxisMap, offset: chartOffset } = rechartProps;
                  if (!xAxisMap || !yAxisMap) return null;
                  const xAxis = Object.values(xAxisMap)[0] as any;
                  const yAxis = Object.values(yAxisMap)[0] as any;
                  if (!xAxis?.scale || !yAxis?.scale) return null;

                  const yScale = yAxis.scale;
                  const bandWidth = xAxis.bandSize || (xAxis.width / data.length);
                  const boxW = showForecast && showActual ? bandWidth * 0.3 : bandWidth * 0.45;
                  const gap = 4;

                  return (
                    <g>
                      {data.map((d, i) => {
                        const cx = (xAxis.scale(d.label) ?? 0) + (xAxis.bandSize ? xAxis.bandSize / 2 : 0);
                        const renderBox = (prefix: "f" | "a", color: string, offsetX: number) => {
                          const min = d[`${prefix}Min` as keyof typeof d] as number;
                          const q1 = d[`${prefix}Q1` as keyof typeof d] as number;
                          const median = d[`${prefix}Median` as keyof typeof d] as number;
                          const mean = d[`${prefix}Mean` as keyof typeof d] as number;
                          const q3 = d[`${prefix}Q3` as keyof typeof d] as number;
                          const max = d[`${prefix}Max` as keyof typeof d] as number;

                          const yOfVal = (v: number) => yScale(v) as number;
                          const bx = cx + offsetX - boxW / 2;
                          const whiskerW = boxW * 0.45;
                          const bcx = cx + offsetX;

                          return (
                            <g key={`${prefix}-${i}`}>
                              {/* Box Q1-Q3 */}
                              <rect
                                x={bx}
                                y={yOfVal(q3)}
                                width={boxW}
                                height={yOfVal(q1) - yOfVal(q3)}
                                fill={color}
                                fillOpacity={0.18}
                                stroke={color}
                                strokeWidth={1.8}
                                rx={2}
                              />
                              {/* Median line */}
                              <line
                                x1={bx} y1={yOfVal(median)} x2={bx + boxW} y2={yOfVal(median)}
                                stroke={color} strokeWidth={2} strokeLinecap="round"
                              />
                              {/* Mean diamond */}
                              <polygon
                                points={`${bcx},${yOfVal(mean) - 4} ${bcx + 4.5},${yOfVal(mean)} ${bcx},${yOfVal(mean) + 4} ${bcx - 4.5},${yOfVal(mean)}`}
                                fill={color} fillOpacity={0.9}
                              />
                              {/* Upper whisker */}
                              <line x1={bcx} y1={yOfVal(q3)} x2={bcx} y2={yOfVal(max)} stroke={color} strokeWidth={1.2} strokeDasharray="4 3" />
                              <line x1={bcx - whiskerW / 2} y1={yOfVal(max)} x2={bcx + whiskerW / 2} y2={yOfVal(max)} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
                              {/* Lower whisker */}
                              <line x1={bcx} y1={yOfVal(q1)} x2={bcx} y2={yOfVal(min)} stroke={color} strokeWidth={1.2} strokeDasharray="4 3" />
                              <line x1={bcx - whiskerW / 2} y1={yOfVal(min)} x2={bcx + whiskerW / 2} y2={yOfVal(min)} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
                            </g>
                          );
                        };

                        const halfGap = gap / 2;
                        return (
                          <g key={i}>
                            {showForecast && renderBox("f", forecastColor, showActual ? -boxW / 2 - halfGap : 0)}
                            {showActual && renderBox("a", actualColor, showForecast ? boxW / 2 + halfGap : 0)}
                          </g>
                        );
                      })}
                    </g>
                  );
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {(() => {
            const latest = data[data.length - 1];
            const stats = [
              { label: "Forecast Spread", value: `${(latest.fMax - latest.fMin).toFixed(1)}${unit}`, sub: "Max − Min" },
              { label: "Actual Spread", value: `${(latest.aMax - latest.aMin).toFixed(1)}${unit}`, sub: "Max − Min" },
              { label: "Median Δ", value: `${Math.abs(latest.fMedian - latest.aMedian).toFixed(1)}${unit}`, sub: "Forecast vs Actual" },
              { label: "IQR Ratio", value: `${((latest.fQ3 - latest.fQ1) / (latest.aQ3 - latest.aQ1)).toFixed(2)}`, sub: "Forecast / Actual" },
            ];
            return stats.map((s, i) => (
              <div key={i} className="bg-background/30 backdrop-blur-sm rounded-lg px-3 py-2.5 border border-border/30">
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{s.value}</p>
                <p className="text-[9px] text-muted-foreground">{s.sub}</p>
              </div>
            ));
          })()}
        </div>
      </div>
    </motion.div>
  );
}

export function ClimateIntelligencePage() {
  const { activeUtility } = useRole();

  const utilityType = (activeUtility || "Mumbai Distribution") as UtilityType;

  const availableLocations = useMemo(() => {
    return locationsByUtility[utilityType] || locationsByUtility["Mumbai Distribution"];
  }, [utilityType]);

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState<string>(availableLocations[0]);
  const [selectedProvider, setSelectedProvider] = useState<Provider>("IMD");
  const [timeRange, setTimeRange] = useState<TimeRange>("7 Days");
  const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizon>("Day Ahead");
  const [parameter, setParameter] = useState<Parameter>("Temperature");
  const [diurnalParam, setDiurnalParam] = useState<'temperature' | 'humidity' | 'windSpeed'>('temperature');

  // Forecast vs Actual chart specific states
  const [comparisonMode, setComparisonMode] = useState<"single" | "multiple">("single");
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>(["IMD"]);
  const [chartLocation, setChartLocation] = useState<string>(availableLocations[0]);
  const [chartParameter, setChartParameter] = useState<Parameter>("Temperature");
  const [chartTimeRange, setChartTimeRange] = useState<TimeRange>("7 Days");

  // Dropdown states for chart filters
  const [chartLocationDropdownOpen, setChartLocationDropdownOpen] = useState(false);
  const [chartParameterDropdownOpen, setChartParameterDropdownOpen] = useState(false);
  const [chartTimeRangeDropdownOpen, setChartTimeRangeDropdownOpen] = useState(false);
  const [multiProviderDropdownOpen, setMultiProviderDropdownOpen] = useState(false);

  useMemo(() => {
    setSelectedLocation(availableLocations[0]);
    setChartLocation(availableLocations[0]);
  }, [availableLocations]);

  // Dropdown states
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [timeRangeDropdownOpen, setTimeRangeDropdownOpen] = useState(false);
  const [forecastHorizonDropdownOpen, setForecastHorizonDropdownOpen] = useState(false);
  const [parameterDropdownOpen, setParameterDropdownOpen] = useState(false);

  // Tab navigation state
  const [activeMainTab, setActiveMainTab] = useState<"monitoring" | "insights" | "advanced">("monitoring");
  const [activeInsightsTab, setActiveInsightsTab] = useState<"accuracy" | "longterm">("accuracy");
  const [advancedViewMode, setAdvancedViewMode] = useState<"satellite" | "wind" | "rain" | "cyclone" | "cloud-cover" | "camera">("satellite");
  const [forecastHorizonABP, setForecastHorizonABP] = useState<"1month" | "3months" | "6months" | "1year">("1month");

  const showSolarFeatures = useMemo(() => {
    return utilityType === "Renewable" || utilityType === "Solar" || utilityType === "Hybrid";
  }, [utilityType]);

  const accuracyMetrics = useMemo(() => {
    const baseMAE = 2.1;
    const baseRMSE = 3.4;
    const baseMAPE = 8.2;

    const providerFactor = selectedProvider === "Tomorrow.io" ? 0.8 : 1.0;
    const horizonFactor = forecastHorizon === "1 Min" ? 0.5 : forecastHorizon === "15 Min" ? 0.7 : forecastHorizon === "Day Ahead" ? 1.0 : 1.8;
    const paramFactor = parameter === "Temperature" ? 1.0 : parameter === "Wind" ? 1.2 : parameter === "Irradiance" ? 0.9 : 1.1;

    return {
      mae: {
        value: Number((baseMAE * providerFactor * horizonFactor * paramFactor).toFixed(1)),
        unit: parameter === "Temperature" ? "°C" : parameter === "Wind" ? "m/s" : parameter === "Irradiance" ? "W/m²" : "%",
        trend: -0.3,
        isUp: false
      },
      rmse: {
        value: Number((baseRMSE * providerFactor * horizonFactor * paramFactor).toFixed(1)),
        unit: parameter === "Temperature" ? "°C" : parameter === "Wind" ? "m/s" : parameter === "Irradiance" ? "W/m²" : "%",
        trend: -0.5,
        isUp: false
      },
      mape: {
        value: Number((baseMAPE * providerFactor * horizonFactor * paramFactor).toFixed(1)),
        unit: "%",
        trend: 1.1,
        isUp: true
      },
    };
  }, [selectedProvider, parameter, forecastHorizon]);

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900/50 relative">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20 z-0" />

      <div className="relative z-10 h-full">
        {/* Global Filter Bar — LOCKED */}
        <div className="sticky top-0 z-20 bg-white/60 dark:bg-[#0B1221]/60 backdrop-blur-2xl border-b border-white/20 dark:border-white/10 shadow-sm">
          <div className="sticky top-0 z-20 px-6 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-xl font-semibold text-foreground">Weather Trend</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Deep analysis of weather patterns and forecast accuracy
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-3 flex-wrap"
              >
                <FilterDropdown
                  label="Location"
                  value={selectedLocation}
                  options={availableLocations}
                  isOpen={locationDropdownOpen}
                  setIsOpen={setLocationDropdownOpen}
                  onChange={(val) => setSelectedLocation(val)}
                />
                <FilterDropdown
                  label="Provider"
                  value={selectedProvider}
                  options={weatherProviders}
                  isOpen={providerDropdownOpen}
                  setIsOpen={setProviderDropdownOpen}
                  onChange={(val) => setSelectedProvider(val as Provider)}
                />
                <FilterDropdown
                  label="Time Range"
                  value={timeRange}
                  options={["Today", "7 Days", "30 Days"]}
                  isOpen={timeRangeDropdownOpen}
                  setIsOpen={setTimeRangeDropdownOpen}
                  onChange={(val) => setTimeRange(val as TimeRange)}
                />
                <FilterDropdown
                  label="Forecast Horizon"
                  value={forecastHorizon}
                  options={["1 Min", "15 Min", "Day Ahead", "15 Day"]}
                  isOpen={forecastHorizonDropdownOpen}
                  setIsOpen={setForecastHorizonDropdownOpen}
                  onChange={(val) => setForecastHorizon(val as ForecastHorizon)}
                />
                <FilterDropdown
                  label="Parameter"
                  value={parameter}
                  options={["Temperature", "Wind", "Irradiance", "Humidity"]}
                  isOpen={parameterDropdownOpen}
                  setIsOpen={setParameterDropdownOpen}
                  onChange={(val) => setParameter(val as Parameter)}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="sticky top-[64px] z-10 bg-background/95 backdrop-blur-md border-b border-border px-6 py-2">
          <div className="flex items-center gap-1">
            {[
              { id: "monitoring", label: "Monitoring" },
              { id: "insights", label: "Insights" },
              { id: "advanced", label: "Advanced Weather View" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  activeMainTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="p-6 space-y-6">

          {/* ── MONITORING TAB ── */}
          {activeMainTab === "monitoring" && (
            <div className="space-y-6">
              <MonitoringSegment />
            </div>
          )}

          {/* ── INSIGHTS TAB ── */}
          {activeMainTab === "insights" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                {[
                  { id: "accuracy", label: "Accuracy & Performance Lab" },
                  { id: "longterm", label: "Long-Term Planning (ABP)" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveInsightsTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                      activeInsightsTab === tab.id
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/20"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {activeInsightsTab === "accuracy" && (
                <div className="space-y-6">
                  <AccuracyPerformanceLab compareProviders={["imd", "tomorrow-io"]} />
                  <ForecastAccuracyAnalytics />
                </div>
              )}
              {activeInsightsTab === "longterm" && (
                <LongTermPlanningModule
                  forecastHorizon={forecastHorizonABP}
                  setForecastHorizon={setForecastHorizonABP}
                />
              )}
              {showSolarFeatures && activeInsightsTab === "accuracy" && (
                <SolarIntelligenceDashboard />
              )}
            </div>
          )}

          {/* ── ADVANCED WEATHER VIEW TAB ── */}
          {activeMainTab === "advanced" && (
            <AdvancedWeatherView
              viewMode={advancedViewMode}
              setViewMode={setAdvancedViewMode}
            />
          )}

          {/* ── ORIGINAL CONTENT (only shows in monitoring tab) ── */}
          {activeMainTab === "monitoring" && (
          <div className="space-y-6">
          {/* Section 1: Forecast vs Actual Comparison — Enhanced LineChart with Single/Multiple Provider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={glassCardClass}
          >
            {glassGlow}
            <div className="relative z-10">
              {/* Header with Mode Toggle */}
              <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">Forecast vs Actual Comparison</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {comparisonMode === "single" 
                      ? `Analyzing ${selectedProviders[0]} forecast accuracy for ${parameter}`
                      : `Comparing IMD & Tomorrow.io forecasts for ${parameter}`
                    }
                  </p>
                </div>
                
                {/* Provider Filter Pills */}
                <div className="flex items-center gap-2">
                  {(["IMD", "Tomorrow.io"] as Provider[]).map((prov) => {
                    const isActive = selectedProviders.includes(prov);
                    return (
                      <button
                        key={prov}
                        onClick={() => {
                          if (isActive && selectedProviders.length === 1) return; // must keep at least one
                          const next = isActive
                            ? selectedProviders.filter((p) => p !== prov)
                            : [...selectedProviders, prov];
                          setSelectedProviders(next);
                          setComparisonMode(next.length > 1 ? "multiple" : "single");
                          if (next.length === 1) setSelectedProvider(next[0]);
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                          isActive
                            ? prov === "IMD"
                              ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-300/50 dark:border-indigo-600/40"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-300/50 dark:border-amber-600/40"
                            : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary/70"
                        }`}
                      >
                        {prov}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Statistics Pills */}
              {comparisonMode === "single" ? (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Avg Deviation</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {(() => {
                        const data = generateForecastVsActualData(selectedProviders[0], selectedLocation, parameter);
                        const avgDev = data.reduce((sum, d) => sum + Math.abs(d.forecast - d.actual), 0) / data.length;
                        return avgDev.toFixed(1);
                      })()}
                      <span className="text-xs font-normal ml-1">
                        {parameter === "Temperature" ? "°C" : parameter === "Wind" ? "m/s" : parameter === "Irradiance" ? "W/m²" : "%"}
                      </span>
                    </p>
                  </div>
                  <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/30 rounded-xl p-3">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Accuracy</p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      {(() => {
                        const data = generateForecastVsActualData(selectedProviders[0], selectedLocation, parameter);
                        const avgActual = data.reduce((sum, d) => sum + d.actual, 0) / data.length;
                        const avgDev = data.reduce((sum, d) => sum + Math.abs(d.forecast - d.actual), 0) / data.length;
                        const accuracy = Math.max(0, 100 - (avgDev / avgActual) * 100);
                        return accuracy.toFixed(1);
                      })()}%
                    </p>
                  </div>
                  <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 rounded-xl p-3">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Data Points</p>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {generateForecastVsActualData(selectedProviders[0], selectedLocation, parameter).length}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 rounded-xl p-3">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2">Best Performer</p>
                    <p className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                      {(() => {
                        const allProviders: Provider[] = ["IMD", "Tomorrow.io"];
                        const providerAccuracies = allProviders.map(provider => {
                          const data = generateForecastVsActualData(provider, selectedLocation, parameter);
                          const avgActual = data.reduce((sum, d) => sum + d.actual, 0) / data.length;
                          const avgDev = data.reduce((sum, d) => sum + Math.abs(d.forecast - d.actual), 0) / data.length;
                          const accuracy = Math.max(0, 100 - (avgDev / avgActual) * 100);
                          return { provider, accuracy };
                        });
                        const best = providerAccuracies.reduce((prev, curr) => prev.accuracy > curr.accuracy ? prev : curr);
                        return `${best.provider} (${best.accuracy.toFixed(1)}%)`;
                      })()}
                    </p>
                  </div>
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-3">
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-2">Avg Variance</p>
                    <p className="text-base font-bold text-amber-700 dark:text-amber-300">
                      {(() => {
                        const allProviders: Provider[] = ["IMD", "Tomorrow.io"];
                        const allDeviations = allProviders.flatMap(provider => {
                          const data = generateForecastVsActualData(provider, selectedLocation, parameter);
                          return data.map(d => Math.abs(d.forecast - d.actual));
                        });
                        const avgDev = allDeviations.reduce((sum, d) => sum + d, 0) / allDeviations.length;
                        return avgDev.toFixed(1);
                      })()}
                      <span className="text-xs font-normal ml-1">
                        {parameter === "Temperature" ? "°C" : parameter === "Wind" ? "m/s" : parameter === "Irradiance" ? "W/m²" : "%"}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Forecast vs Actual Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {comparisonMode === "single" ? (
                    <LineChart data={generateForecastVsActualData(selectedProviders[0], selectedLocation, parameter)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{
                          ...tooltipStyle,
                          borderRadius: '12px',
                          padding: '12px',
                        }}
                        labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        strokeDasharray="6 3"
                        name={`Forecast - ${selectedProviders[0]}`}
                        dot={{ fill: "#6366f1", strokeWidth: 0, r: 5 }}
                        activeDot={{ r: 7, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Actual"
                        dot={{ fill: "#10b981", strokeWidth: 0, r: 5 }}
                        activeDot={{ r: 7, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                      />
                    </LineChart>
                  ) : (
                    <LineChart data={(() => {
                      // Multi-provider mode: Generate separate data for IMD and Tomorrow.io
                      const imdData = generateForecastVsActualData("IMD", selectedLocation, parameter);
                      const tomorrowData = generateForecastVsActualData("Tomorrow.io", selectedLocation, parameter);
                      
                      // Merge data with separate keys for each provider
                      const multiData = imdData.map((imdPoint, index) => ({
                        time: imdPoint.time,
                        imdForecast: imdPoint.forecast,
                        tomorrowForecast: tomorrowData[index]?.forecast || 0,
                        actual: imdPoint.actual
                      }));
                      
                      return multiData;
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{
                          ...tooltipStyle,
                          borderRadius: '12px',
                          padding: '12px',
                        }}
                        labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                      {/* Line 1: IMD Forecast (Indigo) */}
                      <Line
                        type="monotone"
                        dataKey="imdForecast"
                        stroke="#6366f1"
                        strokeWidth={3}
                        name="IMD Forecast"
                        dot={{ fill: "#6366f1", strokeWidth: 2, stroke: "#fff", r: 5 }}
                        activeDot={{ r: 8, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                      />
                      {/* Line 2: Tomorrow.io Forecast (Orange) */}
                      <Line
                        type="monotone"
                        dataKey="tomorrowForecast"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        name="Tomorrow.io Forecast"
                        dot={{ fill: "#f59e0b", strokeWidth: 2, stroke: "#fff", r: 5 }}
                        activeDot={{ r: 8, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                      />
                      {/* Line 3: Actual (Green, Solid) */}
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Actual"
                        dot={{ fill: "#10b981", strokeWidth: 0, r: 5 }}
                        activeDot={{ r: 7, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Forecast Error Metrics */}
          

          {/* Section 3 & 4: Error Heatmap & Forecast Drift */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Forecast Error Heatmap - REDESIGNED */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={glassCardClass}
            >
              {glassGlow}
              <div className="relative z-10">
                {/* Header */}
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-foreground">Forecast Error Heatmap</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Error magnitude across parameters and time
                  </p>
                </div>

                {/* Statistics Pills */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/40 dark:to-emerald-800/20 border border-emerald-200/50 dark:border-emerald-700/30 rounded-xl p-2.5 backdrop-blur-sm">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">Low Errors</p>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">67%</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/40 dark:to-amber-800/20 border border-amber-200/50 dark:border-amber-700/30 rounded-xl p-2.5 backdrop-blur-sm">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mb-0.5">Mid Errors</p>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-200">25%</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/40 dark:to-red-800/20 border border-red-200/50 dark:border-red-700/30 rounded-xl p-2.5 backdrop-blur-sm">
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-medium mb-0.5">High Errors</p>
                    <p className="text-xs font-bold text-red-800 dark:text-red-200">8%</p>
                  </div>
                </div>

                {/* Legend */}
                <div className="mb-4 flex items-center justify-end gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-muted-foreground font-medium">Low</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-muted-foreground font-medium">Mid</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-muted-foreground font-medium">High</span>
                  </div>
                </div>

                {/* Heatmap Grid */}
                <div className="mb-4">
                  <HeatmapGrid data={generateHeatmapData(selectedProvider, selectedLocation, parameter)} />
                </div>

                {/* Insight Card */}
                
              </div>
            </motion.div>

            {/* Forecast Drift Analysis - REDESIGNED */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={glassCardClass}
            >
              {glassGlow}
              <div className="relative z-10">
                {/* Header with Better Description */}
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-foreground">Forecast Drift Analysis</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Track how forecast predictions evolve and converge towards actual values over time
                  </p>
                </div>

                {/* Chart */}
                <div className="h-80 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateForecastDriftData(forecastHorizon, selectedProvider, selectedLocation, parameter)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{
                          ...tooltipStyle,
                          borderRadius: '12px',
                          padding: '12px',
                        }}
                        labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="15Day" 
                        stroke="#94a3b8" 
                        strokeWidth={2} 
                        name="15 Day Forecast" 
                        dot={false} 
                        strokeDasharray="5 3" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="7Day" 
                        stroke="#a78bfa" 
                        strokeWidth={2} 
                        name="7 Day Forecast" 
                        dot={false} 
                        strokeDasharray="4 2" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="DayAhead" 
                        stroke="#f59e0b" 
                        strokeWidth={2.5} 
                        name="Day Ahead" 
                        dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Intraday" 
                        stroke="#6366f1" 
                        strokeWidth={2.5} 
                        name="Intraday" 
                        dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        name="Actual" 
                        dot={{ fill: "#10b981", strokeWidth: 0, r: 5 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Key Insight Card */}
                
              </div>
            </motion.div>
          </div>

          {/* Section 5: Weather Correlation Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={glassCardClass}
          >
            {glassGlow}
            <div className="relative z-10">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-foreground">Weather Correlation Matrix</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Parameter relationships and correlations
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {generateCorrelationData().map((item, idx) => (
                  <CorrelationCard
                    key={`corr-${idx}-${item.param1}-${item.param2}`}
                    param1={item.param1}
                    param2={item.param2}
                    correlation={item.correlation}
                    delay={idx * 0.08}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Section 6 & 7: Diurnal Pattern & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diurnal Pattern Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={glassCardClass}
            >
              {glassGlow}
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Diurnal Pattern Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      24-hour weather parameter cycles
                    </p>
                  </div>
                  
                </div>
                <div className="flex-1 min-h-0">
                  <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden="true">
                    <defs>
                      <linearGradient id="ci-tempDiurnal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ci-humidityDiurnal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ci-windDiurnal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateDiurnalPatternData(selectedLocation, timeRange)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      {diurnalParam === 'temperature' && (
                        <Area type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2.5} fill="url(#ci-tempDiurnal)" name="Temp (°C)" dot={false} />
                      )}
                      {diurnalParam === 'humidity' && (
                        <Area type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2.5} fill="url(#ci-humidityDiurnal)" name="Humidity (%)" dot={false} />
                      )}
                      {diurnalParam === 'windSpeed' && (
                        <Area type="monotone" dataKey="windSpeed" stroke="#10b981" strokeWidth={2.5} fill="url(#ci-windDiurnal)" name="Wind (m/s)" dot={false} />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Distribution Analysis — Box Plot */}
            <DistributionBoxPlotSection
              parameter={parameter}
              forecastHorizon={forecastHorizon}
              glassCardClass={glassCardClass}
              glassGlow={glassGlow}
              tooltipStyle={tooltipStyle}
            />
          </div>

          {/* Section 8: Solar Intelligence (Conditional) */}
          {showSolarFeatures && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Clear Sky Index Gauge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={glassCardClass}
              >
                {glassGlow}
                <div className="relative z-10">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-foreground">Clear Sky Index</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSI = Actual GHI / Clear Sky GHI
                    </p>
                  </div>
                  <div className="flex items-center justify-center h-48">
                    <GaugeChart value={0.82} label="CSI" />
                  </div>
                </div>
              </motion.div>

              {/* GHI vs DHI Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`lg:col-span-2 ${glassCardClass}`}
              >
                {glassGlow}
                <div className="relative z-10">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-foreground">Solar Irradiance Components</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      GHI, DHI, and DNI over the day
                    </p>
                  </div>
                  <div className="h-48">
                    {/* Gradients hoisted outside Recharts to prevent duplicate-key warnings */}
                    <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden="true">
                      <defs>
                        <linearGradient id="ci-ghiArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="ci-dhiArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="ci-dniArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={generateGHIData(selectedLocation, timeRange)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Area type="monotone" dataKey="GHI" stroke="#f59e0b" strokeWidth={2.5} fill="url(#ci-ghiArea)" name="GHI (W/m²)" dot={false} />
                        <Area type="monotone" dataKey="DHI" stroke="#6366f1" strokeWidth={2} fill="url(#ci-dhiArea)" name="DHI (W/m²)" dot={false} />
                        <Area type="monotone" dataKey="DNI" stroke="#10b981" strokeWidth={2} fill="url(#ci-dniArea)" name="DNI (W/m²)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Section 9: Cloud Impact Analysis — Enhanced Scatter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={glassCardClass}
          >
            {glassGlow}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Cloud Impact Analysis</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Relationship between cloud cover and solar irradiance
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-indigo-500/70 ring-2 ring-indigo-300/40" />
                  Data Points
                </div>
              </div>
              <div className="h-80">
                {/* Gradient hoisted outside Recharts to prevent duplicate-key warnings */}
                <svg width="0" height="0" className="absolute overflow-hidden" aria-hidden="true">
                  <defs>
                    <radialGradient id="ci-scatterDot" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
                    </radialGradient>
                  </defs>
                </svg>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      dataKey="cloudCover"
                      name="Cloud Cover"
                      unit="%"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="number"
                      dataKey="irradiance"
                      name="Irradiance"
                      unit=" W/m²"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--border))' }}
                      contentStyle={tooltipStyle}
                    />
                    <Scatter
                      data={generateCloudImpactData(selectedLocation)}
                      fill="url(#ci-scatterDot)"
                      fillOpacity={0.8}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

        </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component — Enhanced
function MetricCard({
  title,
  subtitle,
  value,
  trend,
  isUp,
  tooltip,
  color = "#6366f1",
}: {
  title: string;
  subtitle: string;
  value: string;
  trend: number;
  isUp: boolean;
  tooltip: string;
  color?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-white/60 dark:bg-[#151e32]/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] ring-1 ring-black/5 dark:ring-white/5 hover:shadow-lg transition-all group duration-300 hover:-translate-y-0.5">
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none rounded-2xl" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-bold text-foreground"
                style={{ color }}
              >{title}</h3>
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            title={tooltip}
          >
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="mb-3">
          <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
          <div
            className={`flex items-center gap-1 mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
              isUp ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-green-500/10 text-green-600 dark:text-green-400"
            }`}
          >
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}</span>
          </div>
        </div>
        {/* Mini progress bar */}
        <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.abs(parseFloat(value)) * 4)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
          />
        </div>
      </div>
    </div>
  );
}

// Filter Dropdown Component — LOCKED (unchanged)
function FilterDropdown({
  label,
  value,
  options,
  isOpen,
  setIsOpen,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onChange: (val: string) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sm shadow-sm ring-1 ring-black/5 dark:ring-white/5"
      >
        <span className="text-muted-foreground text-xs">{label}:</span>
        <span className="text-foreground font-medium">{value}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 bg-white/80 dark:bg-[#0B1221]/90 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 min-w-[180px] py-1 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  option === value
                    ? "bg-primary/10 text-primary font-medium dark:bg-primary/20"
                    : "text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {option}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}

// Heatmap Grid Component — Redesigned to match image with rounded pills
function HeatmapGrid({ data }: { data: any[] }) {
  const parameters = ["Temperature", "Wind", "Humidity", "Irradiance"];
  const times = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const getCellColor = (error: number): string => {
    if (error < 2) return "rgb(74, 222, 128)"; // Green
    if (error < 4) return "rgb(52, 211, 153)"; // Light Green
    if (error < 6) return "rgb(251, 191, 36)"; // Amber/Yellow
    if (error < 7.5) return "rgb(251, 146, 60)"; // Orange
    return "rgb(248, 113, 113)"; // Red
  };

  const getErrorLabel = (error: number): string => {
    if (error < 4) return "Low";
    if (error < 7) return "Mid";
    return "High";
  };

  return (
    <div className="space-y-3">
      {/* Time header */}
      <div className="grid grid-cols-[100px_repeat(6,1fr)] gap-2 px-2">
        <div></div>
        {times.map((time) => (
          <div key={time} className="text-xs font-semibold text-muted-foreground text-center">
            {time}
          </div>
        ))}
      </div>
      
      {/* Parameter rows */}
      {parameters.map((param, i) => (
        <div key={param} className="grid grid-cols-[100px_repeat(6,1fr)] gap-2 items-center">
          <div className="text-xs font-medium text-muted-foreground pr-2">
            {param}
          </div>
          {times.map((time, j) => {
            const item = data.find((d) => d.time === time && d.parameter === param);
            const err = item?.error || 0;
            const cellKey = `${param}-${time}`;
            const isHovered = hoveredCell === cellKey;
            
            return (
              <motion.div
                key={cellKey}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i * times.length + j) * 0.02, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                onMouseEnter={() => setHoveredCell(cellKey)}
                onMouseLeave={() => setHoveredCell(null)}
                className="relative h-12 rounded-2xl cursor-pointer transition-all duration-200"
                style={{ 
                  backgroundColor: getCellColor(err),
                  boxShadow: isHovered ? `0 4px 16px ${getCellColor(err)}40` : 'none'
                }}
                title={`${param} at ${time}: Error ${err.toFixed(2)}`}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-lg"
                  >
                    {err.toFixed(2)}% ({getErrorLabel(err)})
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Correlation Card Component — Enhanced with arc bar
function CorrelationCard({
  param1,
  param2,
  correlation,
  delay = 0
}: {
  param1: string;
  param2: string;
  correlation: number;
  delay?: number;
}) {
  const abs = Math.abs(correlation);
  const isPositive = correlation >= 0;
  const strength = abs > 0.7 ? "Strong" : abs > 0.4 ? "Moderate" : "Weak";
  const color = abs > 0.7 ? "#10b981" : abs > 0.4 ? "#f59e0b" : "#ef4444";
  const bgColor = abs > 0.7 ? "from-green-500/10 to-emerald-500/5" :
    abs > 0.4 ? "from-amber-500/10 to-yellow-500/5" :
    "from-red-500/10 to-rose-500/5";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`relative overflow-hidden bg-gradient-to-br ${bgColor} border border-white/40 dark:border-white/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-default group`}
    >
      <div className="text-xs font-medium text-muted-foreground mb-2">
        {param1} <span className="opacity-40 mx-1">↔</span> {param2}
      </div>
      <div
        className="text-2xl font-bold tracking-tight mb-2"
        style={{ color }}
      >
        {isPositive ? "+" : ""}{correlation.toFixed(2)}
      </div>
      {/* Mini bar indicator */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${abs * 100}%` }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.2, duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color }}>
          {strength}
        </span>
      </div>
    </motion.div>
  );
}

// Gauge Chart Component — Enhanced with gradient and needle
function GaugeChart({ value, label }: { value: number; label: string }) {
  const percentage = value * 100;
  const fillColor = value >= 0.8 ? "#10b981" : value >= 0.6 ? "#f59e0b" : "#ef4444";
  const textColorClass = value >= 0.8 ? "text-emerald-500" : value >= 0.6 ? "text-amber-500" : "text-red-500";

  const gaugeData = [{ name: label, value: percentage, fill: fillColor }];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="58%"
            innerRadius="62%"
            outerRadius="92%"
            barSize={14}
            data={gaugeData}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "hsl(var(--muted))" }}
              dataKey="value"
              cornerRadius={8}
            >
              {gaugeData.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={fillColor} />
              ))}
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: '10px' }}>
          <div className={`text-3xl font-bold ${textColorClass}`}>
            {percentage.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full px-4 -mt-3">
        <span className="text-xs text-muted-foreground">0%</span>
        <span className="text-xs text-muted-foreground">100%</span>
      </div>
    </div>
  );
}