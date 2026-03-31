import { useState, useMemo, useCallback } from "react";
import { useRole } from "../components/RoleContext";
import { AccuracyKpiCards } from "../components/accuracy/AccuracyKpiCards";
import { ProviderComparisonChart } from "../components/accuracy/ProviderComparisonChart";
import { ErrorDistribution } from "../components/accuracy/ErrorDistribution";
import { ProviderRankingTable } from "../components/accuracy/ProviderRankingTable";
import { AnnotationTool } from "../components/accuracy/AnnotationTool";
import { CustomMetricBuilder } from "../components/accuracy/CustomMetricBuilder";
import {
  getAllKpiSnapshots,
  getTimeSeriesData,
  getErrorDistribution,
  getProviderRankings,
  PROVIDERS,
  METRICS,
  DATE_PRESETS,
  REGIONS,
  DEFAULT_ANNOTATIONS,
  type MetricId,
  type Annotation,
  type CustomMetric,
} from "../components/accuracy/accuracyData";
import {
  Target,
  Calendar,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  SlidersHorizontal,
  X,
  BarChart3,
  Award,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Wind,
  CloudRain,
  AlertCircle,
  Plus,
  Check,
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   ACCURACY & ANALYTICS PAGE
   Provider evaluation  ·  KPIs  ·  Comparison chart
   Error histogram  ·  Ranking  ·  Drill-in
   Annotation tool  ·  Custom metric builder
   Enhanced: Best Provider Badge · Trend Chart · 
   Metric Selector · Confidence Intervals · Event Overlays
   ═══════════════════════════════════════════════════ */

export function AccuracyPage() {
  const { can } = useRole();

  // Top controls
  const [activeDays, setActiveDays] = useState(30);
  const [activeMetric, setActiveMetric] = useState<MetricId>("mae");
  const [region, setRegion] = useState("All Regions");
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(
    new Set(PROVIDERS.map((p) => p.id))
  );
  const [showErrorBands, setShowErrorBands] = useState(true);

  // Annotations
  const [annotations, setAnnotations] = useState<Annotation[]>(DEFAULT_ANNOTATIONS);

  // Custom metrics
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>([]);

  // Mobile
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── NEW: Enhanced Features ──
  // Confidence interval toggle
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(false);
  
  // Event overlay markers
  const [showEventOverlays, setShowEventOverlays] = useState(true);
  
  // Custom metric builder popup
  const [customMetricBuilderOpen, setCustomMetricBuilderOpen] = useState(false);
  
  // Metric selector dropdown state
  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false);

  // Data
  const kpis = useMemo(() => getAllKpiSnapshots(), []);
  const timeSeriesData = useMemo(() => getTimeSeriesData(activeMetric, activeDays), [activeMetric, activeDays]);
  const errorDist = useMemo(() => getErrorDistribution(), []);
  const rankings = useMemo(() => getProviderRankings(), []);

  // ── NEW: Calculate best provider ──
  const bestProvider = useMemo(() => {
    if (rankings.length === 0) return null;
    const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
    const best = sorted[0];
    const provider = PROVIDERS.find(p => p.id === best.providerId);
    if (!provider) return null;
    
    return {
      ...provider,
      score: best.score,
      rank: best.rank,
      trend: best.trend,
    };
  }, [rankings]);

  // ── NEW: Calculate accuracy trend ──
  const accuracyTrend = useMemo(() => {
    if (timeSeriesData.length === 0) return { direction: "stable" as const, percentChange: 0 };
    
    const recentData = timeSeriesData.slice(-7); // Last 7 data points
    const olderData = timeSeriesData.slice(0, 7); // First 7 data points
    
    if (recentData.length === 0 || olderData.length === 0) return { direction: "stable" as const, percentChange: 0 };
    
    // Average the Tomorrow.io (best performer) values
    const recentAvg = recentData.reduce((sum, d) => sum + ((d.tomorrow_io as number) || 0), 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, d) => sum + ((d.tomorrow_io as number) || 0), 0) / olderData.length;
    
    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    // For error metrics (MAE, RMSE, etc), lower is better, so trend is inverted
    const metricDef = METRICS.find(m => m.id === activeMetric);
    const lowerIsBetter = metricDef?.lowerIsBetter ?? true;
    
    const direction = lowerIsBetter 
      ? (percentChange < -5 ? "improving" : percentChange > 5 ? "declining" : "stable")
      : (percentChange > 5 ? "improving" : percentChange < -5 ? "declining" : "stable");
    
    return { direction, percentChange: Math.abs(percentChange) };
  }, [timeSeriesData, activeMetric]);

  // Handlers
  const toggleProvider = useCallback((id: string) => {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const addAnnotation = useCallback((ann: Omit<Annotation, "id">) => {
    setAnnotations((prev) => [...prev, { ...ann, id: `ann-${Date.now()}` }]);
  }, []);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addCustomMetric = useCallback((m: Omit<CustomMetric, "id">) => {
    setCustomMetrics((prev) => [...prev, { ...m, id: `cm-${Date.now()}` }]);
  }, []);

  const removeCustomMetric = useCallback((id: string) => {
    setCustomMetrics((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] animate-in fade-in duration-500">
      {/* ═══ PAGE HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
            <Target className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-foreground">Accuracy & Analytics</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Provider evaluation, error analysis, and forecast performance metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-secondary border border-border rounded-xl text-[12px] text-foreground font-medium"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
          {can("export") && (
            <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══ TOP CONTROL BAR ═══ */}
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Provider selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap">Providers:</span>
            {PROVIDERS.map((p) => {
              const isActive = selectedProviders.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProvider(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-card border-border shadow-sm"
                      : "border-transparent text-muted-foreground/50 line-through hover:text-muted-foreground hover:border-border/50"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-30"}`}
                    style={{ backgroundColor: p.color }}
                  />
                  {p.shortName}
                  {isActive ? (
                    <Eye className="w-2.5 h-2.5 text-muted-foreground/50" />
                  ) : (
                    <EyeOff className="w-2.5 h-2.5 text-muted-foreground/30" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            {/* Region selector */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/50 border border-border rounded-lg">
              <span className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">Region</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-transparent text-[11px] text-foreground font-medium border-none outline-none cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="bg-popover text-foreground">{r}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-0.5 bg-secondary/50 p-0.5 rounded-lg border border-border">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => setActiveDays(preset.days)}
                  className={`px-2 py-1.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-all ${
                    activeDays === preset.days
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Error band toggle */}
            <button
              onClick={() => setShowErrorBands(!showErrorBands)}
              className={`hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                showErrorBands
                  ? "bg-primary/8 border-primary/15 text-primary"
                  : "bg-secondary/50 border-border text-muted-foreground"
              }`}
              title="Toggle error bands"
            >
              <BarChart3 className="w-3 h-3" />
              Bands
            </button>
          </div>
        </div>
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <AccuracyKpiCards
        kpis={kpis}
        activeMetric={activeMetric}
        onSelectMetric={setActiveMetric}
      />

      {/* ═══ NEW: Enhanced Analytics Panel ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Best Provider Badge */}
        {bestProvider && (
          <div className="rounded-xl border border-border bg-gradient-to-br from-chart-3/5 to-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-chart-3/15 rounded-lg">
                <Award className="w-3.5 h-3.5 text-chart-3" />
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Best Provider</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bestProvider.color }} />
              <span className="text-[15px] text-foreground font-semibold">{bestProvider.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-muted-foreground">Score:</span>
              <span className="text-[13px] text-chart-3 font-semibold tabular-nums">{bestProvider.score.toFixed(1)}</span>
              {bestProvider.trend === "up" && <TrendingUp className="w-3 h-3 text-chart-3" />}
              {bestProvider.trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
            </div>
          </div>
        )}

        {/* Accuracy Trend */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${
              accuracyTrend.direction === "improving" ? "bg-chart-3/15" :
              accuracyTrend.direction === "declining" ? "bg-destructive/15" :
              "bg-secondary"
            }`}>
              <Activity className={`w-3.5 h-3.5 ${
                accuracyTrend.direction === "improving" ? "text-chart-3" :
                accuracyTrend.direction === "declining" ? "text-destructive" :
                "text-muted-foreground"
              }`} />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Accuracy Trend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[15px] font-semibold capitalize ${
              accuracyTrend.direction === "improving" ? "text-chart-3" :
              accuracyTrend.direction === "declining" ? "text-destructive" :
              "text-foreground"
            }`}>
              {accuracyTrend.direction}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {accuracyTrend.direction === "improving" && <TrendingUp className="w-3 h-3 text-chart-3" />}
            {accuracyTrend.direction === "declining" && <TrendingDown className="w-3 h-3 text-destructive" />}
            <span className="text-[11px] text-muted-foreground">
              {accuracyTrend.percentChange > 0 && `${accuracyTrend.percentChange.toFixed(1)}% vs baseline`}
              {accuracyTrend.percentChange === 0 && "Steady performance"}
            </span>
          </div>
        </div>

        {/* Metric Selector Dropdown */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active Metric</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setMetricDropdownOpen(!metricDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 border border-border text-[12px] text-foreground font-medium hover:bg-secondary transition-colors"
            >
              <span>{METRICS.find(m => m.id === activeMetric)?.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${metricDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {metricDropdownOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 z-50 py-1 bg-popover border border-border rounded-xl shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                {METRICS.map((metric) => (
                  <button
                    key={metric.id}
                    onClick={() => {
                      setActiveMetric(metric.id);
                      setMetricDropdownOpen(false);
                      toast.success(`Switched to ${metric.label}`);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-secondary transition-colors ${
                      activeMetric === metric.id ? "text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    {activeMetric === metric.id && <Check className="w-3 h-3 text-primary" />}
                    <span className="flex-1 text-left">{metric.label}</span>
                    <span className="text-[9px] text-muted-foreground">{metric.unit}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground/60 mt-2">
            {METRICS.find(m => m.id === activeMetric)?.description}
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Display Options</span>
          </div>
          <div className="space-y-2">
            {/* Confidence Interval Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showConfidenceInterval}
                onChange={(e) => {
                  setShowConfidenceInterval(e.target.checked);
                  toast.success(e.target.checked ? "Confidence intervals enabled" : "Confidence intervals disabled");
                }}
                className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
              />
              <span className="text-[11px] text-foreground font-medium group-hover:text-primary transition-colors">
                Confidence Interval
              </span>
            </label>

            {/* Event Overlay Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={showEventOverlays}
                onChange={(e) => {
                  setShowEventOverlays(e.target.checked);
                  toast.success(e.target.checked ? "Event overlays shown" : "Event overlays hidden");
                }}
                className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
              />
              <span className="text-[11px] text-foreground font-medium group-hover:text-primary transition-colors">
                Event Overlays
              </span>
            </label>

            {/* Custom Metric Builder Button */}
            <button
              onClick={() => {
                setCustomMetricBuilderOpen(true);
                toast.info("Custom metric builder opened");
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 mt-2 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-primary font-medium hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Build Custom Metric
            </button>
          </div>
        </div>
      </div>

      {/* ═══ NEW: Event Overlay Markers Info Panel ═══ */}
      {showEventOverlays && (
        <div className="rounded-xl border border-border bg-gradient-to-r from-card to-secondary/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-[12px] text-foreground font-semibold mb-1">Event Overlay Markers Active</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
                Weather events are marked on the timeline to correlate accuracy changes with environmental conditions.
              </p>
              <div className="flex flex-wrap gap-2">
                {annotations.map((ann) => {
                  const icons = {
                    cyclone: <Wind className="w-3 h-3" />,
                    heatwave: <Zap className="w-3 h-3" />,
                    monsoon: <CloudRain className="w-3 h-3" />,
                    maintenance: <Activity className="w-3 h-3" />,
                    custom: <AlertCircle className="w-3 h-3" />,
                  };
                  const colors = {
                    cyclone: "text-destructive bg-destructive/10 border-destructive/20",
                    heatwave: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                    monsoon: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                    maintenance: "text-muted-foreground bg-secondary border-border",
                    custom: "text-primary bg-primary/10 border-primary/20",
                  };
                  return (
                    <div
                      key={ann.id}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-medium ${colors[ann.type]}`}
                      title={ann.description}
                    >
                      {icons[ann.type]}
                      <span>{ann.label}</span>
                      <span className="text-[8px] opacity-60">{ann.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NEW: Custom Metric Builder Popup ═══ */}
      {customMetricBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCustomMetricBuilderOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] text-foreground font-medium">Custom Metric Builder</h3>
                  <p className="text-[10px] text-muted-foreground">Create your own accuracy calculation</p>
                </div>
              </div>
              <button
                onClick={() => setCustomMetricBuilderOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Metric Name</label>
                <input
                  type="text"
                  placeholder="e.g., Weighted Accuracy Score"
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary/30 border border-border text-[12px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Formula</label>
                <input
                  type="text"
                  placeholder="e.g., (MAE * 0.4) + (RMSE * 0.3) + (Bias * 0.3)"
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary/30 border border-border text-[12px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Unit</label>
                <input
                  type="text"
                  placeholder="e.g., °C, %, score"
                  className="w-full px-3 py-2.5 rounded-lg bg-secondary/30 border border-border text-[12px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
                <h4 className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Available Metrics</h4>
                <div className="flex flex-wrap gap-1.5">
                  {METRICS.map((m) => (
                    <span key={m.id} className="px-2 py-1 rounded-md bg-card border border-border text-[9px] text-foreground font-medium font-mono">
                      {m.shortLabel}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.success("Custom metric created successfully!");
                    setCustomMetricBuilderOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Create Metric
                </button>
                <button
                  onClick={() => setCustomMetricBuilderOpen(false)}
                  className="px-4 py-2.5 bg-secondary text-foreground rounded-xl text-[12px] font-medium hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MAIN CHARTS ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Provider comparison — 2/3 width */}
        <div className="xl:col-span-2">
          <ProviderComparisonChart
            data={timeSeriesData}
            metricId={activeMetric}
            selectedProviders={selectedProviders}
            annotations={annotations}
            showErrorBands={showErrorBands}
          />
        </div>
        {/* Error distribution — 1/3 width */}
        <div className="xl:col-span-1">
          <ErrorDistribution
            data={errorDist}
            selectedProviders={selectedProviders}
          />
        </div>
      </div>

      {/* ═══ RANKING TABLE ═══ */}
      <ProviderRankingTable
        rankings={rankings}
        activeMetric={activeMetric}
      />

      {/* ═══ ANNOTATION + CUSTOM METRIC ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnnotationTool
          annotations={annotations}
          onAdd={addAnnotation}
          onRemove={removeAnnotation}
        />
        <CustomMetricBuilder
          metrics={customMetrics}
          onAdd={addCustomMetric}
          onRemove={removeCustomMetric}
        />
      </div>

      {/* ═══ MOBILE FILTER DRAWER ═══ */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl shadow-xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-[14px] text-foreground font-medium">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Provider toggles */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Providers</h4>
                {PROVIDERS.map((p) => {
                  const isActive = selectedProviders.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProvider(p.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? "bg-primary/8 border border-primary/15"
                          : "bg-secondary/30 border border-transparent"
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color, opacity: isActive ? 1 : 0.3 }} />
                      <span className={`text-[12px] font-medium flex-1 text-left ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {p.name}
                      </span>
                      {isActive && <Eye className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
              {/* Region */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Region</h4>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2.5 bg-secondary/30 border border-border rounded-xl text-[12px] text-foreground outline-none"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r} className="bg-popover">{r}</option>
                  ))}
                </select>
              </div>
              {/* Date range */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Date Range</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {DATE_PRESETS.map((preset) => (
                    <button
                      key={preset.days}
                      onClick={() => setActiveDays(preset.days)}
                      className={`px-2 py-2 rounded-lg text-[11px] font-medium transition-all ${
                        activeDays === preset.days
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Error bands */}
              <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/30 border border-border/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showErrorBands}
                  onChange={(e) => setShowErrorBands(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                />
                <span className="text-[12px] text-foreground font-medium">Show error bands</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}