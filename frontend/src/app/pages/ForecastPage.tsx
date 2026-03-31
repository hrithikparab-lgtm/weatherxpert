import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useRole } from "../components/RoleContext";
import {
  ForecastExplorerChart,
  PROVIDERS,
  type TabId,
} from "../components/forecast/ForecastExplorerChart";
import { ForecastDataTable } from "../components/forecast/ForecastDataTable";
import {
  ForecastPageSkeleton,
} from "../components/forecast/ForecastSkeletons";
import {
  MapPin,
  Calendar,
  Radio,
  RefreshCw,
  SlidersHorizontal,
  X,
  Download,
  ExternalLink,
  Clock,
  ChevronDown,
  Save,
  Share2,
  Image,
  FileText,
  CheckCircle2,
  Bookmark,
  Link2,
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   FORECAST EXPLORER PAGE
   Tabs: 1D / 7D / 15D / 30D / Monthly / Yearly
   Multi-provider overlay chart · Numeric table ·
   Compare-date · Confidence bands · CSV/Excel/API export
   ═══════════════════════════════════════════════════ */

// ── Tab definitions ──
const TABS: { id: TabId; label: string; shortLabel: string }[] = [
  { id: "hourly", label: "Hourly", shortLabel: "1H" },
  { id: "7day", label: "7 Day", shortLabel: "7D" },
  { id: "accuracy", label: "Accuracy", shortLabel: "Acc" },
];

// ── Filter Bar State ──
const STATES = ["Maharashtra", "Delhi", "Gujarat", "Rajasthan", "Tamil Nadu"];
const DISCOMS = ["Mumbai Distribution", "Delhi Distribution", "MSEDCL", "Ajmer DISCOM"];
const PROVIDER_LIST = ["IMD", "Tomorrow.io", "All Providers"];

// ── Page Props ──
interface ForecastPageProps {
  selectedUtility: string;
  initialTab?: string;
}

export function ForecastPage({ selectedUtility, initialTab }: ForecastPageProps) {
  const { can } = useRole();
  const navigate = useNavigate();

  // Check URL params for provider filtering
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const providerParam = params.get("provider");
    
    if (providerParam) {
      // Map provider parameter to provider ID
      const providerMap: Record<string, string> = {
        "imd": "imd",
        "tomorrowio": "tomorrow",
        "tomorrow": "tomorrow",
      };
      
      const providerId = providerMap[providerParam.toLowerCase()];
      if (providerId) {
        // Enable only the specified provider
        setEnabledProviders(new Set([providerId]));
      }
    }
  }, []);

  // Loading
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(t);
  }, [selectedUtility]);

  // Tabs
  const resolveTab = useCallback((t?: string): TabId => {
    if (t === "hourly") return "hourly";
    if (t === "7day") return "7day";
    if (t === "accuracy") return "accuracy";
    return "hourly";
  }, []);
  
  const [activeTab, setActiveTab] = useState<TabId>(() => resolveTab(initialTab));
  
  // Update tab if initialTab changes (e.g. navigation)
  useEffect(() => {
    setActiveTab(resolveTab(initialTab));
  }, [initialTab, resolveTab]);

  // Providers
  const [enabledProviders, setEnabledProviders] = useState<Set<string>>(
    new Set(PROVIDERS.map((p) => p.id))
  );
  const toggleProvider = useCallback((id: string) => {
    setEnabledProviders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Compare date
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareDate, setCompareDate] = useState(
    new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  );

  // Confidence bands toggle
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);

  // Data quality
  const [dataQuality, setDataQuality] = useState(94);

  // Saved presets
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState("");

  // Filter bar state
  const [filterState, setFilterState] = useState("Maharashtra");
  const [filterDiscom, setFilterDiscom] = useState(selectedUtility);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterProvider, setFilterProvider] = useState("All Providers");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleFilterChange = useCallback((type: string, value: string) => {
    switch (type) {
      case 'state':
        setFilterState(value);
        break;
      case 'discom':
        setFilterDiscom(value);
        break;
      case 'date':
        setFilterDate(value);
        break;
      case 'provider':
        setFilterProvider(value);
        break;
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Forecast data refreshed", { description: "Loaded latest model runs from providers." });
    }, 1200);
  }, []);

  const handleExport = useCallback(() => {
    toast.info("Preparing export...", { duration: 1000 });
    setTimeout(() => {
      const headers = ["Date", "Time", "Provider", "Temperature(C)", "Humidity(%)", "Wind(km/h)"];
      const rows = [
        ["2023-10-25", "00:00", "IMD", "24.5", "65", "12"],
        ["2023-10-25", "01:00", "Tomorrow.io", "24.2", "66", "11"],
        ["2023-10-25", "02:00", "IMD", "23.9", "68", "10"],
        ["2023-10-25", "03:00", "Tomorrow.io", "23.7", "70", "10"],
      ];
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `forecast_export_${selectedUtility.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Export Complete", { description: "Forecast data downloaded successfully." });
    }, 800);
  }, [selectedUtility]);

  // Save current view as preset
  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }
    
    const preset = {
      name: presetName,
      tab: activeTab,
      providers: Array.from(enabledProviders),
      compareEnabled,
      compareDate,
      showConfidenceBands,
      state: filterState,
      discom: filterDiscom,
      date: filterDate,
      provider: filterProvider,
    };
    
    // Save to localStorage
    const presets = JSON.parse(localStorage.getItem("weatherxpert_presets") || "[]");
    presets.push(preset);
    localStorage.setItem("weatherxpert_presets", JSON.stringify(presets));
    
    toast.success("Preset saved", { 
      description: `"${presetName}" has been saved successfully.`,
      icon: <CheckCircle2 className="w-4 h-4" />
    });
    
    setPresetName("");
    setShowPresetDialog(false);
  }, [presetName, activeTab, enabledProviders, compareEnabled, compareDate, showConfidenceBands, filterState, filterDiscom, filterDate, filterProvider]);

  // Generate and copy share link
  const handleShareLink = useCallback(() => {
    const params = new URLSearchParams({
      tab: activeTab,
      providers: Array.from(enabledProviders).join(","),
      compare: compareEnabled.toString(),
      compareDate: compareDate,
      confidenceBands: showConfidenceBands.toString(),
      state: filterState,
      discom: filterDiscom,
      date: filterDate,
    });
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Link copied to clipboard", {
        description: "Share this link to collaborate with your team.",
        icon: <Link2 className="w-4 h-4" />
      });
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  }, [activeTab, enabledProviders, compareEnabled, compareDate, showConfidenceBands, filterState, filterDiscom, filterDate]);

  const dateDisplay = new Date(filterDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (isLoading) {
    return <ForecastPageSkeleton />;
  }

  return (
    <div className="relative">
      {/* ═══════ 1. STICKY GLOBAL FILTER BAR ═══════ */}
      {/* Desktop */}
      <div className="sticky top-0 z-30 hidden lg:flex items-center justify-between gap-3 bg-background/95 backdrop-blur-md border-b border-border px-6 py-2.5 transition-colors duration-300">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* State */}
          <FilterChip icon={MapPin} label="State">
            <select value={filterState} onChange={(e) => handleFilterChange('state', e.target.value)} className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer">
              {STATES.map((s) => <option key={s} value={s} className="bg-popover text-foreground">{s}</option>)}
            </select>
          </FilterChip>

          {/* DISCOM */}
          <FilterChip label="DISCOM">
            <select value={filterDiscom} onChange={(e) => handleFilterChange('discom', e.target.value)} className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer">
              {DISCOMS.map((d) => <option key={d} value={d} className="bg-popover text-foreground">{d}</option>)}
            </select>
          </FilterChip>

          {/* Date */}
          <FilterChip icon={Calendar} label="Date">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer w-[105px]"
            />
          </FilterChip>

          {/* Provider */}
          <FilterChip icon={Radio} label="Provider">
            <select value={filterProvider} onChange={(e) => handleFilterChange('provider', e.target.value)} className="bg-transparent text-[12px] text-foreground font-medium border-none outline-none cursor-pointer">
              {PROVIDER_LIST.map((p) => <option key={p} value={p} className="bg-popover text-foreground">{p}</option>)}
            </select>
          </FilterChip>

          {/* Data Quality Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
            dataQuality >= 90 
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
              : dataQuality >= 75
              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          }`}>
            <CheckCircle2 className={`w-3.5 h-3.5 ${
              dataQuality >= 90 
                ? "text-emerald-600 dark:text-emerald-400"
                : dataQuality >= 75
                ? "text-amber-600 dark:text-amber-400"
                : "text-red-600 dark:text-red-400"
            }`} />
            <span className={`text-[11px] font-bold ${
              dataQuality >= 90 
                ? "text-emerald-700 dark:text-emerald-400"
                : dataQuality >= 75
                ? "text-amber-700 dark:text-amber-400"
                : "text-red-700 dark:text-red-400"
            }`}>
              Data Quality: {dataQuality}%
            </span>
          </div>
        </div>

        <button 
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[12px] font-medium hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Mobile filter toggle */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 bg-background/95 backdrop-blur-md border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-[13px] text-foreground font-medium">
          <MapPin className="w-4 h-4 text-primary" />
          {filterDiscom}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{dateDisplay}</span>
          <button 
            onClick={handleRefresh} 
            className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
             <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setMobileFilterOpen(true)} className="p-2 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute top-0 left-0 right-0 bg-card border-b border-border shadow-xl p-4 space-y-3 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] text-foreground font-medium">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2">
              <MobileFilter label="State" value={filterState} options={STATES} onChange={setFilterState} />
              <MobileFilter label="DISCOM" value={filterDiscom} options={DISCOMS} onChange={setFilterDiscom} />
              <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="flex-1 bg-transparent text-[13px] text-foreground border-none outline-none" />
              </div>
              <MobileFilter label="Provider" value={filterProvider} options={PROVIDER_LIST} onChange={setFilterProvider} />
            </div>
            <button onClick={() => setMobileFilterOpen(false)} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-[13px] font-medium">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="px-4 md:px-6 py-5 max-w-[1600px] space-y-5 animate-in fade-in duration-500">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-[22px] md:text-[26px] text-foreground tracking-tight">
              Forecast Explorer
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Multi-provider forecast analysis · {selectedUtility} ·{" "}
              <span className="tabular-nums">{dateDisplay}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {/* Save Preset */}
            <button 
              onClick={() => setShowPresetDialog(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary border border-border rounded-lg text-[12px] text-foreground hover:bg-secondary/80 transition-colors font-medium"
            >
              <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
              Save Preset
            </button>

            {/* Share Link */}
            <button 
              onClick={handleShareLink}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary border border-border rounded-lg text-[12px] text-foreground hover:bg-secondary/80 transition-colors font-medium"
            >
              <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
              Share Link
            </button>

            {can("export") && (
              <button 
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 bg-secondary border border-border rounded-lg text-[12px] text-foreground hover:bg-secondary/80 transition-colors font-medium"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                Export
              </button>
            )}
            <button 
              onClick={() => {
                toast.dismiss(); // Clear any pending toasts
                navigate("/accuracy");
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] hover:bg-primary/90 transition-colors font-medium shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Detailed Analytics
            </button>
          </div>
        </div>

        {/* ═══════ 2. TAB SWITCHER ═══════ */}
        <div className="flex items-center gap-0.5 bg-secondary/50 border border-border rounded-xl p-1 self-start overflow-x-auto no-scrollbar w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* ═══════ 3. MAIN AREA — Chart + Table ═══════ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left: Chart (2/3 width on xl) */}
          <div className="xl:col-span-2 min-w-0">
            <ForecastExplorerChart
              activeTab={activeTab}
              enabledProviders={enabledProviders}
              onToggleProvider={toggleProvider}
              compareEnabled={compareEnabled}
              onToggleCompare={() => setCompareEnabled((p) => !p)}
              compareDate={compareDate}
              onCompareDateChange={setCompareDate}
              showConfidenceBands={showConfidenceBands}
              onToggleConfidenceBands={() => setShowConfidenceBands(p => !p)}
            />
          </div>

          {/* Right: Numeric table (1/3 on xl, full on mobile) */}
          <div className="xl:col-span-1 min-w-0">
            <ForecastDataTable
              activeTab={activeTab}
              compareEnabled={compareEnabled}
              compareDate={compareDate}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-2 pb-4 border-t border-border/60 text-[10px] text-muted-foreground/60">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Auto-refresh: 5 min · Last sync:{" "}
            <span className="tabular-nums">
              {new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
          <span>WeatherXpert v2.4.1 — Sources: IMD, Tomorrow.io</span>
        </div>
      </div>

      {/* Save Preset Dialog */}
      {showPresetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPresetDialog(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                <Save className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-[16px] text-foreground font-medium">Save View as Preset</h2>
                <p className="text-[11px] text-muted-foreground">Quick access to your favorite configurations</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[12px] text-muted-foreground font-medium block mb-2">
                  Preset Name
                </label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g., Mumbai 7-Day Compare"
                  className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/40"
                  autoFocus
                />
              </div>

              <div className="bg-secondary/50 border border-border rounded-lg p-3 space-y-2 text-[11px]">
                <p className="text-muted-foreground font-medium">This preset will save:</p>
                <ul className="space-y-1 text-muted-foreground/80">
                  <li>• Tab: {activeTab === "hourly" ? "Hourly" : activeTab === "7day" ? "7 Day" : "Accuracy"}</li>
                  <li>• Enabled providers: {Array.from(enabledProviders).length}</li>
                  <li>• Compare mode: {compareEnabled ? "ON" : "OFF"}</li>
                  <li>• Confidence bands: {showConfidenceBands ? "ON" : "OFF"}</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPresetDialog(false)}
                  className="flex-1 py-2.5 bg-secondary border border-border text-foreground rounded-xl text-[13px] font-medium hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreset}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Save Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helper: Desktop filter chip ─── */
function FilterChip({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 min-w-max">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold hidden xl:inline">
        {label}
      </span>
      {children}
    </div>
  );
}

/* ─── Helper: Mobile filter row ─── */
function MobileFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-2">
      <span className="text-[11px] text-muted-foreground font-medium min-w-[60px]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-[13px] text-foreground font-medium border-none outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-popover text-foreground">{o}</option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
  );
}