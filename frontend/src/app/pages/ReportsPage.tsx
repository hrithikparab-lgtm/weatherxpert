import { useState } from "react";
import { useRole } from "../components/RoleContext";
import {
  ChevronRight,
  MapPin,
  Calendar,
  FileText,
  Download,
  Thermometer,
  CloudRain,
  Wind,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Award,
  Check,
  FileSpreadsheet,
  Mail,
  RotateCcw,
  Eye,
  Search,
  Droplets,
  Gauge,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/* ═══════════════════════════════════════════════════
   REPORTS — Dynamic Report Generation & Export
   Hierarchy: Utility → Location → Parameter → Provider → Date
   ═══════════════════════════════════════════════════ */

type ReportTypeKey =
  | "executive-summary"
  | "location-performance"
  | "provider-accuracy"
  | "risk-alert"
  | "forecast-vs-historical";

type ProviderKey = "imd" | "tomorrow-io";
type Parameter = "temperature" | "rainfall" | "wind" | "humidity";
type DateRange = "7days" | "30days" | "custom";
type ScheduleFrequency = "daily" | "weekly" | "monthly";

// Utilities Configuration
const UTILITIES = [
  { key: "mumbai", name: "Mumbai Distribution" },
  { key: "delhi", name: "Delhi Distribution" },
  { key: "mundra", name: "Mundra UMPP" },
  { key: "solar", name: "Renewables – Solar" },
  { key: "wind", name: "Renewables – Wind" },
];

// Locations by Utility
const LOCATIONS: Record<string, any[]> = {
  mumbai: [
    { key: "colaba", name: "Colaba Substation" },
    { key: "andheri", name: "Andheri Substation" },
    { key: "borivali", name: "Borivali Substation" },
    { key: "kurla", name: "Kurla Substation" },
  ],
  delhi: [
    { key: "connaught", name: "Connaught Place" },
    { key: "rohini", name: "Rohini Substation" },
    { key: "dwarka", name: "Dwarka Substation" },
  ],
  mundra: [
    { key: "unit1", name: "Unit 1 – Coastal" },
    { key: "unit2", name: "Unit 2 – Inland" },
  ],
  solar: [
    { key: "charanka", name: "Charanka Solar Park" },
    { key: "pavagada", name: "Pavagada Solar Farm" },
  ],
  wind: [
    { key: "muppandal", name: "Muppandal Wind Farm" },
    { key: "jaisalmer", name: "Jaisalmer Wind Park" },
  ],
};

// Providers Configuration
const PROVIDERS = [
  { key: "imd" as ProviderKey, name: "IMD", color: "#6366f1" },
  { key: "tomorrow-io" as ProviderKey, name: "Tomorrow.io", color: "#f59e0b" },
];

// Report Types
const REPORT_TYPES = [
  { key: "executive-summary" as ReportTypeKey, label: "Executive Summary" },
  { key: "location-performance" as ReportTypeKey, label: "Location Performance" },
  { key: "provider-accuracy" as ReportTypeKey, label: "Provider Accuracy" },
  { key: "risk-alert" as ReportTypeKey, label: "Risk & Alert" },
  { key: "forecast-vs-historical" as ReportTypeKey, label: "Forecast vs Historical" },
];

// Mock Data — Provider Comparison
const MOCK_PROVIDER_DATA = [
  { provider: "IMD", forecastAvg: 33.9, actualAvg: 33.7, deviation: 0.2, accuracy: 97.2, rank: 1 },
  { provider: "Tomorrow.io", forecastAvg: 33.8, actualAvg: 33.7, deviation: 0.1, accuracy: 97.5, rank: 2 },
];

// Mock Data — Location Performance
const MOCK_LOCATION_DATA = [
  { location: "Colaba Substation", forecastAvg: 33.9, actualAvg: 33.7, deviation: 0.2, accuracy: 97.2 },
  { location: "Andheri Substation", forecastAvg: 34.3, actualAvg: 33.9, deviation: 0.4, accuracy: 96.5 },
  { location: "Borivali Substation", forecastAvg: 35.2, actualAvg: 34.8, deviation: 0.4, accuracy: 95.8 },
  { location: "Kurla Substation", forecastAvg: 35.8, actualAvg: 35.2, deviation: 0.6, accuracy: 94.2 },
];

// Mock Data — Forecast vs Historical
const MOCK_FORECAST_HISTORICAL = [
  { date: "Feb 14", provider: "IMD", forecast: 32.8, actual: 32.5, deviation: 0.3, accuracy: 97.1 },
  { date: "Feb 15", provider: "Tomorrow.io", forecast: 34.0, actual: 33.8, deviation: 0.2, accuracy: 97.5 },
  { date: "Feb 16", provider: "IMD", forecast: 34.3, actual: 34.2, deviation: 0.1, accuracy: 98.1 },
  { date: "Feb 17", provider: "Tomorrow.io", forecast: 32.1, actual: 31.9, deviation: 0.2, accuracy: 97.3 },
];

// Trend Chart Data
const TREND_DATA = [
  { date: "Feb 14", imd: 96.5, "tomorrow-io": 96.1 },
  { date: "Feb 15", imd: 97.1, "tomorrow-io": 96.8 },
  { date: "Feb 16", imd: 96.8, "tomorrow-io": 96.5 },
  { date: "Feb 17", imd: 97.2, "tomorrow-io": 97.1 },
  { date: "Feb 18", imd: 96.9, "tomorrow-io": 96.7 },
  { date: "Feb 19", imd: 97.5, "tomorrow-io": 97.4 },
  { date: "Feb 20", imd: 97.8, "tomorrow-io": 97.9 },
];

export function ReportsPage() {
  const { user, role } = useRole();

  // Filter State
  const [utility, setUtility] = useState("");
  const [location, setLocation] = useState("");
  const [parameter, setParameter] = useState<Parameter>("temperature");
  const [selectedProviders, setSelectedProviders] = useState<ProviderKey[]>(PROVIDERS.map((p) => p.key));
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const [reportType, setReportType] = useState<ReportTypeKey>("executive-summary");

  // UI State
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Schedule State
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<ScheduleFrequency>("weekly");
  const [scheduleEmail, setScheduleEmail] = useState("");
  const [scheduleFormat, setScheduleFormat] = useState<"excel" | "csv">("excel");

  // Get available locations based on selected utility
  const availableLocations = utility ? LOCATIONS[utility] || [] : [];

  // Filter providers
  const filteredProviders = PROVIDERS.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Toggle provider selection
  const toggleProvider = (key: ProviderKey) => {
    if (selectedProviders.includes(key)) {
      if (selectedProviders.length > 1) {
        setSelectedProviders(selectedProviders.filter((p) => p !== key));
      }
    } else {
      setSelectedProviders([...selectedProviders, key]);
    }
  };

  const selectAllProviders = () => {
    setSelectedProviders(PROVIDERS.map((p) => p.key));
  };

  // Check if Generate button should be enabled
  const canGenerate = utility && location && parameter && dateRange;

  // Generate Report Handler
  const handleGenerateReport = () => {
    if (!canGenerate) return;

    setGenerating(true);
    toast.loading("Generating report...");

    // Simulate API call
    setTimeout(() => {
      setGenerating(false);
      setReportGenerated(true);
      toast.dismiss();
      toast.success("Report generated successfully!");
    }, 2000);
  };

  // Export Handlers
  const handleExportExcel = () => {
    const data = reportType === "provider-accuracy" ? MOCK_PROVIDER_DATA : MOCK_LOCATION_DATA;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `report-${Date.now()}.xlsx`);
    toast.success("Excel report exported successfully");
  };

  const handleExportCSV = () => {
    const data = reportType === "provider-accuracy" ? MOCK_PROVIDER_DATA : MOCK_LOCATION_DATA;
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${Date.now()}.csv`;
    a.click();
    toast.success("CSV report exported successfully");
  };

  // Save Schedule
  const handleSaveSchedule = () => {
    if (!scheduleEmail) {
      toast.error("Please enter a recipient email");
      return;
    }
    toast.success("Report schedule saved successfully");
  };

  // Role-based access
  const canExport = role === "super-admin" || role === "admin";
  const canSchedule = role === "super-admin" || role === "admin";
  const canViewOnly = role === "operator";

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px]">
      {/* ═══ PAGE HEADER ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
            <span>Command Center</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Reports</span>
          </div>
          <h1 className="text-foreground">Reports</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Generate structured climate reports with dynamic filters and export
          </p>
        </div>
      </div>

      {/* ═══ 1️⃣ FILTER BAR ═══ */}
      <div className="bg-card rounded-[16px] border border-border p-4 shadow-sm">
        <div className="space-y-4">
          {/* Row 1: Core Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Utility Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Utility
              </label>
              <div className="relative">
                <select
                  value={utility}
                  onChange={(e) => {
                    setUtility(e.target.value);
                    setLocation(""); // Reset location when utility changes
                  }}
                  className="w-full pl-9 pr-9 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <option value="">Select Utility</option>
                  {UTILITIES.map((util) => (
                    <option key={util.key} value={util.key}>
                      {util.name}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Location
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={!utility}
                  className="w-full pl-9 pr-9 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Location</option>
                  {availableLocations.map((loc) => (
                    <option key={loc.key} value={loc.key}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Parameter Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Parameter
              </label>
              <div className="relative">
                <select
                  value={parameter}
                  onChange={(e) => setParameter(e.target.value as Parameter)}
                  className="w-full pl-9 pr-9 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <option value="temperature">Temperature</option>
                  <option value="rainfall">Rainfall</option>
                  <option value="wind">Wind Speed</option>
                  <option value="humidity">Humidity</option>
                </select>
                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Date Range
              </label>
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className="w-full pl-9 pr-9 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Provider Multi-Select */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Providers
              </label>
              <div className="relative">
                <button
                  onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
                  className="w-full pl-3 pr-9 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground hover:border-primary/50 hover:shadow-sm transition-all flex items-center justify-between"
                >
                  <span className="text-muted-foreground truncate">
                    {selectedProviders.length === PROVIDERS.length
                      ? "All Providers"
                      : `${selectedProviders.length} Provider(s) Selected`}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>

                {providerDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 w-full max-h-[320px] bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                    <div className="p-3 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search providers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="p-2 border-b border-border">
                      <button
                        onClick={selectAllProviders}
                        className="w-full px-3 py-2 text-[12px] font-medium text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Select All Providers
                      </button>
                    </div>

                    <div className="overflow-y-auto max-h-[200px]">
                      {filteredProviders.map((provider) => (
                        <label
                          key={provider.key}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/30 last:border-0"
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              selectedProviders.includes(provider.key)
                                ? "bg-primary border-primary"
                                : "border-border bg-card"
                            }`}
                          >
                            {selectedProviders.includes(provider.key) && (
                              <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedProviders.includes(provider.key)}
                            onChange={() => toggleProvider(provider.key)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: provider.color }} />
                            <span className="text-[13px] text-foreground">{provider.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {providerDropdownOpen && (
                  <div className="fixed inset-0 z-10" onClick={() => setProviderDropdownOpen(false)} />
                )}
              </div>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Report Type
              </label>
              <div className="relative">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportTypeKey)}
                  className="w-full pl-9 pr-9 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end pt-2 border-t border-border">
            <button
              onClick={handleGenerateReport}
              disabled={!canGenerate || generating || canViewOnly}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ OPERATOR VIEW-ONLY MESSAGE ═══ */}
      {canViewOnly && !reportGenerated && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">View & Download Only</h3>
          <p className="text-[13px] text-muted-foreground text-center max-w-md">
            Your role (Operator) allows viewing and downloading existing reports only. Contact an Admin or Super Admin
            to generate new reports.
          </p>
        </div>
      )}

      {/* ═══ EMPTY STATE ═══ */}
      {!reportGenerated && !canViewOnly && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Report Generated</h3>
          <p className="text-[13px] text-muted-foreground text-center max-w-md">
            Select filters above and click "Generate Report" to create a structured climate report
          </p>
        </div>
      )}

      {/* ═══ 3️⃣ REPORT PREVIEW PANEL ═══ */}
      {reportGenerated && (
        <div className="space-y-6">
          {/* A. Report Metadata Card */}
          <div className="bg-card rounded-[16px] border border-border p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {REPORT_TYPES.find((r) => r.key === reportType)?.label} Report
                </h2>
                <p className="text-[12px] text-muted-foreground">
                  Generated on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at{" "}
                  {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <div className="font-medium">Generated By</div>
                <div className="text-foreground font-semibold">
                  {user?.name} ({role})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">
                  Utility
                </div>
                <div className="text-[13px] font-bold text-foreground">
                  {UTILITIES.find((u) => u.key === utility)?.name || "—"}
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">
                  Location
                </div>
                <div className="text-[13px] font-bold text-foreground">
                  {availableLocations.find((l) => l.key === location)?.name || "—"}
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">
                  Parameter
                </div>
                <div className="text-[13px] font-bold text-foreground capitalize">{parameter}</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">
                  Providers
                </div>
                <div className="text-[13px] font-bold text-foreground">{selectedProviders.length} Selected</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">
                  Date Range
                </div>
                <div className="text-[13px] font-bold text-foreground">
                  {dateRange === "7days" ? "7 Days" : dateRange === "30days" ? "30 Days" : "Custom"}
                </div>
              </div>
            </div>
          </div>

          {/* B. KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card rounded-[16px] border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-primary" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                  Avg Forecast
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">34.2°C</div>
              <div className="text-[11px] text-muted-foreground mt-1">Predicted average</div>
            </div>

            <div className="bg-card rounded-[16px] border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                  Avg Actual
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">33.9°C</div>
              <div className="text-[11px] text-muted-foreground mt-1">Observed average</div>
            </div>

            <div className="bg-card rounded-[16px] border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Deviation</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">0.3°C</div>
              <div className="text-[11px] text-muted-foreground mt-1">Low variance</div>
            </div>

            <div className="bg-card rounded-[16px] border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-foreground">96.8%</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Excellent</div>
            </div>

            <div className="bg-card rounded-[16px] border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                  Risk Events
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">12</div>
              <div className="text-[11px] text-muted-foreground mt-1">Last 7 days</div>
            </div>
          </div>

          {/* C. Main Comparison Table */}
          <div className="bg-card rounded-[24px] border border-border p-6">
            <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide mb-4">
              {reportType === "provider-accuracy" && "Provider Accuracy Comparison"}
              {reportType === "location-performance" && "Location Performance Analysis"}
              {reportType === "forecast-vs-historical" && "Forecast vs Historical Data"}
              {reportType === "executive-summary" && "Executive Summary Table"}
              {reportType === "risk-alert" && "Risk & Alert Summary"}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {reportType === "provider-accuracy" && (
                      <>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Provider</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Forecast Avg</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Actual Avg</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Deviation</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Accuracy %</th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">Rank</th>
                      </>
                    )}
                    {reportType === "location-performance" && (
                      <>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Location</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Forecast Avg</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Actual Avg</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Deviation</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Accuracy %</th>
                      </>
                    )}
                    {reportType === "forecast-vs-historical" && (
                      <>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Provider</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Forecast</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Actual</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Deviation</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">Accuracy %</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportType === "provider-accuracy" &&
                    MOCK_PROVIDER_DATA.filter((row) =>
                      selectedProviders.some((pk) => PROVIDERS.find((p) => p.key === pk)?.name === row.provider)
                    ).map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                          idx % 2 === 1 ? "bg-muted/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{row.provider}</td>
                        <td className="px-4 py-3 text-right text-foreground/80">{row.forecastAvg}°C</td>
                        <td className="px-4 py-3 text-right text-foreground/80">{row.actualAvg}°C</td>
                        <td className="px-4 py-3 text-right text-foreground/80">{row.deviation}°C</td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">{row.accuracy}%</td>
                        <td className="px-4 py-3 text-center">
                          {row.rank === 1 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Award className="w-3 h-3" />
                              #1
                            </span>
                          )}
                          {row.rank !== 1 && <span className="text-muted-foreground">#{row.rank}</span>}
                        </td>
                      </tr>
                    ))}

                  {reportType === "location-performance" &&
                    MOCK_LOCATION_DATA.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                          idx % 2 === 1 ? "bg-muted/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{row.location}</td>
                        <td className="px-4 py-3 text-right text-foreground/80">{row.forecastAvg}°C</td>
                        <td className="px-4 py-3 text-right text-foreground/80">{row.actualAvg}°C</td>
                        <td className="px-4 py-3 text-right text-foreground/80">{row.deviation}°C</td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">{row.accuracy}%</td>
                      </tr>
                    ))}

                  {reportType === "forecast-vs-historical" &&
                    MOCK_FORECAST_HISTORICAL.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                          idx % 2 === 1 ? "bg-muted/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{row.date}</td>
                        <td className="px-4 py-3 text-foreground/80">{row.provider}</td>
                        <td className="px-4 py-3 text-right text-foreground/80">{row.forecast}°C</td>
                        <td className="px-4 py-3 text-right text-foreground/80">{row.actual}°C</td>
                        <td className="px-4 py-3 text-right text-foreground/80">{row.deviation}°C</td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">{row.accuracy}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* D. Trend Charts */}
          <div className="bg-card rounded-[24px] border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">
                Provider Accuracy Trend (Last 7 Days)
              </h3>
              <div className="text-[11px] text-muted-foreground">Feb 14 - Feb 20</div>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  domain={[90, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                    padding: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: any) => [`${value}%`, ""]}
                  labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={50}
                  iconType="line"
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => {
                    const provider = PROVIDERS.find((p) => p.key === value);
                    return <span className="text-[11px] text-foreground">{provider?.name || value}</span>;
                  }}
                />
                {selectedProviders.map((providerKey) => {
                  const provider = PROVIDERS.find((p) => p.key === providerKey);
                  return (
                    <Line
                      key={providerKey}
                      type="monotone"
                      dataKey={providerKey}
                      stroke={provider?.color}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ═══ 4️⃣ EXPORT PANEL ═══ */}
          {canExport && (
            <div className="bg-card rounded-[16px] border border-border p-6">
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide mb-4">Export Report</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportExcel}
                  className="px-5 py-2.5 bg-card border border-border rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-5 py-2.5 bg-card border border-border rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          )}

          {/* ═══ 5️⃣ SCHEDULE REPORT ═══ */}
          {canSchedule && (
            <div className="bg-card rounded-[16px] border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide">Schedule Report</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={(e) => setScheduleEnabled(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-[12px] font-medium text-foreground">Enable Scheduling</span>
                </label>
              </div>

              {scheduleEnabled && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Frequency
                      </label>
                      <select
                        value={scheduleFrequency}
                        onChange={(e) => setScheduleFrequency(e.target.value as ScheduleFrequency)}
                        className="w-full px-3 py-2 h-[40px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Format
                      </label>
                      <select
                        value={scheduleFormat}
                        onChange={(e) => setScheduleFormat(e.target.value as "excel" | "csv")}
                        className="w-full px-3 py-2 h-[40px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer"
                      >
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Recipient Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={scheduleEmail}
                          onChange={(e) => setScheduleEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full pl-9 pr-3 py-2 h-[40px] text-[13px] rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveSchedule}
                      className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors"
                    >
                      Save Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
