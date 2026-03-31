/* ═══════════════════════════════════════════════════
   ACCURACY DATA — Providers, KPIs, time-series,
   error distributions, ranking, annotations
   ═══════════════════════════════════════════════════ */

export type MetricId = "mae" | "rmse" | "mbe" | "bias" | "correlation";

export interface AccuracyMetric {
  id: MetricId;
  label: string;
  shortLabel: string;
  unit: string;
  description: string;
  lowerIsBetter: boolean;
}

export interface ProviderRecord {
  id: string;
  name: string;
  color: string;
  shortName: string;
}

export interface KpiSnapshot {
  metricId: MetricId;
  value: number;
  prevValue: number;
  changePercent: number;
}

export interface TimeSeriesPoint {
  date: string;
  [providerKey: string]: number | string | null;
}

export interface ErrorBin {
  range: string;
  rangeMin: number;
  rangeMax: number;
  [providerKey: string]: number | string;
}

export interface ProviderRank {
  providerId: string;
  rank: number;
  mae: number;
  rmse: number;
  mbe: number;
  bias: number;
  correlation: number;
  score: number;
  trend: "up" | "down" | "stable";
  regions: RegionRank[];
}

export interface RegionRank {
  region: string;
  mae: number;
  rmse: number;
  score: number;
}

export interface Annotation {
  id: string;
  date: string;
  label: string;
  type: "cyclone" | "heatwave" | "monsoon" | "maintenance" | "custom";
  description: string;
}

export interface CustomMetric {
  id: string;
  name: string;
  formula: string;
  unit: string;
}

// ── Metric definitions ──
export const METRICS: AccuracyMetric[] = [
  { id: "mae", label: "Mean Abs. Error", shortLabel: "MAE", unit: "°C", description: "Average absolute difference between forecast and actual", lowerIsBetter: true },
  { id: "rmse", label: "Root Mean Sq. Error", shortLabel: "RMSE", unit: "°C", description: "Square root of average squared errors", lowerIsBetter: true },
  { id: "mbe", label: "Mean Bias Error", shortLabel: "MBE", unit: "°C", description: "Average signed difference (positive = over-forecast)", lowerIsBetter: true },
  { id: "bias", label: "Bias", shortLabel: "Bias", unit: "%", description: "Systematic tendency to over- or under-forecast", lowerIsBetter: true },
  { id: "correlation", label: "Correlation", shortLabel: "Corr.", unit: "", description: "Pearson correlation coefficient (1.0 = perfect)", lowerIsBetter: false },
];

// ── Providers ──
export const PROVIDERS: ProviderRecord[] = [
  { id: "imd", name: "IMD", color: "var(--chart-1)", shortName: "IMD" },
  { id: "tomorrow_io", name: "Tomorrow.io", color: "var(--chart-3)", shortName: "Tomorrow.io" },
];

// ── Date presets ──
export const DATE_PRESETS = [
  { label: "Last 7d", days: 7 },
  { label: "Last 30d", days: 30 },
  { label: "Last 90d", days: 90 },
  { label: "Last 6mo", days: 180 },
  { label: "Last 1yr", days: 365 },
];

// ── Regions ──
export const REGIONS = [
  "All Regions", "Mumbai Distribution", "Delhi Distribution",
  "Jaisalmer Wind Farm", "Charanka Solar Park", "Mundra UMPP", "Maithon Power",
];

export const BLOCKS = [
  "Block A — Urban Core", "Block B — Suburban Ring", "Block C — Industrial Belt",
  "Block D — Coastal Zone", "Block E — Agricultural",
];

// ── KPI data generator ──
export function getKpiSnapshots(metric: MetricId): KpiSnapshot {
  const kpis: Record<MetricId, KpiSnapshot> = {
    mae:         { metricId: "mae",         value: 1.82, prevValue: 2.14, changePercent: -14.9 },
    rmse:        { metricId: "rmse",        value: 2.47, prevValue: 2.81, changePercent: -12.1 },
    mbe:         { metricId: "mbe",         value: 0.34, prevValue: 0.51, changePercent: -33.3 },
    bias:        { metricId: "bias",        value: 3.8,  prevValue: 5.2,  changePercent: -26.9 },
    correlation: { metricId: "correlation", value: 0.94, prevValue: 0.91, changePercent: 3.3 },
  };
  return kpis[metric];
}

export function getAllKpiSnapshots(): KpiSnapshot[] {
  return METRICS.map((m) => getKpiSnapshots(m.id));
}

// ── Time-series generator (per metric, per provider) ──
export function getTimeSeriesData(metricId: MetricId, days: number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const now = new Date(2026, 1, 11);

  const bases: Record<string, Record<MetricId, { base: number; noise: number }>> = {
    imd:          { mae: { base: 1.9, noise: 0.5 }, rmse: { base: 2.5, noise: 0.6 }, mbe: { base: 0.3, noise: 0.4 }, bias: { base: 4.0, noise: 2 }, correlation: { base: 0.93, noise: 0.03 } },
    tomorrow_io:  { mae: { base: 1.4, noise: 0.4 }, rmse: { base: 2.0, noise: 0.5 }, mbe: { base: 0.1, noise: 0.3 }, bias: { base: 2.5, noise: 1.5 }, correlation: { base: 0.96, noise: 0.02 } },
  };

  const step = days <= 30 ? 1 : days <= 90 ? 3 : 7;

  for (let i = days; i >= 0; i -= step) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    const pt: TimeSeriesPoint = { date: dateStr };

    for (const provider of PROVIDERS) {
      const conf = bases[provider.id][metricId];
      const trend = (days - i) / days * 0.15; // slight improvement trend
      const val = conf.base - trend + (Math.random() - 0.5) * conf.noise;
      pt[provider.id] = metricId === "correlation"
        ? Math.round(Math.min(1, Math.max(0.7, val)) * 1000) / 1000
        : Math.round(Math.max(0, val) * 100) / 100;

      // Error band (upper/lower)
      const bandWidth = conf.noise * 0.6;
      pt[`${provider.id}_upper`] = Math.round(((pt[provider.id] as number) + bandWidth) * 100) / 100;
      pt[`${provider.id}_lower`] = Math.round(Math.max(0, (pt[provider.id] as number) - bandWidth) * 100) / 100;
    }
    points.push(pt);
  }
  return points;
}

// ── Error distribution bins ──
export function getErrorDistribution(): ErrorBin[] {
  const bins = [
    { range: "<0.5", rangeMin: 0, rangeMax: 0.5 },
    { range: "0.5-1.0", rangeMin: 0.5, rangeMax: 1.0 },
    { range: "1.0-1.5", rangeMin: 1.0, rangeMax: 1.5 },
    { range: "1.5-2.0", rangeMin: 1.5, rangeMax: 2.0 },
    { range: "2.0-2.5", rangeMin: 2.0, rangeMax: 2.5 },
    { range: "2.5-3.0", rangeMin: 2.5, rangeMax: 3.0 },
    { range: "3.0-4.0", rangeMin: 3.0, rangeMax: 4.0 },
    { range: ">4.0", rangeMin: 4.0, rangeMax: 6.0 },
  ];

  // Bell-curve-ish distributions per provider with different peaks
  const peaks: Record<string, number> = { imd: 2, tomorrow_io: 1.2 };
  const spreads: Record<string, number> = { imd: 1.5, tomorrow_io: 1.2 };

  return bins.map((bin) => {
    const result: ErrorBin = { range: bin.range, rangeMin: bin.rangeMin, rangeMax: bin.rangeMax };
    const mid = (bin.rangeMin + bin.rangeMax) / 2;

    for (const provider of PROVIDERS) {
      const peak = peaks[provider.id];
      const spread = spreads[provider.id];
      const gaussian = Math.exp(-0.5 * Math.pow((mid - peak) / spread, 2));
      result[provider.id] = Math.round(gaussian * 100 * (0.8 + Math.random() * 0.4));
    }
    return result;
  });
}

// ── Provider ranking ──
export function getProviderRankings(): ProviderRank[] {
  const rankings: ProviderRank[] = [
    {
      providerId: "imd", rank: 1, mae: 1.82, rmse: 2.47, mbe: 0.34, bias: 3.8, correlation: 0.935, score: 88.4, trend: "up",
      regions: [
        { region: "Mumbai Distribution", mae: 1.65, rmse: 2.25, score: 90.2 },
        { region: "Delhi Distribution", mae: 2.05, rmse: 2.72, score: 85.5 },
        { region: "Jaisalmer Wind Farm", mae: 1.80, rmse: 2.45, score: 88.0 },
        { region: "Charanka Solar Park", mae: 1.75, rmse: 2.40, score: 88.8 },
        { region: "Mundra UMPP", mae: 1.85, rmse: 2.50, score: 87.5 },
      ],
    },
    {
      providerId: "tomorrow_io", rank: 2, mae: 1.38, rmse: 1.95, mbe: 0.08, bias: 2.4, correlation: 0.962, score: 94.2, trend: "stable",
      regions: [
        { region: "Mumbai Distribution", mae: 1.22, rmse: 1.75, score: 95.8 },
        { region: "Delhi Distribution", mae: 1.51, rmse: 2.10, score: 92.1 },
        { region: "Jaisalmer Wind Farm", mae: 1.45, rmse: 2.05, score: 93.0 },
        { region: "Charanka Solar Park", mae: 1.30, rmse: 1.85, score: 94.5 },
        { region: "Mundra UMPP", mae: 1.40, rmse: 1.98, score: 93.5 },
      ],
    },
  ];
  return rankings;
}

// ── Annotations (events) ──
export const DEFAULT_ANNOTATIONS: Annotation[] = [
  { id: "ann-1", date: "08 Jan", label: "Cyclone MAHA", type: "cyclone", description: "Category 3 cyclone made landfall near Mumbai causing widespread disruption" },
  { id: "ann-2", date: "22 Jan", label: "Delhi Heatwave", type: "heatwave", description: "Extreme heat event with temperatures exceeding 45°C for 3 consecutive days" },
  { id: "ann-3", date: "03 Feb", label: "Monsoon Onset", type: "monsoon", description: "Early monsoon arrival in southern regions affecting forecast models" },
  { id: "ann-4", date: "06 Feb", label: "WRF Model Update", type: "maintenance", description: "Custom WRF model v3.2 deployed with improved convective parameterization" },
];

export const ANNOTATION_TYPES: { id: Annotation["type"]; label: string; color: string }[] = [
  { id: "cyclone", label: "Cyclone", color: "var(--chart-5)" },
  { id: "heatwave", label: "Heatwave", color: "var(--chart-2)" },
  { id: "monsoon", label: "Monsoon", color: "var(--chart-1)" },
  { id: "maintenance", label: "Maintenance", color: "var(--chart-4)" },
  { id: "custom", label: "Custom", color: "var(--chart-3)" },
];
