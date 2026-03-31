import { useState, useEffect } from "react";
import {
  Download,
  ExternalLink,
  RefreshCw,
  Sun,
  Wind,
  ArrowLeftRight,
  TrendingUp,
  IndianRupee,
  Award,
  Shield,
} from "lucide-react";
import { useRole } from "../RoleContext";
import { RenewablesFilterBar } from "./RenewablesFilterBar";
import { AccuracySummaryCards } from "./AccuracySummaryCards";
import { WindProfileChart } from "./WindProfileChart";
import { SolarIrradianceChart } from "./SolarIrradianceChart";
import { EnergyEstimateChart } from "./EnergyEstimateChart";
import { ProviderComparisonTable } from "./ProviderComparisonTable";
import {
  RenewablesPageSkeleton,
  RenewablesEmptyState,
} from "./RenewablesSkeletons";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   RENEWABLES DASHBOARD — Analytics-first layout
   Solar: GHI/DNI/DHI + Energy + Provider comparison
   Wind: Multi-height profile + Energy + Providers
   ═══════════════════════════════════════════════════ */

interface RenewablesDashboardProps {
  selectedUtility: string;
}

export function RenewablesDashboard({ selectedUtility }: RenewablesDashboardProps) {
  const { can } = useRole();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHeight, setSelectedHeight] = useState("100m");
  const [comparePrevious, setComparePrevious] = useState(false);

  const isSolar = selectedUtility.toLowerCase().includes("solar");
  const isWind = selectedUtility.toLowerCase().includes("wind");

  // Mock forecast confidence - would come from API
  const [forecastConfidence, setForecastConfidence] = useState<"high" | "medium" | "low">("high");

  // Simulate loading on utility switch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedUtility]);

  // Calculate deviation penalty estimate
  const deviationPenalty = {
    projected: "₹2,45,000",
    percentChange: "-18%",
    trend: "improving" as const,
  };

  const toggleComparison = () => {
    setComparePrevious(!comparePrevious);
    toast.success(comparePrevious ? "Comparison disabled" : "Comparing vs previous period");
  };

  if (isLoading) {
    return <RenewablesPageSkeleton />;
  }

  return (
    <div className="relative">
      {/* ── 1. Advanced Filter Bar ── */}
      <RenewablesFilterBar
        isSolar={isSolar}
        selectedHeight={selectedHeight}
        onHeightChange={setSelectedHeight}
      />

      {/* ── Main Content ── */}
      <div className="px-4 md:px-6 py-5 max-w-[1600px] space-y-5 animate-in fade-in duration-500">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {isSolar ? (
                <Sun className="w-5 h-5 text-chart-2" />
              ) : (
                <Wind className="w-5 h-5 text-chart-3" />
              )}
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                {isSolar ? "Solar Analytics" : "Wind Analytics"}
              </span>
              {/* Forecast Confidence Badge */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                forecastConfidence === "high"
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                  : forecastConfidence === "medium"
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
              }`}>
                <Shield className="w-3 h-3" />
                {forecastConfidence.toUpperCase()} CONFIDENCE
              </div>
              {/* Best Provider Tag */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400">
                <Award className="w-3 h-3" />
                TOP ACCURACY LAST 30 DAYS
              </div>
            </div>
            <h1 className="text-[22px] md:text-[26px] text-foreground tracking-tight">
              {selectedUtility}
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Forecast accuracy analytics · Provider benchmarking ·{" "}
              <span className="tabular-nums">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Compare vs Previous Period Toggle */}
            <button
              onClick={toggleComparison}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                comparePrevious
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                  : "bg-secondary border border-border text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Compare vs Previous
            </button>

            {can("export") && (
              <button 
                onClick={() => toast.success("Analytics report exported")}
                className="flex items-center gap-1.5 px-3 py-2 bg-secondary border border-border rounded-lg text-[12px] text-foreground hover:bg-secondary/80 transition-colors font-medium"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                Export Report
              </button>
            )}
            <button 
              onClick={() => toast.info("Opening detailed analytics...")}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] hover:bg-primary/90 transition-colors font-medium shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Detailed Analytics
            </button>
          </div>
        </div>

        {/* ── Deviation Penalty Estimator Widget ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 rounded-xl border border-border bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/10 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-5">
              <IndianRupee className="w-32 h-32 text-red-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 ring-1 ring-red-500/20 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-[11px] text-red-700 dark:text-red-400 font-bold uppercase tracking-wider">
                    Deviation Penalty
                  </h3>
                  <p className="text-[10px] text-red-600/70 dark:text-red-400/70">
                    Projected Risk (7d)
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[28px] text-red-900 dark:text-red-200 tracking-tight tabular-nums">
                  {deviationPenalty.projected}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  deviationPenalty.trend === "improving"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}>
                  <TrendingUp className={`w-3 h-3 ${deviationPenalty.trend === "improving" ? "rotate-180" : ""}`} />
                  {deviationPenalty.percentChange}
                </div>
                <span className="text-[10px] text-red-600/70 dark:text-red-400/70">
                  vs last week
                </span>
              </div>
            </div>
          </div>

          {/* Placeholder for additional metrics */}
          <div className="md:col-span-2">
            <AccuracySummaryCards isSolar={isSolar} />
          </div>
        </div>

        {/* ── 2. Accuracy Summary Cards ── */}
        {/* Moved above in grid */}

        {/* ── 3. Three-up Charts (responsive) ── */}
        {/* Row 1: Two side-by-side on xl, stacked on mobile */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Chart A: Wind profile OR Solar irradiance */}
          {isWind ? (
            <WindProfileChart selectedHeight={selectedHeight} comparePrevious={comparePrevious} />
          ) : (
            <SolarIrradianceChart comparePrevious={comparePrevious} />
          )}

          {/* Chart B: Forecast vs Actual energy */}
          <EnergyEstimateChart isSolar={isSolar} comparePrevious={comparePrevious} />
        </div>

        {/* Row 2: The complementary chart (full width) */}
        {isWind ? (
          <SolarIrradianceChart comparePrevious={comparePrevious} />
        ) : (
          <WindProfileChart selectedHeight={selectedHeight} comparePrevious={comparePrevious} />
        )}

        {/* ── 4. Provider Comparison Table ── */}
        <ProviderComparisonTable isSolar={isSolar} />

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-2 pb-4 border-t border-border/60 text-[10px] text-muted-foreground/60">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" />
            Auto-refresh: 5 min · Last sync:{" "}
            <span className="tabular-nums">
              {new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
          <span>
            WeatherXpert v2.4.1 — Sources: IMD, Tomorrow.io, Plant SCADA
          </span>
        </div>
      </div>
    </div>
  );
}