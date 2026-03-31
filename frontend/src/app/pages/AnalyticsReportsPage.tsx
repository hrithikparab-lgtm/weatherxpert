import { useState } from "react";
import { useRole } from "../components/RoleContext";
import { ReportsTab } from "../components/ReportsTab";
import {
  ChevronRight,
  MapPin,
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileText,
  Download,
  Award,
  Target,
  Activity,
  CheckCircle2,
  Search,
  Check,
  X,
  Eye,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Thermometer,
  Clock,
  Mail,
  RotateCcw,
  FileBarChart,
  User,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/* ═══════════════════════════════════════════════════
   REPORTS — Export & Documentation Layer
   Pure export functionality for formal documentation
   Analytics moved to Climate Intelligence → Insights
   ═══════════════════════════════════════════════════ */

type Tab = "analytics" | "reports";
type Parameter = "temperature" | "rainfall" | "wind" | "humidity" | "severe-risk";
type ProviderKey = "imd" | "tomorrow-io";
type DateRange = "7days" | "30days" | "custom";
type LocationKey = "all" | "colaba" | "andheri" | "borivali" | "kurla" | "bandra";
type ReportType = "summary" | "provider-comparison" | "location-performance" | "risk-analysis";
type ReportFormat = "excel" | "csv";

// Report Types
type ReportTypeKey = 
  | "executive-summary"
  | "location-performance"
  | "provider-accuracy"
  | "risk-alert"
  | "forecast-vs-historical";

type ScheduleFrequency = "daily" | "weekly" | "monthly";
type ReportStatus = "completed" | "scheduled" | "failed";

// Provider Configuration
const PROVIDERS = [
  { key: "imd" as ProviderKey, name: "IMD", color: "#3b82f6" },
  { key: "tomorrow-io" as ProviderKey, name: "Tomorrow.io", color: "#10b981" },
];

// Location Configuration
const LOCATIONS = [
  { key: "all" as LocationKey, name: "All Locations" },
  { key: "colaba" as LocationKey, name: "Colaba Substation" },
  { key: "andheri" as LocationKey, name: "Andheri Substation" },
  { key: "borivali" as LocationKey, name: "Borivali Substation" },
  { key: "kurla" as LocationKey, name: "Kurla Substation" },
  { key: "bandra" as LocationKey, name: "Bandra Substation" },
];

// Mock Data — Aggregated Analytics

// All Locations KPI Data
const aggregatedKPIs = {
  overallAccuracy: 96.8,
  bestProvider: "Tomorrow.io",
  worstDeviationLocation: "Kurla Substation",
  totalRiskEvents: 23,
  avgParameterValue: 34.2,
};

// Single Location KPI Data
const locationKPIs: Record<LocationKey, any> = {
  all: aggregatedKPIs,
  colaba: {
    locationAccuracy: 97.2,
    bestProvider: "IMD",
    highestDeviationDay: "Feb 18",
    variance: 0.8,
    riskAlertCount: 4,
  },
  andheri: {
    locationAccuracy: 96.5,
    bestProvider: "Tomorrow.io",
    highestDeviationDay: "Feb 19",
    variance: 1.2,
    riskAlertCount: 6,
  },
  borivali: {
    locationAccuracy: 95.8,
    bestProvider: "IMD",
    highestDeviationDay: "Feb 17",
    variance: 1.5,
    riskAlertCount: 8,
  },
  kurla: {
    locationAccuracy: 94.2,
    bestProvider: "Tomorrow.io",
    highestDeviationDay: "Feb 20",
    variance: 2.1,
    riskAlertCount: 5,
  },
  bandra: {
    locationAccuracy: 96.9,
    bestProvider: "Tomorrow.io",
    highestDeviationDay: "Feb 16",
    variance: 0.9,
    riskAlertCount: 3,
  },
};

// Provider Performance by Location (All Locations)
const providerPerformanceAllLocations = [
  { location: "Colaba Substation", provider: "IMD", accuracy: 97.2, avgDeviation: 0.6, rank: 1 },
  { location: "Colaba Substation", provider: "Tomorrow.io", accuracy: 96.8, avgDeviation: 0.7, rank: 2 },
  { location: "Andheri Substation", provider: "Tomorrow.io", accuracy: 96.5, avgDeviation: 0.8, rank: 1 },
  { location: "Andheri Substation", provider: "IMD", accuracy: 95.9, avgDeviation: 1.0, rank: 2 },
  { location: "Borivali Substation", provider: "IMD", accuracy: 95.8, avgDeviation: 1.1, rank: 1 },
  { location: "Borivali Substation", provider: "Tomorrow.io", accuracy: 95.2, avgDeviation: 1.3, rank: 2 },
  { location: "Kurla Substation", provider: "Tomorrow.io", accuracy: 94.2, avgDeviation: 1.8, rank: 1 },
  { location: "Kurla Substation", provider: "IMD", accuracy: 93.5, avgDeviation: 2.0, rank: 2 },
];

// Provider Performance by Single Location
const providerPerformanceSingleLocation = {
  colaba: [
    { provider: "IMD", forecastAvg: 33.9, actualAvg: 33.7, deviation: 0.2, accuracy: 97.2 },
    { provider: "Tomorrow.io", forecastAvg: 34.0, actualAvg: 33.7, deviation: 0.3, accuracy: 96.8 },
  ],
  andheri: [
    { provider: "Tomorrow.io", forecastAvg: 34.2, actualAvg: 33.9, deviation: 0.3, accuracy: 96.5 },
    { provider: "IMD", forecastAvg: 34.3, actualAvg: 33.9, deviation: 0.4, accuracy: 96.2 },
  ],
  borivali: [
    { provider: "IMD", forecastAvg: 35.1, actualAvg: 34.8, deviation: 0.3, accuracy: 95.8 },
    { provider: "Tomorrow.io", forecastAvg: 35.3, actualAvg: 34.8, deviation: 0.5, accuracy: 95.2 },
  ],
  kurla: [
    { provider: "Tomorrow.io", forecastAvg: 35.8, actualAvg: 35.2, deviation: 0.6, accuracy: 94.2 },
    { provider: "IMD", forecastAvg: 35.7, actualAvg: 35.2, deviation: 0.5, accuracy: 94.5 },
  ],
  bandra: [
    { provider: "Tomorrow.io", forecastAvg: 33.8, actualAvg: 33.5, deviation: 0.3, accuracy: 96.9 },
    { provider: "IMD", forecastAvg: 33.9, actualAvg: 33.5, deviation: 0.4, accuracy: 96.5 },
  ],
};

// Location Comparison Data
const locationComparisonData = [
  { location: "Colaba Substation", forecastAvg: 33.9, actualAvg: 33.7, deviation: 0.2, accuracy: 97.2 },
  { location: "Andheri Substation", forecastAvg: 34.3, actualAvg: 33.9, deviation: 0.4, accuracy: 96.5 },
  { location: "Borivali Substation", forecastAvg: 35.2, actualAvg: 34.8, deviation: 0.4, accuracy: 95.8 },
  { location: "Kurla Substation", forecastAvg: 35.8, actualAvg: 35.2, deviation: 0.6, accuracy: 94.2 },
  { location: "Bandra Substation", forecastAvg: 33.8, actualAvg: 33.5, deviation: 0.3, accuracy: 96.9 },
];

// Trend Chart Data (Provider Accuracy over time)
const accuracyTrendData = [
  { date: "Feb 14", imd: 96.5, "tomorrow-io": 97.2 },
  { date: "Feb 15", imd: 97.1, "tomorrow-io": 97.5 },
  { date: "Feb 16", imd: 96.8, "tomorrow-io": 97.0 },
  { date: "Feb 17", imd: 97.2, "tomorrow-io": 97.8 },
  { date: "Feb 18", imd: 96.9, "tomorrow-io": 97.3 },
  { date: "Feb 19", imd: 97.5, "tomorrow-io": 98.1 },
  { date: "Feb 20", imd: 97.8, "tomorrow-io": 98.5 },
];

// Single location trend (Forecast vs Actual)
const singleLocationTrendData = [
  { date: "Feb 14", actual: 32.5, forecast: 32.8 },
  { date: "Feb 15", actual: 33.8, forecast: 34.0 },
  { date: "Feb 16", actual: 34.2, forecast: 34.3 },
  { date: "Feb 17", actual: 31.9, forecast: 32.1 },
  { date: "Feb 18", actual: 33.1, forecast: 33.3 },
  { date: "Feb 19", actual: 35.4, forecast: 35.6 },
  { date: "Feb 20", actual: 36.2, forecast: 36.3 },
];

export function AnalyticsReportsPage() {
  const { activeUtility, role } = useRole();
  
  // Tab State
  const [tab, setTab] = useState<Tab>("analytics");
  
  // Filter State
  const [location, setLocation] = useState<LocationKey>("all");
  const [parameter, setParameter] = useState<Parameter>("temperature");
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const [selectedProviders, setSelectedProviders] = useState<ProviderKey[]>(
    PROVIDERS.map((p) => p.key)
  );
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("summary");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("excel");

  // Reports Tab State
  const [reportTypeKey, setReportTypeKey] = useState<ReportTypeKey>("executive-summary");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<ScheduleFrequency>("weekly");
  const [scheduleEmail, setScheduleEmail] = useState("");

  const filteredProviders = PROVIDERS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Get current KPIs based on location
  const currentKPIs = location === "all" ? aggregatedKPIs : locationKPIs[location];

  // Get current provider performance data
  const currentProviderPerformance =
    location === "all"
      ? providerPerformanceAllLocations.filter((row) =>
          selectedProviders.some((pk) => PROVIDERS.find((p) => p.key === pk)?.name === row.provider)
        )
      : (providerPerformanceSingleLocation[location] || []).filter((row) =>
          selectedProviders.some((pk) => PROVIDERS.find((p) => p.key === pk)?.name === row.provider)
        );

  // Drill-down handler
  const handleLocationDrillDown = (locationName: string) => {
    const loc = LOCATIONS.find((l) => l.name === locationName);
    if (loc && loc.key !== "all") {
      setLocation(loc.key);
      toast.success(`Viewing analytics for ${locationName}`);
    }
  };

  // Report Generation
  const generateReport = () => {
    if (reportFormat === "excel") {
      const ws = XLSX.utils.json_to_sheet(currentProviderPerformance);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Analytics");
      XLSX.writeFile(wb, `analytics-report-${Date.now()}.xlsx`);
      toast.success("Excel report exported successfully");
    } else if (reportFormat === "csv") {
      const ws = XLSX.utils.json_to_sheet(currentProviderPerformance);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-report-${Date.now()}.csv`;
      a.click();
      toast.success("CSV report exported successfully");
    }
    setReportModalOpen(false);
  };

  // Role-based access
  const canExport = role === "super-admin" || role === "admin";
  const canViewOnly = role === "operator";

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px]">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
            <span>WeatherXpert</span>
            <ChevronRight className="w-3 h-3" />
            <span>{activeUtility}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">Reports</span>
          </div>
          <h1 className="text-foreground">Reports</h1>
        </div>

        {/* Generate Report Button */}
        {canExport && (
          <button
            onClick={() => setReportModalOpen(true)}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        )}
      </div>

      {/* ── GLOBAL FILTER BAR (Sticky) ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* 1️⃣ Location Dropdown */}
          <div className="relative">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as LocationKey)}
              className="pl-9 pr-9 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-border/80 transition-colors min-w-[200px]"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.key} value={loc.key}>
                  {loc.name}
                </option>
              ))}
            </select>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* 2️⃣ Parameter Dropdown */}
          <div className="relative">
            <select
              value={parameter}
              onChange={(e) => setParameter(e.target.value as Parameter)}
              className="pl-3 pr-9 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-border/80 transition-colors min-w-[150px]"
            >
              <option value="temperature">Temperature</option>
              <option value="rainfall">Rainfall</option>
              <option value="wind">Wind</option>
              <option value="humidity">Humidity</option>
              <option value="severe-risk">Severe Risk</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* 3️⃣ Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="pl-9 pr-9 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground appearance-none cursor-pointer hover:border-border/80 transition-colors min-w-[140px]"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* 4️⃣ Provider Multi-Select Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
              className="pl-3 pr-9 py-2.5 h-[44px] text-[13px] rounded-lg border border-border bg-card text-foreground hover:border-primary/50 hover:shadow-sm transition-all min-w-[280px] flex items-center justify-between"
            >
              <span className="text-muted-foreground truncate">
                {selectedProviders.length === PROVIDERS.length
                  ? "All Providers"
                  : `${selectedProviders.length} Provider(s) Selected`}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>

            {providerDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 w-[280px] max-h-[320px] bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden">
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
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: provider.color }}
                        />
                        <span className="text-[13px] text-foreground">{provider.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {providerDropdownOpen && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProviderDropdownOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="border-b border-border">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("reports")}
            className={`px-6 py-3 text-[13px] font-medium border-b-2 transition-all ${
              tab === "reports"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* ── 📄 TAB 2: REPORTS ── */}
      {tab === "reports" && (
        <ReportsTab
          reportTypeKey={reportTypeKey}
          setReportTypeKey={setReportTypeKey}
          reportGenerated={reportGenerated}
          setReportGenerated={setReportGenerated}
          location={location}
          dateRange={dateRange}
          activeUtility={activeUtility}
          role={role}
          canViewOnly={canViewOnly}
          setReportFormat={setReportFormat}
          generateReport={generateReport}
        />
      )}

      {/* ── REPORT GENERATION MODAL ── */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[24px] border border-border shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Generate Report</h3>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Report Type Selection */}
            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-foreground mb-3">
                Report Type
              </label>
              <div className="space-y-2">
                {[
                  { key: "summary", label: "Summary Report" },
                  { key: "provider-comparison", label: "Provider Comparison Report" },
                  { key: "location-performance", label: "Location Performance Report" },
                  { key: "risk-analysis", label: "Risk Analysis Report" },
                ].map((type) => (
                  <label
                    key={type.key}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.key}
                      checked={reportType === type.key}
                      onChange={(e) => setReportType(e.target.value as ReportType)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-[13px] text-foreground">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-foreground mb-3">
                Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "excel", label: "Excel" },
                  { key: "csv", label: "CSV" },
                ].map((format) => (
                  <button
                    key={format.key}
                    onClick={() => setReportFormat(format.key as ReportFormat)}
                    className={`px-4 py-2.5 rounded-lg border font-medium text-[13px] transition-colors ${
                      reportFormat === format.key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Summary */}
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-2">
                Preview Summary
              </div>
              <div className="text-[12px] text-foreground space-y-1">
                <div>Location: <span className="font-semibold">{LOCATIONS.find((l) => l.key === location)?.name}</span></div>
                <div>Parameter: <span className="font-semibold capitalize">{parameter}</span></div>
                <div>Providers: <span className="font-semibold">{selectedProviders.length}</span></div>
                <div>Date Range: <span className="font-semibold">{dateRange === "7days" ? "Last 7 Days" : dateRange === "30days" ? "Last 30 Days" : "Custom"}</span></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setReportModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateReport}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}