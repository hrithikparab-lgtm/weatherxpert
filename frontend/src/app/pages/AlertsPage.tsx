import { useState, useMemo } from "react";
import { useRole } from "../components/RoleContext";
import { useAlertManagement } from "../components/AlertManagementContext";
import { AlertCreationModal } from "../components/alerts/AlertCreationModal";
import { AlertDetailDrawer, type AlertDetail } from "../components/AlertDetailDrawer";
import {
  ChevronRight,
  Calendar,
  Clock,
  X,
  Search,
  Filter,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Activity,
  ChevronDown,
  CloudRain,
  AlertCircle,
  RefreshCw,
  LayoutGrid,
  List,
  Bell,
  Zap,
  AlertTriangle,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Eye,
  Target,
  BarChart3,
  Download,
  ChevronUp,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { glassCardClass } from "../components/ChartGlobalDefs";

/* ═══════════════════════════════════════════════════
   ALERTS PAGE — Enhanced UX Redesign
   Clean filters, better hierarchy, improved actions
   ═══════════════════════════════════════════════════ */

type AlertTab = "forecast" | "history";
type Severity = "critical" | "high" | "medium" | "low";
type ViewMode = "grid" | "list";
type SortMode = "severity" | "time" | "location" | "probability";

// Use the shared AlertDetail interface
type Alert = AlertDetail;

// ═══════════════════════════════════════════════════
// MOCK DATA — FORECAST ALERTS
// ═══════════════════════════════════════════════════
const FORECAST_ALERTS: Alert[] = [
  {
    id: "F001",
    title: "Predicted Severe Thunderstorm Activity",
    utility: "TATA Power Mumbai",
    provider: "IMD",
    severity: "critical",
    expectedTriggerTime: "2026-02-28 16:00",
    status: "Predicted",
    probability: "87%",
    predictedValue: "Category 3 Storm (85 km/h winds)",
    thresholdValue: "Category 2 Storm (60 km/h)",
    location: "Mumbai Metropolitan Region - All Substations",
    receivedTime: "2:40 PM",
    basedOn: "Severe Thunderstorm Activity Model",
    forecastedConditions: [
      { parameter: "Wind Speed", value: "85 km/h" },
      { parameter: "Rainfall", value: "120 mm/hr" },
    ],
    isInternal: false,
    startTime: "Starts in 45 minutes at 3:00 PM GMT+2 3/26/26",
    locationTime: "6:30 PM GMT+5:30 3/26/26",
  },
  {
    id: "F002",
    title: "Temperature Spike Forecast — Turbine Efficiency Risk",
    utility: "Gujarat Wind Farm",
    provider: "Tomorrow.io",
    severity: "high",
    expectedTriggerTime: "2026-03-01 14:00",
    status: "Predicted",
    probability: "74%",
    predictedValue: "44.2°C",
    thresholdValue: "40.0°C",
    location: "Gujarat Wind Farm Cluster — Zones A, B, C",
    receivedTime: "1:15 PM",
    basedOn: "Temperature Spike Prediction Model",
    forecastedConditions: [
      { parameter: "Temperature", value: "44.2°C" },
      { parameter: "Turbine Efficiency", value: "-15%" },
    ],
    isInternal: false,
    startTime: "Starts in 2 hours at 4:00 PM GMT+2 3/1/26",
    locationTime: "7:30 PM GMT+5:30 3/1/26",
  },
  {
    id: "F003",
    title: "Dense Fog & Low Visibility Warning",
    utility: "Karnataka Solar Plant",
    provider: "IMD",
    severity: "medium",
    expectedTriggerTime: "2026-02-28 06:30",
    status: "Predicted",
    probability: "68%",
    predictedValue: "80m visibility",
    thresholdValue: "200m visibility",
    location: "Karnataka Solar Plant — South Grid",
    receivedTime: "11:20 AM",
    basedOn: "Fog & Visibility Prediction Model",
    forecastedConditions: [
      { parameter: "Visibility", value: "80m" },
      { parameter: "Humidity", value: "98%" },
    ],
    isInternal: false,
    startTime: "Starts in 8 hours at 6:30 AM GMT+2 2/28/26",
    locationTime: "10:00 AM GMT+5:30 2/28/26",
  },
  {
    id: "F004",
    title: "Heavy Rainfall Prediction — Monsoon Activity",
    utility: "TATA Power Mumbai",
    provider: "Tomorrow.io",
    severity: "high",
    expectedTriggerTime: "2026-03-02 09:00",
    status: "Predicted",
    probability: "81%",
    predictedValue: "150mm accumulated rainfall",
    thresholdValue: "100mm",
    location: "Mumbai — Coastal Substations",
    receivedTime: "10:30 AM",
    basedOn: "Monsoon Rainfall Prediction",
    forecastedConditions: [
      { parameter: "Rainfall", value: "150mm" },
      { parameter: "Wind Speed", value: "45 km/h" },
    ],
    isInternal: false,
    startTime: "Starts in 1 day at 9:00 AM GMT+2 3/2/26",
    locationTime: "12:30 PM GMT+5:30 3/2/26",
  },
  {
    id: "F005",
    title: "Wind Speed Anomaly Prediction",
    utility: "Gujarat Wind Farm",
    provider: "IMD",
    severity: "medium",
    expectedTriggerTime: "2026-02-29 11:00",
    status: "Predicted",
    probability: "65%",
    predictedValue: "72 km/h gusts",
    thresholdValue: "60 km/h",
    location: "Gujarat Wind Farm — Zone D",
    receivedTime: "9:45 AM",
    basedOn: "Wind Speed Anomaly Model",
    forecastedConditions: [
      { parameter: "Wind Speed", value: "72 km/h" },
      { parameter: "Gust Speed", value: "90 km/h" },
    ],
    isInternal: false,
    startTime: "Starts in 12 hours at 11:00 AM GMT+2 2/29/26",
    locationTime: "2:30 PM GMT+5:30 2/29/26",
  },
  {
    id: "F006",
    title: "Humidity Spike Forecast",
    utility: "Karnataka Solar Plant",
    provider: "Tomorrow.io",
    severity: "low",
    expectedTriggerTime: "2026-02-28 18:00",
    status: "Predicted",
    probability: "62%",
    predictedValue: "94% humidity",
    thresholdValue: "85%",
    location: "Karnataka Solar Plant — East Wing",
    receivedTime: "8:10 AM",
    basedOn: "Humidity Spike Prediction",
    forecastedConditions: [
      { parameter: "Humidity", value: "94%" },
      { parameter: "Dew Point", value: "28°C" },
    ],
    isInternal: false,
    startTime: "Starts in 6 hours at 6:00 PM GMT+2 2/28/26",
    locationTime: "9:30 PM GMT+5:30 2/28/26",
  },
  {
    id: "F007",
    title: "Wind Insight for Odisha is starting within 2 hours",
    utility: "Odisha Distribution",
    provider: "Internal",
    severity: "medium",
    expectedTriggerTime: "2026-03-26 15:00",
    status: "Predicted",
    probability: "75%",
    predictedValue: "10.29 mph",
    thresholdValue: "8 mph",
    location: "Mitapur",
    receivedTime: "2:40 PM",
    basedOn: "Wind Insight for Odisha",
    forecastedConditions: [
      { parameter: "Wind Speed", value: "10.29 mph" },
    ],
    isInternal: true,
    createdBy: { name: "Biswas Trusha", initials: "BT" },
    startTime: "Starts in 19 minutes at 3:00 PM GMT+2 3/26/26",
    locationTime: "Location Time: 6:30 PM GMT+5:30 3/26/26",
  },
];

// ═══════════════════════════════════════════════════
// MOCK DATA — HISTORY ALERTS
// ═══════════════════════════════════════════════════
const HISTORY_ALERTS: Alert[] = [
  {
    id: "H001",
    title: "Extreme Heat Event — Critical Threshold Breach",
    utility: "TATA Power Mumbai",
    provider: "IMD",
    severity: "critical",
    triggeredTime: "2026-02-25 15:00",
    resolvedTime: "2026-02-25 19:30",
    duration: "4h 30m",
    status: "Resolved",
    observedValue: "43.2°C",
    thresholdValue: "40.0°C",
    location: "Bandra Substation, Mumbai",
  },
  {
    id: "H002",
    title: "Heavy Monsoon Rainfall — Wind Farm Operations Affected",
    utility: "Gujarat Wind Farm",
    provider: "IMD",
    severity: "high",
    triggeredTime: "2026-02-24 10:00",
    resolvedTime: "2026-02-24 18:00",
    duration: "8h",
    status: "Resolved",
    observedValue: "125mm accumulated",
    thresholdValue: "80mm",
    location: "Gujarat Wind Farm Cluster — All Zones",
  },
  {
    id: "H003",
    title: "High Wind Speed Alert — Solar Plant",
    utility: "Karnataka Solar Plant",
    provider: "Tomorrow.io",
    severity: "medium",
    triggeredTime: "2026-02-23 14:00",
    resolvedTime: "2026-02-23 16:30",
    duration: "2h 30m",
    status: "Resolved",
    observedValue: "58 km/h",
    thresholdValue: "50 km/h",
    location: "Karnataka Solar Plant — North Grid",
  },
  {
    id: "H004",
    title: "Dust Storm Event — Equipment Protection Activated",
    utility: "TATA Power Mumbai",
    provider: "Tomorrow.io",
    severity: "low",
    triggeredTime: "2026-02-22 12:00",
    resolvedTime: "2026-02-22 13:15",
    duration: "1h 15m",
    status: "Resolved",
    observedValue: "Moderate Dust",
    thresholdValue: "Clear Conditions",
    location: "Kurla Substation, Mumbai",
  },
  {
    id: "H005",
    title: "Sudden Temperature Drop — Night Operations",
    utility: "Gujarat Wind Farm",
    provider: "IMD",
    severity: "low",
    triggeredTime: "2026-02-21 03:00",
    resolvedTime: "2026-02-21 07:00",
    duration: "4h",
    status: "Resolved",
    observedValue: "8°C",
    thresholdValue: "12°C",
    location: "Gujarat Wind Farm — Zone A",
  },
  {
    id: "H006",
    title: "Lightning Strike Warning — Resolved",
    utility: "Karnataka Solar Plant",
    provider: "IMD",
    severity: "high",
    triggeredTime: "2026-02-20 17:30",
    resolvedTime: "2026-02-20 19:00",
    duration: "1h 30m",
    status: "Resolved",
    observedValue: "12 strikes/hour",
    thresholdValue: "5 strikes/hour",
    location: "Karnataka Solar Plant — Central Array",
  },
  {
    id: "H007",
    title: "Heavy Fog — Visibility Impaired",
    utility: "TATA Power Mumbai",
    provider: "Tomorrow.io",
    severity: "medium",
    triggeredTime: "2026-02-19 06:00",
    resolvedTime: "2026-02-19 09:30",
    duration: "3h 30m",
    status: "Resolved",
    observedValue: "50m visibility",
    thresholdValue: "150m",
    location: "Mumbai — Coastal Areas",
  },
];

// ═══════════════════════════════════════════════════
// SEVERITY CONFIGURATION
// ═══════════════════════════════════════════════════
const SEVERITY_CONFIG = {
  critical: {
    color: "#ef4444",
    bg: "#fef2f2",
    darkBg: "#7f1d1d",
    border: "#ef4444",
    label: "Critical",
    icon: AlertCircle,
  },
  high: {
    color: "#f97316",
    bg: "#fff7ed",
    darkBg: "#7c2d12",
    border: "#f97316",
    label: "High",
    icon: AlertTriangle,
  },
  medium: {
    color: "#eab308",
    bg: "#fefce8",
    darkBg: "#713f12",
    border: "#eab308",
    label: "Medium",
    icon: Bell,
  },
  low: {
    color: "#3b82f6",
    bg: "#eff6ff",
    darkBg: "#1e3a8a",
    border: "#3b82f6",
    label: "Low",
    icon: Target,
  },
};

export function AlertsPage() {
  const { activeUtility, can } = useRole();
  const { isModalOpen, openModal, closeModal } = useAlertManagement();

  // Tab State
  const [currentTab, setCurrentTab] = useState<AlertTab>("forecast");

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUtility, setFilterUtility] = useState("all");
  const [filterProvider, setFilterProvider] = useState<string[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Detail Drawer State
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Sort Mode State
  const [sortMode, setSortMode] = useState<SortMode>("severity");

  // Get alerts based on current tab
  const alerts = useMemo(() => {
    let data: Alert[] = currentTab === "forecast" ? FORECAST_ALERTS : HISTORY_ALERTS;

    // Apply filters
    return data.filter((alert) => {
      // Search filter
      if (
        searchQuery &&
        !alert.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !alert.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Utility filter
      if (filterUtility !== "all" && alert.utility !== filterUtility) {
        return false;
      }

      // Provider filter
      if (filterProvider.length > 0 && !filterProvider.includes(alert.provider)) {
        return false;
      }

      // Severity filter
      if (filterSeverity.length > 0 && !filterSeverity.includes(alert.severity)) {
        return false;
      }

      return true;
    });
  }, [currentTab, searchQuery, filterUtility, filterProvider, filterSeverity]);

  // Handle alert click
  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  };

  // Close drawer
  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedAlert(null), 300);
  };

  // Stats calculations
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const highCount = alerts.filter((a) => a.severity === "high").length;
  const mediumCount = alerts.filter((a) => a.severity === "medium").length;
  const lowCount = alerts.filter((a) => a.severity === "low").length;

  // Active filters count
  const activeFiltersCount = [
    filterUtility !== "all",
    filterProvider.length > 0,
    filterSeverity.length > 0,
    filterType !== "all",
    filterBlock !== "all",
    filterDateFrom !== "",
    filterDateTo !== "",
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterUtility("all");
    setFilterProvider([]);
    setFilterSeverity([]);
    setFilterType("all");
    setFilterBlock("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  // Quick filter by severity (from stat cards)
  const quickFilterBySeverity = (severity: Severity | "all") => {
    if (severity === "all") {
      setFilterSeverity([]);
    } else {
      setFilterSeverity([severity]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/30">
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1800px] mx-auto">
        {/* ═══ PAGE HEADER ═══ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
              <span>WeatherXpert</span>
              <ChevronRight className="w-3 h-3" />
              <span>{activeUtility}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">Alerts</span>
            </div>
            <h1 className="text-foreground mb-1">Alert Management</h1>
            <p className="text-[13px] text-muted-foreground">
              Monitor and manage weather alerts across all facilities
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            
            {(can("create_alerts") || can("modify_alerts")) && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openModal}
                className="px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-600 text-white hover:shadow-xl hover:shadow-indigo-500/30 transition-all font-semibold flex items-center gap-2.5 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create Alert
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ═══ SEARCH & QUICK FILTERS BAR ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col md:flex-row gap-3"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-blue-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-[13px] rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-md hover:shadow-lg transition-all font-medium backdrop-blur-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-5 py-3 rounded-xl border text-[13px] font-semibold flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all backdrop-blur-xl ${
              showAdvancedFilters || activeFiltersCount > 0
                ? "bg-blue-500 text-white border-blue-600"
                : "bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-foreground"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-[11px] font-bold">
                {activeFiltersCount}
              </span>
            )}
            {showAdvancedFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </motion.button>

          {/* Refresh Button */}
          
        </motion.div>

        {/* ═══ ADVANCED FILTERS PANEL ═══ */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className={`${glassCardClass} space-y-4`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                  </h3>
                  {activeFiltersCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearAllFilters}
                      className="text-[12px] font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Clear All
                    </motion.button>
                  )}
                </div>

                {/* Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Date From */}
                  <div>
                    <label className="text-[11px] text-muted-foreground font-semibold mb-2 block uppercase tracking-wide">
                      Date From
                    </label>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all">
                      <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="bg-transparent text-[13px] text-foreground focus:outline-none flex-1 font-medium"
                      />
                    </div>
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="text-[11px] text-muted-foreground font-semibold mb-2 block uppercase tracking-wide">
                      Date To
                    </label>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all">
                      <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="bg-transparent text-[13px] text-foreground focus:outline-none flex-1 font-medium"
                      />
                    </div>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="text-[11px] text-muted-foreground font-semibold mb-2 block uppercase tracking-wide">
                      Severity
                    </label>
                    <select
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "all") {
                          setFilterSeverity([]);
                        } else {
                          setFilterSeverity([value]);
                        }
                      }}
                      value={filterSeverity.length > 0 ? filterSeverity[0] : "all"}
                      className="w-full px-4 py-2.5 text-[13px] rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm hover:shadow-md transition-all font-medium"
                    >
                      <option value="all">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="text-[11px] text-muted-foreground font-semibold mb-2 block uppercase tracking-wide">
                      Alert Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-2.5 text-[13px] rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm hover:shadow-md transition-all font-medium"
                    >
                      <option value="all">All Types</option>
                      <option value="temperature">Temperature</option>
                      <option value="rainfall">Rainfall</option>
                      <option value="wind">Wind</option>
                      <option value="humidity">Humidity</option>
                      <option value="storm">Storm</option>
                    </select>
                  </div>

                  {/* Utility/DISCOM */}
                  <div>
                    <label className="text-[11px] text-muted-foreground font-semibold mb-2 block uppercase tracking-wide">
                      Utility / DISCOM
                    </label>
                    <select
                      value={filterUtility}
                      onChange={(e) => setFilterUtility(e.target.value)}
                      className="w-full px-4 py-2.5 text-[13px] rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm hover:shadow-md transition-all font-medium"
                    >
                      <option value="all">All DISCOMs</option>
                      <option value="TATA Power Mumbai">TATA Power Mumbai</option>
                      <option value="Gujarat Wind Farm">Gujarat Wind Farm</option>
                      <option value="Karnataka Solar Plant">Karnataka Solar Plant</option>
                    </select>
                  </div>

                  {/* Provider */}
                  <div>
                    <label className="text-[11px] text-muted-foreground font-semibold mb-2 block uppercase tracking-wide">
                      Weather Provider
                    </label>
                    <select
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "all") {
                          setFilterProvider([]);
                        } else {
                          setFilterProvider([value]);
                        }
                      }}
                      value={filterProvider.length > 0 ? filterProvider[0] : "all"}
                      className="w-full px-4 py-2.5 text-[13px] rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm hover:shadow-md transition-all font-medium"
                    >
                      <option value="all">All Providers</option>
                      <option value="IMD">IMD</option>
                      <option value="Tomorrow.io">Tomorrow.io</option>
                    </select>
                  </div>

                  {/* Block */}
                  <div>
                    <label className="text-[11px] text-muted-foreground font-semibold mb-2 block uppercase tracking-wide">
                      Block / Zone
                    </label>
                    <select
                      value={filterBlock}
                      onChange={(e) => setFilterBlock(e.target.value)}
                      className="w-full px-4 py-2.5 text-[13px] rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm hover:shadow-md transition-all font-medium"
                    >
                      <option value="all">All Blocks</option>
                      <option value="block-a">Block A</option>
                      <option value="block-b">Block B</option>
                      <option value="block-c">Block C</option>
                      <option value="zone-d">Zone D</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="text-[11px] text-muted-foreground font-semibold mb-2 block uppercase tracking-wide">
                      Sort By
                    </label>
                    <select
                      value={sortMode}
                      onChange={(e) => setSortMode(e.target.value as SortMode)}
                      className="w-full px-4 py-2.5 text-[13px] rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm hover:shadow-md transition-all font-medium"
                    >
                      <option value="severity">Severity (High to Low)</option>
                      <option value="time">Time (Newest First)</option>
                      <option value="location">Location (A-Z)</option>
                      <option value="probability">Probability (High to Low)</option>
                    </select>
                  </div>
                </div>

                {/* Active Filter Tags */}
                {activeFiltersCount > 0 && (
                  <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex flex-wrap gap-2">
                      {filterSeverity.length > 0 && (
                        <FilterTag
                          label={`Severity: ${filterSeverity[0]}`}
                          onRemove={() => setFilterSeverity([])}
                        />
                      )}
                      {filterUtility !== "all" && (
                        <FilterTag
                          label={`Utility: ${filterUtility}`}
                          onRemove={() => setFilterUtility("all")}
                        />
                      )}
                      {filterProvider.length > 0 && (
                        <FilterTag
                          label={`Provider: ${filterProvider[0]}`}
                          onRemove={() => setFilterProvider([])}
                        />
                      )}
                      {filterType !== "all" && (
                        <FilterTag
                          label={`Type: ${filterType}`}
                          onRemove={() => setFilterType("all")}
                        />
                      )}
                      {filterBlock !== "all" && (
                        <FilterTag
                          label={`Block: ${filterBlock}`}
                          onRemove={() => setFilterBlock("all")}
                        />
                      )}
                      {filterDateFrom && (
                        <FilterTag
                          label={`From: ${filterDateFrom}`}
                          onRemove={() => setFilterDateFrom("")}
                        />
                      )}
                      {filterDateTo && (
                        <FilterTag
                          label={`To: ${filterDateTo}`}
                          onRemove={() => setFilterDateTo("")}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ STATS CARDS — Compact & Minimal ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {([
            { key: "all" as const, label: "Total", count: alerts.length, sub: currentTab === "forecast" ? "Predicted" : "Historical", icon: AlertTriangle, clr: "slate", active: filterSeverity.length === 0 },
            { key: "critical" as const, label: "Critical", count: criticalCount, sub: "Immediate action", icon: AlertCircle, clr: "red", active: filterSeverity.includes("critical") },
            { key: "high" as const, label: currentTab === "forecast" ? "High Prob" : "High", count: highCount, sub: currentTab === "forecast" ? "High probability" : "Priority", icon: Zap, clr: "amber", active: filterSeverity.includes("high") },
            { key: (currentTab === "forecast" ? "low" : "medium") as Severity, label: currentTab === "forecast" ? "Low Risk" : "Medium", count: currentTab === "forecast" ? lowCount : mediumCount, sub: currentTab === "forecast" ? "Low risk" : "Moderate", icon: CheckCircle2, clr: "emerald", active: filterSeverity.includes("low") || filterSeverity.includes("medium") },
          ] as const).map((card) => {
            const Icon = card.icon;
            const colorMap: Record<string, { bg: string; iconBg: string; text: string; ring: string; label: string }> = {
              slate: { bg: "bg-slate-50/80 dark:bg-slate-800/50", iconBg: "bg-slate-100 dark:bg-slate-700/60", text: "text-slate-700 dark:text-slate-200", ring: "ring-slate-400/40 border-slate-300 dark:border-slate-600", label: "text-slate-500" },
              red: { bg: "bg-red-50/60 dark:bg-red-950/25", iconBg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-400", ring: "ring-red-400/40 border-red-300 dark:border-red-700", label: "text-red-500 dark:text-red-400" },
              amber: { bg: "bg-amber-50/60 dark:bg-amber-950/25", iconBg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-400/40 border-amber-300 dark:border-amber-700", label: "text-amber-500 dark:text-amber-400" },
              emerald: { bg: "bg-emerald-50/60 dark:bg-emerald-950/25", iconBg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-400/40 border-emerald-300 dark:border-emerald-700", label: "text-emerald-500 dark:text-emerald-400" },
            };
            const c = colorMap[card.clr];
            return (
              <motion.button
                key={card.label}
                onClick={() => quickFilterBySeverity(card.key as any)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative rounded-xl px-4 py-3.5 border text-left transition-all backdrop-blur-xl ${
                  card.active ? `${c.bg} ${c.ring} ring-1 shadow-md` : "bg-white/70 dark:bg-slate-800/70 border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${c.iconBg}`}>
                    <Icon className={`w-4 h-4 ${c.label}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black ${c.text}`}>{card.count}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${c.label}`}>{card.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{card.sub}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ═══ TAB NAVIGATION & VIEW CONTROLS ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-md backdrop-blur-xl">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentTab("forecast")}
                className={`relative px-6 py-3 text-[14px] font-bold transition-all flex items-center gap-2.5 rounded-lg ${
                  currentTab === "forecast"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Forecast
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold">
                  {FORECAST_ALERTS.length}
                </span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentTab("history")}
                className={`relative px-6 py-3 text-[14px] font-bold transition-all flex items-center gap-2.5 rounded-lg ${
                  currentTab === "history"
                    ? "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Clock className="w-4 h-4" />
                History
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold">
                  {HISTORY_ALERTS.length}
                </span>
              </motion.button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 p-1.5 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-md backdrop-blur-xl">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-700/50"
                  } transition-all`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-700/50"
                  } transition-all`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Results Count */}
              <div className="text-[13px] text-muted-foreground font-semibold bg-white/80 dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-md backdrop-blur-xl">
                Showing <span className="text-foreground font-bold">{alerts.length}</span> alerts
              </div>
            </div>
          </div>

          {/* Section Description */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {currentTab === "forecast" ? "Forecast Alerts" : "Historical Alerts"}
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {currentTab === "forecast"
                ? `${alerts.length} predicted events • ${criticalCount} critical • ${highCount} high probability • Last updated: Friday 13 Mar, 2026`
                : `${alerts.length} resolved alerts • ${criticalCount} critical incidents • Last updated: Friday 13 Mar, 2026`}
            </p>
          </div>
        </motion.div>

        {/* ═══ ALERTS LIST ═══ */}
        <AnimatePresence mode="wait">
          {alerts.length === 0 ? (
            <EmptyState tab={currentTab} hasActiveFilters={activeFiltersCount > 0} />
          ) : (
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                  : "space-y-4"
              }
            >
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {viewMode === "grid" ? (
                    <AlertCard
                      alert={alert}
                      onClick={() => handleAlertClick(alert)}
                      isForecast={currentTab === "forecast"}
                    />
                  ) : (
                    <AlertListRow
                      alert={alert}
                      onClick={() => handleAlertClick(alert)}
                      isForecast={currentTab === "forecast"}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ DETAIL DRAWER ═══ */}
        <AlertDetailDrawer
          alert={selectedAlert}
          isOpen={drawerOpen}
          onClose={closeDrawer}
          isForecast={currentTab === "forecast"}
        />

        {/* ═══ ALERT CREATION MODAL ═══ */}
        <AlertCreationModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FILTER TAG COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[12px] font-semibold border border-blue-200 dark:border-blue-800"
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ALERT CARD COMPONENT (GRID VIEW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface AlertCardProps {
  alert: Alert;
  onClick: () => void;
  isForecast: boolean;
}

function AlertCard({ alert, onClick, isForecast }: AlertCardProps) {
  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const isCritical = alert.severity === "critical";
  const SeverityIcon = severityConfig.icon;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border cursor-pointer transition-all backdrop-blur-xl ${
        isCritical
          ? "bg-white/90 dark:bg-slate-900/90 border-red-200/80 dark:border-red-800/50 shadow-sm hover:shadow-lg hover:shadow-red-500/10"
          : "bg-white/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-lg"
      }`}
    >
      {/* Top severity accent line */}
      <div className="h-0.5 w-full" style={{ backgroundColor: severityConfig.color }} />

      <div className="p-4">
        {/* Header row: severity pill + provider */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide"
            style={{
              backgroundColor: severityConfig.bg,
              color: severityConfig.color,
            }}
          >
            <SeverityIcon className="w-3 h-3" />
            {severityConfig.label}
          </div>
          <div className="flex items-center gap-1.5">
            {isCritical && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
            <span className="text-[10px] font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {alert.provider}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug text-foreground">
          {alert.title}
        </h3>

        {/* Compact metadata row */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <span className="truncate">{alert.utility}</span>
          </span>
          {isForecast && alert.probability && (
            <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 ml-auto flex-shrink-0">
              <TrendingUp className="w-3 h-3" />
              {alert.probability}
            </span>
          )}
          {!isForecast && alert.duration && (
            <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 ml-auto flex-shrink-0">
              <Clock className="w-3 h-3" />
              {alert.duration}
            </span>
          )}
        </div>

        {/* Footer: time + action */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {isForecast ? alert.expectedTriggerTime : alert.triggeredTime}
          </span>
          <span className="flex items-center gap-0.5 text-primary text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Details
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ALERT LIST ROW COMPONENT (LIST VIEW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface AlertListRowProps {
  alert: Alert;
  onClick: () => void;
  isForecast: boolean;
}

function AlertListRow({ alert, onClick, isForecast }: AlertListRowProps) {
  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const isCritical = alert.severity === "critical";
  const SeverityIcon = severityConfig.icon;

  return (
    <motion.div
      whileHover={{ x: 4, scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl p-5 border cursor-pointer transition-all backdrop-blur-sm ${
        isCritical
          ? "bg-gradient-to-r from-red-50 via-white to-transparent dark:from-red-950/50 dark:via-slate-900 dark:to-transparent border-red-400/60 dark:border-red-600/60 shadow-md hover:shadow-lg hover:shadow-red-500/20"
          : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
      }`}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: severityConfig.color,
      }}
    >
      <div className="flex items-start gap-5">
        {/* Severity Icon */}
        <div
          className="p-3 rounded-xl shadow-md flex-shrink-0"
          style={{
            backgroundColor: severityConfig.bg,
          }}
        >
          <SeverityIcon className="w-5 h-5" style={{ color: severityConfig.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title & Badges */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-[15px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {alert.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: severityConfig.bg,
                  color: severityConfig.color,
                }}
              >
                {severityConfig.label}
              </div>
              <div className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {alert.status}
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">{alert.utility}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Activity className="w-3.5 h-3.5 text-green-500" />
              <span className="font-medium">{alert.provider}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-medium">
                {isForecast ? alert.expectedTriggerTime : alert.triggeredTime}
              </span>
            </div>
            {isForecast && alert.probability && (
              <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{alert.probability}</span>
              </div>
            )}
            {!isForecast && alert.duration && (
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{alert.duration}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-center gap-1 text-primary font-bold text-[12px] flex-shrink-0"
        >
          <Eye className="w-4 h-4" />
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </div>

      {/* Critical Indicator */}
      {isCritical && (
        <div className="absolute top-4 right-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
            <div className="relative w-2.5 h-2.5 bg-red-500 rounded-full" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   EMPTY STATE COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface EmptyStateProps {
  tab: AlertTab;
  hasActiveFilters: boolean;
}

function EmptyState({ tab, hasActiveFilters }: EmptyStateProps) {
  const config = hasActiveFilters
    ? {
        title: "No alerts match your filters",
        description:
          "Try adjusting your search criteria or clearing some filters to see more results.",
        icon: Filter,
      }
    : tab === "forecast"
    ? {
        title: "No predicted alerts",
        description:
          "No upcoming weather events forecasted. Predictions will appear here when detected by providers.",
        icon: Sparkles,
      }
    : {
        title: "No historical alerts found",
        description:
          "No past alerts in the system. Historical data will appear here once events are resolved.",
        icon: Clock,
      };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-32 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mb-8 shadow-xl"
      >
        <Icon className="w-16 h-16 text-blue-500 dark:text-blue-400" />
      </motion.div>
      <h3 className="text-2xl font-bold text-foreground mb-4">{config.title}</h3>
      <p className="text-[15px] text-muted-foreground max-w-lg leading-relaxed">
        {config.description}
      </p>
    </motion.div>
  );
}
