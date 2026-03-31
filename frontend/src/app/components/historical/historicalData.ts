/* ═══════════════════════════════════════════════════
   HISTORICAL DATA — Mock time-series with quality flags
   Forecast vs Actual · Diff % · Resolution variants
   ═══════════════════════════════════════════════════ */

export type Resolution = "15min" | "30min" | "1hr" | "daily";
export type QualityFlag = "good" | "interpolated" | "missing" | "suspect";
export type ParameterId = "temp" | "humidity" | "wind_speed" | "rainfall" | "pressure" | "solar_irr" | "dew_point" | "visibility";

export interface WeatherParameter {
  id: ParameterId;
  label: string;
  unit: string;
  category: "primary" | "secondary";
  color: string;
}

export interface TimeSeriesRow {
  id: string;
  timestamp: string;       // ISO string
  timestampIST: string;    // display string
  parameter: ParameterId;
  actual: number | null;
  forecast: number;
  diffPercent: number | null;
  quality: QualityFlag;
  provider: string;
  notes?: string;
}

export interface DatePreset {
  label: string;
  days: number;
}

// ── Parameters ──
export const PARAMETERS: WeatherParameter[] = [
  { id: "temp", label: "Temperature", unit: "°C", category: "primary", color: "var(--chart-5)" },
  { id: "humidity", label: "Rel. Humidity", unit: "%", category: "primary", color: "var(--chart-1)" },
  { id: "wind_speed", label: "Wind Speed", unit: "km/h", category: "primary", color: "var(--chart-3)" },
  { id: "rainfall", label: "Rainfall", unit: "mm", category: "primary", color: "var(--chart-4)" },
  { id: "pressure", label: "Pressure", unit: "hPa", category: "secondary", color: "var(--chart-2)" },
  { id: "solar_irr", label: "Solar Irradiance", unit: "W/m²", category: "secondary", color: "#F97316" },
  { id: "dew_point", label: "Dew Point", unit: "°C", category: "secondary", color: "#06B6D4" },
  { id: "visibility", label: "Visibility", unit: "km", category: "secondary", color: "#8B5CF6" },
];

// ── Date presets ──
export const DATE_PRESETS: DatePreset[] = [
  { label: "Last 24h", days: 1 },
  { label: "Last 3 days", days: 3 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

// ── Resolution labels ──
export const RESOLUTIONS: { id: Resolution; label: string; shortLabel: string }[] = [
  { id: "15min", label: "15 Minutes", shortLabel: "15m" },
  { id: "30min", label: "30 Minutes", shortLabel: "30m" },
  { id: "1hr", label: "1 Hour", shortLabel: "1h" },
  { id: "daily", label: "Daily", shortLabel: "1D" },
];

// ── Quality flag config ──
export const QUALITY_CONFIG: Record<QualityFlag, { label: string; color: string; bgColor: string }> = {
  good: { label: "Good", color: "text-chart-3", bgColor: "bg-chart-3/10" },
  interpolated: { label: "Interpolated", color: "text-chart-2", bgColor: "bg-chart-2/10" },
  missing: { label: "Missing", color: "text-destructive", bgColor: "bg-destructive/10" },
  suspect: { label: "Suspect", color: "text-chart-4", bgColor: "bg-chart-4/10" },
};

// ── Providers ──
export const PROVIDERS = ["IMD", "Tomorrow.io"];

// ── Generate mock rows ──
function generateRows(
  param: ParameterId,
  resolution: Resolution,
  days: number,
  provider: string
): TimeSeriesRow[] {
  const rows: TimeSeriesRow[] = [];
  const now = new Date(2026, 1, 11, 18, 0); // Feb 11 2026 18:00 IST

  const paramConf = PARAMETERS.find((p) => p.id === param);

  // Base values & ranges by param
  const bases: Record<ParameterId, { base: number; range: number; forecastBias: number }> = {
    temp:       { base: 33, range: 8, forecastBias: 0.5 },
    humidity:   { base: 72, range: 20, forecastBias: 2 },
    wind_speed: { base: 18, range: 15, forecastBias: 1.5 },
    rainfall:   { base: 5, range: 30, forecastBias: 3 },
    pressure:   { base: 1012, range: 6, forecastBias: 0.5 },
    solar_irr:  { base: 450, range: 400, forecastBias: 30 },
    dew_point:  { base: 24, range: 5, forecastBias: 0.3 },
    visibility: { base: 6, range: 5, forecastBias: 0.8 },
  };

  const conf = bases[param];

  let intervalMinutes: number;
  switch (resolution) {
    case "15min": intervalMinutes = 15; break;
    case "30min": intervalMinutes = 30; break;
    case "1hr":   intervalMinutes = 60; break;
    case "daily": intervalMinutes = 1440; break;
  }

  const totalPoints = Math.min(
    Math.floor((days * 24 * 60) / intervalMinutes),
    200 // Cap for performance
  );

  for (let i = 0; i < totalPoints; i++) {
    const ts = new Date(now.getTime() - i * intervalMinutes * 60000);
    const hour = ts.getHours();

    // Diurnal pattern
    const diurnalFactor = param === "temp" || param === "solar_irr"
      ? Math.sin(((hour - 6) / 12) * Math.PI)
      : param === "humidity"
      ? -Math.sin(((hour - 6) / 12) * Math.PI) * 0.5
      : 0;

    const noise = (Math.random() - 0.5) * conf.range * 0.4;
    const actual = conf.base + diurnalFactor * conf.range * 0.5 + noise;
    const forecastNoise = (Math.random() - 0.5) * conf.forecastBias * 2;
    const forecast = actual + forecastNoise + conf.forecastBias * (Math.random() > 0.5 ? 1 : -1);

    // Quality flags: ~3% missing, ~5% interpolated, ~2% suspect
    const qRand = Math.random();
    let quality: QualityFlag = "good";
    let actualValue: number | null = Math.round(actual * 10) / 10;
    let notes: string | undefined;

    if (qRand < 0.03) {
      quality = "missing";
      actualValue = null;
      notes = "Sensor offline — data gap";
    } else if (qRand < 0.08) {
      quality = "interpolated";
      notes = "Value interpolated from adjacent timestamps";
    } else if (qRand < 0.10) {
      quality = "suspect";
      notes = "Value exceeds 2σ — flagged for review";
    }

    // Clamp rainfall to >= 0
    if (param === "rainfall") {
      if (actualValue !== null) actualValue = Math.max(0, actualValue);
    }

    const forecastRounded = Math.round(forecast * 10) / 10;
    const diff = actualValue !== null
      ? Math.round(((actualValue - forecastRounded) / Math.max(Math.abs(forecastRounded), 0.1)) * 1000) / 10
      : null;

    rows.push({
      id: `${param}-${i}`,
      timestamp: ts.toISOString(),
      timestampIST: resolution === "daily"
        ? ts.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : ts.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
      parameter: param,
      actual: actualValue,
      forecast: forecastRounded,
      diffPercent: diff,
      quality,
      provider,
      notes,
    });
  }

  return rows;
}

// ── Public API ──
export function getHistoricalData(
  params: ParameterId[],
  resolution: Resolution,
  days: number,
  provider: string
): TimeSeriesRow[] {
  return params.flatMap((p) => generateRows(p, resolution, days, provider));
}

// ── Export size estimates ──
export function estimateExportSize(rowCount: number, format: "csv" | "xlsx" | "json"): string {
  const bytesPerRow: Record<string, number> = { csv: 120, xlsx: 200, json: 280 };
  const bytes = rowCount * bytesPerRow[format];
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── API request template ──
export function buildApiRequest(
  params: ParameterId[],
  resolution: Resolution,
  startDate: string,
  endDate: string,
  provider: string,
  format: string
): string {
  return `GET /api/v1/historical-data
  ?parameters=${params.join(",")}
  &resolution=${resolution}
  &start=${startDate}
  &end=${endDate}
  &provider=${encodeURIComponent(provider)}
  &format=${format}
  &quality_flags=true
  &include_forecast=true

Headers:
  Authorization: Bearer <YOUR_API_KEY>
  X-Utility-ID: tata-power-mumbai
  Accept: application/${format === "csv" ? "csv" : format === "json" ? "json" : "vnd.openxmlformats-officedocument.spreadsheetml.sheet"}`;
}
