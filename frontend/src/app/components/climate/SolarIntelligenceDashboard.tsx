import React, { useState } from "react";
import {
  Sun,
  CloudOff,
  Zap,
  TrendingUp,
  CloudRain,
  Thermometer,
  Info,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════
   SOLAR INTELLIGENCE DASHBOARD — Enterprise Edition
   For Renewable Energy Utilities (Solar/Wind)
   Accessible: Admin & Super Admin Only
   
   ✨ COMPREHENSIVE SOLAR ANALYTICS SUITE:
   • Solar Parameter Profiles (Irradiance, Cloud Cover, Temperature)
   • Clear Sky Index Analysis with formula visualization
   • Solar Potential Estimation for generation forecasting
   • Solar Radiation Comparison (GHI vs DHI)
   • 24-Hour Irradiance vs Time Curve
   ═══════════════════════════════════════════════════════════════════ */

// Mock Data: Solar Parameter Profiles (Time-based)
const solarParameterData = [
  { time: "06:00", irradiance: 120, cloudCover: 15, temperature: 24 },
  { time: "07:00", irradiance: 280, cloudCover: 12, temperature: 26 },
  { time: "08:00", irradiance: 450, cloudCover: 8, temperature: 28 },
  { time: "09:00", irradiance: 620, cloudCover: 5, temperature: 30 },
  { time: "10:00", irradiance: 780, cloudCover: 3, temperature: 32 },
  { time: "11:00", irradiance: 880, cloudCover: 2, temperature: 34 },
  { time: "12:00", irradiance: 950, cloudCover: 1, temperature: 36 },
  { time: "13:00", irradiance: 920, cloudCover: 2, temperature: 36 },
  { time: "14:00", irradiance: 840, cloudCover: 5, temperature: 35 },
  { time: "15:00", irradiance: 700, cloudCover: 8, temperature: 33 },
  { time: "16:00", irradiance: 520, cloudCover: 12, temperature: 31 },
  { time: "17:00", irradiance: 320, cloudCover: 18, temperature: 29 },
  { time: "18:00", irradiance: 150, cloudCover: 22, temperature: 27 },
];

// Mock Data: Clear Sky Index Analysis
const clearSkyIndexData = [
  { time: "06:00", actualIrradiance: 120, clearSkyIrradiance: 130, clearSkyIndex: 0.92 },
  { time: "07:00", actualIrradiance: 280, clearSkyIrradiance: 295, clearSkyIndex: 0.95 },
  { time: "08:00", actualIrradiance: 450, clearSkyIrradiance: 470, clearSkyIndex: 0.96 },
  { time: "09:00", actualIrradiance: 620, clearSkyIrradiance: 640, clearSkyIndex: 0.97 },
  { time: "10:00", actualIrradiance: 780, clearSkyIrradiance: 810, clearSkyIndex: 0.96 },
  { time: "11:00", actualIrradiance: 880, clearSkyIrradiance: 920, clearSkyIndex: 0.96 },
  { time: "12:00", actualIrradiance: 950, clearSkyIrradiance: 980, clearSkyIndex: 0.97 },
  { time: "13:00", actualIrradiance: 920, clearSkyIrradiance: 970, clearSkyIndex: 0.95 },
  { time: "14:00", actualIrradiance: 840, clearSkyIrradiance: 900, clearSkyIndex: 0.93 },
  { time: "15:00", actualIrradiance: 700, clearSkyIrradiance: 780, clearSkyIndex: 0.90 },
  { time: "16:00", actualIrradiance: 520, clearSkyIrradiance: 610, clearSkyIndex: 0.85 },
  { time: "17:00", actualIrradiance: 320, clearSkyIrradiance: 410, clearSkyIndex: 0.78 },
  { time: "18:00", actualIrradiance: 150, clearSkyIrradiance: 200, clearSkyIndex: 0.75 },
];

// Mock Data: Solar Potential Estimation
const solarPotentialData = [
  { time: "06:00", estimatedGeneration: 0.8, capacity: 1.2 },
  { time: "07:00", estimatedGeneration: 1.9, capacity: 2.5 },
  { time: "08:00", estimatedGeneration: 3.2, capacity: 4.0 },
  { time: "09:00", estimatedGeneration: 4.5, capacity: 5.8 },
  { time: "10:00", estimatedGeneration: 5.7, capacity: 7.2 },
  { time: "11:00", estimatedGeneration: 6.5, capacity: 8.5 },
  { time: "12:00", estimatedGeneration: 7.0, capacity: 9.0 },
  { time: "13:00", estimatedGeneration: 6.8, capacity: 8.8 },
  { time: "14:00", estimatedGeneration: 6.2, capacity: 8.0 },
  { time: "15:00", estimatedGeneration: 5.2, capacity: 7.0 },
  { time: "16:00", estimatedGeneration: 3.8, capacity: 5.5 },
  { time: "17:00", estimatedGeneration: 2.3, capacity: 3.8 },
  { time: "18:00", estimatedGeneration: 1.1, capacity: 1.8 },
];

// Mock Data: Solar Radiation Comparison (GHI vs DHI)
const radiationComparisonData = [
  { time: "06:00", ghi: 130, dhi: 50 },
  { time: "07:00", ghi: 295, dhi: 85 },
  { time: "08:00", ghi: 470, dhi: 110 },
  { time: "09:00", ghi: 640, dhi: 130 },
  { time: "10:00", ghi: 810, dhi: 145 },
  { time: "11:00", ghi: 920, dhi: 155 },
  { time: "12:00", ghi: 980, dhi: 160 },
  { time: "13:00", ghi: 970, dhi: 158 },
  { time: "14:00", ghi: 900, dhi: 150 },
  { time: "15:00", ghi: 780, dhi: 140 },
  { time: "16:00", ghi: 610, dhi: 120 },
  { time: "17:00", ghi: 410, dhi: 95 },
  { time: "18:00", ghi: 200, dhi: 65 },
];

// Mock Data: Irradiance vs Time Curve (Smooth hourly progression)
const irradianceCurveData = [
  { time: "00:00", irradiance: 0 },
  { time: "01:00", irradiance: 0 },
  { time: "02:00", irradiance: 0 },
  { time: "03:00", irradiance: 0 },
  { time: "04:00", irradiance: 0 },
  { time: "05:00", irradiance: 5 },
  { time: "06:00", irradiance: 120 },
  { time: "07:00", irradiance: 280 },
  { time: "08:00", irradiance: 450 },
  { time: "09:00", irradiance: 620 },
  { time: "10:00", irradiance: 780 },
  { time: "11:00", irradiance: 880 },
  { time: "12:00", irradiance: 950 },
  { time: "13:00", irradiance: 920 },
  { time: "14:00", irradiance: 840 },
  { time: "15:00", irradiance: 700 },
  { time: "16:00", irradiance: 520 },
  { time: "17:00", irradiance: 320 },
  { time: "18:00", irradiance: 150 },
  { time: "19:00", irradiance: 10 },
  { time: "20:00", irradiance: 0 },
  { time: "21:00", irradiance: 0 },
  { time: "22:00", irradiance: 0 },
  { time: "23:00", irradiance: 0 },
];

export function SolarIntelligenceDashboard() {
  // Calculate key metrics
  const peakIrradiance = 950; // W/m²
  const avgClearSkyIndex = 0.91;
  const totalEstimatedGeneration = 54.0; // MWh (daily)
  const peakGenerationTime = "12:00";

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-[20px] border border-amber-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-foreground">Solar Intelligence Dashboard</h2>
            <p className="text-[12px] text-muted-foreground">
              Real-time solar analytics for renewable energy optimization
            </p>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                Peak Irradiance
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{peakIrradiance} W/m²</div>
            <div className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">
              At {peakGenerationTime} Today
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <CloudOff className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                Avg Clear Sky Index
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{avgClearSkyIndex}</div>
            <div className="text-[12px] text-sky-600 dark:text-sky-400 font-medium">
              Excellent Conditions
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                Est. Daily Generation
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{totalEstimatedGeneration} MWh</div>
            <div className="text-[12px] text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8.5% vs Forecast
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                Avg Cloud Cover
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">8.5%</div>
            <div className="text-[12px] text-blue-600 dark:text-blue-400 font-medium">
              Minimal Impact
            </div>
          </div>
        </div>
      </div>

      {/* 1️⃣ Solar Parameter Profiles */}
      <div className="bg-card/50 backdrop-blur-sm rounded-[20px] border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[14px] font-bold text-foreground mb-1">Solar Parameter Profiles</h3>
            <p className="text-[12px] text-muted-foreground">
              Time-based profiles of irradiance, cloud cover, and temperature
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-amber-500" />
              <span className="text-[11px] text-muted-foreground">Irradiance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-sky-500" />
              <span className="text-[11px] text-muted-foreground">Cloud Cover</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-red-500" />
              <span className="text-[11px] text-muted-foreground">Temperature</span>
            </div>
          </div>
        </div>

        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={solarParameterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                label={{
                  value: "Irradiance (W/m²)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#64748b", fontSize: 12, fontWeight: 600 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                label={{
                  value: "Cloud Cover (%) / Temperature (°C)",
                  angle: 90,
                  position: "insideRight",
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
                yAxisId="left"
                type="monotone"
                dataKey="irradiance"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={false}
                name="Irradiance (W/m²)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cloudCover"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                dot={false}
                name="Cloud Cover (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={false}
                name="Temperature (°C)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2️⃣ Clear Sky Index Analysis */}
      <div className="bg-card/50 backdrop-blur-sm rounded-[20px] border border-border p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CloudOff className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-[14px] font-bold text-foreground">Clear Sky Index Analysis</h3>
          </div>
          <p className="text-[12px] text-muted-foreground mb-3">
            Measuring cloud impact on solar energy production
          </p>
          <div className="bg-muted/30 rounded-lg border border-border p-3 inline-flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-[12px] text-foreground font-mono">
              Clear Sky Index = <span className="text-amber-600 dark:text-amber-400">Actual Irradiance</span> /{" "}
              <span className="text-sky-600 dark:text-sky-400">Clear Sky Irradiance</span>
            </span>
          </div>
        </div>

        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clearSkyIndexData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                label={{
                  value: "Irradiance (W/m²)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#64748b", fontSize: 12, fontWeight: 600 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 1]}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                label={{
                  value: "Clear Sky Index",
                  angle: 90,
                  position: "insideRight",
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
                yAxisId="left"
                type="monotone"
                dataKey="actualIrradiance"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
                name="Actual Irradiance"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="clearSkyIrradiance"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
                name="Clear Sky Irradiance"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="clearSkyIndex"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 3, fill: "#10b981" }}
                name="Clear Sky Index"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: Solar Potential & Radiation Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3️⃣ Solar Potential Estimation */}
        <div className="bg-card/50 backdrop-blur-sm rounded-[20px] border border-border p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-[14px] font-bold text-foreground">Solar Potential Estimation</h3>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Estimated generation potential based on weather conditions
            </p>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={solarPotentialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                  label={{
                    value: "Generation (MW)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#64748b", fontSize: 11, fontWeight: 600 },
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
                <Area
                  type="monotone"
                  dataKey="capacity"
                  stroke="#cbd5e1"
                  fill="#f1f5f9"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  name="Max Capacity"
                />
                <Area
                  type="monotone"
                  dataKey="estimatedGeneration"
                  stroke="#eab308"
                  fill="#fef08a"
                  fillOpacity={0.6}
                  strokeWidth={2.5}
                  name="Estimated Generation"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4️⃣ Solar Radiation Comparison (GHI vs DHI) */}
        <div className="bg-card/50 backdrop-blur-sm rounded-[20px] border border-border p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-[14px] font-bold text-foreground">Solar Radiation Comparison</h3>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Global vs Diffuse Horizontal Irradiance
            </p>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={radiationComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                  label={{
                    value: "Irradiance (W/m²)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#64748b", fontSize: 11, fontWeight: 600 },
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
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  iconType="rect"
                  iconSize={10}
                />
                <Bar dataKey="ghi" fill="#f97316" name="GHI (Global Horizontal Irradiance)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dhi" fill="#06b6d4" name="DHI (Diffuse Horizontal Irradiance)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5️⃣ Irradiance vs Time Curve (24-hour) */}
      <div className="bg-card/50 backdrop-blur-sm rounded-[20px] border border-border p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-[14px] font-bold text-foreground">Irradiance vs Time Curve</h3>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Solar irradiance variation throughout the day (24-hour cycle)
          </p>
        </div>

        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={irradianceCurveData}>
              <defs>
                <linearGradient id="irradianceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                interval={1}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", strokeWidth: 1.5 }}
                label={{
                  value: "Irradiance (W/m²)",
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
                labelFormatter={(label) => `Time: ${label}`}
                formatter={(value: any) => [`${value} W/m²`, "Irradiance"]}
              />
              <Area
                type="monotone"
                dataKey="irradiance"
                stroke="#f59e0b"
                strokeWidth={3}
                fill="url(#irradianceGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-[20px] border border-emerald-500/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-[14px] font-bold text-foreground">Key Insights & Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
            <div className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
              ✓ Optimal Conditions
            </div>
            <p className="text-[12px] text-muted-foreground">
              Clear sky index above 0.90 throughout peak hours. Excellent solar generation potential today.
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
            <div className="text-[12px] font-semibold text-sky-600 dark:text-sky-400 mb-2">
              ⚡ Peak Production Window
            </div>
            <p className="text-[12px] text-muted-foreground">
              Maximum generation expected between 11:00 - 14:00 with minimal cloud interference.
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-4">
            <div className="text-[12px] font-semibold text-amber-600 dark:text-amber-400 mb-2">
              📊 GHI/DHI Ratio Analysis
            </div>
            <p className="text-[12px] text-muted-foreground">
              Healthy GHI to DHI ratio indicates direct sunlight dominance, maximizing panel efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}