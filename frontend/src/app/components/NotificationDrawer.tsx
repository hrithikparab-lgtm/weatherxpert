import { X, Bell, AlertTriangle, MapPin, Target, Check, ExternalLink } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useRole } from "./RoleContext";
import { AlertDetailDrawer, type AlertDetail } from "./AlertDetailDrawer";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   ALERT NOTIFICATION DRAWER — Global Alert System
   Read-Only Monitoring · Role-aware filtering
   Smart auto-open for extreme severity
   No workflow actions - Pure visibility
   ═══════════════════════════════════════════════════ */

export interface GlobalAlert {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "extreme";
  utility: string;
  location: string;
  alertType: string;
  riskScore: number;
  timestamp: string;
  status: "active" | "resolved"; // Simplified status for read-only monitoring
  description: string;
  link?: string;
  escalationLevel?: 1 | 2 | 3;
  // Additional fields for AlertDetailDrawer
  provider?: string;
  receivedTime?: string;
  basedOn?: string;
  forecastedConditions?: { parameter: string; value: string }[];
  createdBy?: { name: string; initials: string };
  startTime?: string;
  locationTime?: string;
  isInternal?: boolean;
  predictedValue?: string;
  thresholdValue?: string;
}

export const GLOBAL_ALERTS: GlobalAlert[] = [
  {
    id: "a0",
    severity: "extreme",
    utility: "Mumbai Distribution",
    location: "Andheri Zone - Critical Infrastructure",
    alertType: "Catastrophic Cyclone Alert",
    riskScore: 98,
    timestamp: "1 min ago",
    status: "active",
    description: "Severe cyclonic storm approaching. Wind speeds exceeding 120 km/h. Immediate grid shutdown recommended.",
    link: "/dashboard",
    escalationLevel: 3,
  },
  {
    id: "a1",
    severity: "critical",
    utility: "Mumbai Distribution",
    location: "Andheri Zone - Substation 4",
    alertType: "Extreme Heat Alert",
    riskScore: 95,
    timestamp: "2 mins ago",
    status: "active",
    description: "Temperature exceeding 38°C. Grid load at peak capacity.",
    link: "/dashboard",
    escalationLevel: 2,
  },
  {
    id: "a2",
    severity: "critical",
    utility: "Delhi Distribution",
    location: "Connaught Place Grid",
    alertType: "Pressure Drop Alert",
    riskScore: 92,
    timestamp: "8 mins ago",
    status: "active",
    description: "Atmospheric pressure falling rapidly to 985 hPa.",
    link: "/dashboard",
    escalationLevel: 2,
  },
  {
    id: "a3",
    severity: "high",
    utility: "Mumbai Distribution",
    location: "Coastal Mumbai",
    alertType: "Storm Warning",
    riskScore: 88,
    timestamp: "28 mins ago",
    status: "active",
    description: "Heavy rainfall predicted in next 6 hours.",
    link: "/climate",
    escalationLevel: 1,
  },
  {
    id: "a4",
    severity: "high",
    utility: "Renewables - Wind",
    location: "Gujarat Wind Farm",
    alertType: "Wind Speed Alert",
    riskScore: 85,
    timestamp: "45 mins ago",
    status: "active",
    description: "Wind speeds exceeding 65 km/h expected.",
    link: "/master-home",
    escalationLevel: 1,
  },
  {
    id: "a5",
    severity: "medium",
    utility: "Mundra UMPP",
    location: "Unit 2 - Inland",
    alertType: "Cloud Cover Increase",
    riskScore: 72,
    timestamp: "1 hour ago",
    status: "active",
    description: "Cloud coverage above 90%, affecting operations.",
    link: "/dashboard",
    escalationLevel: 1,
  },
  {
    id: "a6",
    severity: "medium",
    utility: "Renewables - Solar",
    location: "Charanka Solar Park",
    alertType: "Humidity Spike",
    riskScore: 68,
    timestamp: "1 hour 15 mins ago",
    status: "active",
    description: "Relative humidity above 85%.",
    link: "/climate",
    escalationLevel: 1,
  },
  {
    id: "a7",
    severity: "low",
    utility: "Delhi Distribution",
    location: "Rohini Zone",
    alertType: "Air Density Variation",
    riskScore: 55,
    timestamp: "2 hours ago",
    status: "resolved",
    description: "Minor air density fluctuation detected.",
    link: "/dashboard",
  },
  {
    id: "a8",
    severity: "low",
    utility: "Mumbai Distribution",
    location: "Borivali Sector",
    alertType: "Precipitation Warning",
    riskScore: 52,
    timestamp: "3 hours ago",
    status: "resolved",
    description: "Light precipitation expected in next 2 hours.",
    link: "/climate",
  },
];

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

type FilterTab = "all" | "critical" | "high" | "medium";

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const [alerts, setAlerts] = useState<GlobalAlert[]>(GLOBAL_ALERTS);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const navigate = useNavigate();
  const { user, activeUtility } = useRole();

  // AlertDetailDrawer state
  const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Handle animation state
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Role-aware filtering
  const roleFilteredAlerts = useMemo(() => {
    if (user.role === "super_admin") {
      return alerts; // See all
    }
    if (user.role === "admin") {
      // Filter by assigned utilities (simplified: using activeUtility)
      return alerts.filter(a => a.utility === activeUtility || a.utility.includes("Renewables"));
    }
    // Operator: only assigned utility
    return alerts.filter(a => a.utility === activeUtility);
  }, [alerts, user.role, activeUtility]);

  // Severity filtering
  const filteredAlerts = useMemo(() => {
    if (activeFilter === "all") return roleFilteredAlerts;
    return roleFilteredAlerts.filter(a => a.severity === activeFilter);
  }, [roleFilteredAlerts, activeFilter]);

  // Get counts for tabs
  const counts = useMemo(() => ({
    all: roleFilteredAlerts.filter(a => a.status === "active").length,
    critical: roleFilteredAlerts.filter(a => a.severity === "critical" && a.status === "active").length,
    high: roleFilteredAlerts.filter(a => a.severity === "high" && a.status === "active").length,
    medium: roleFilteredAlerts.filter(a => a.severity === "medium" && a.status === "active").length,
  }), [roleFilteredAlerts]);

  const handleAlertClick = (alert: GlobalAlert) => {
    // Convert GlobalAlert to AlertDetail format
    const alertDetail: AlertDetail = {
      id: alert.id,
      title: alert.alertType,
      utility: alert.utility,
      provider: alert.provider || (alert.isInternal ? "Internal" : "IMD"),
      severity: alert.severity === "extreme" ? "critical" : alert.severity,
      status: alert.status,
      location: alert.location,
      receivedTime: alert.receivedTime || alert.timestamp,
      basedOn: alert.basedOn,
      forecastedConditions: alert.forecastedConditions,
      createdBy: alert.createdBy,
      startTime: alert.startTime,
      locationTime: alert.locationTime,
      isInternal: alert.isInternal,
      predictedValue: alert.predictedValue,
      thresholdValue: alert.thresholdValue,
    };

    setSelectedAlert(alertDetail);
    setIsDetailDrawerOpen(true);
  };

  const handleDetailDrawerClose = () => {
    setIsDetailDrawerOpen(false);
    setTimeout(() => setSelectedAlert(null), 300);
  };

  const getSeverityColor = (severity: GlobalAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return {
          border: "border-l-4 border-l-red-500",
          bg: "bg-red-500/5",
          text: "text-red-600 dark:text-red-400",
          badge: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
        };
      case "high":
        return {
          border: "border-l-4 border-l-orange-500",
          bg: "bg-orange-500/5",
          text: "text-orange-600 dark:text-orange-400",
          badge: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
        };
      case "medium":
        return {
          border: "border-l-4 border-l-yellow-500",
          bg: "bg-yellow-500/5",
          text: "text-yellow-600 dark:text-yellow-400",
          badge: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
        };
      case "low":
        return {
          border: "border-l-4 border-l-blue-500",
          bg: "bg-blue-500/5",
          text: "text-blue-600 dark:text-blue-400",
          badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
        };
      case "extreme":
        return {
          border: "border-l-4 border-l-pink-500",
          bg: "bg-pink-500/5",
          text: "text-pink-600 dark:text-pink-400",
          badge: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30",
        };
    }
  };

  if (!isVisible && !open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex justify-end">
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        {/* Drawer */}
        <div
          className={`relative w-full sm:max-w-md md:max-w-lg h-full bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl transition-transform duration-300 ease-out transform flex flex-col ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-border bg-background/50">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  {counts.all > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-background">
                      {counts.all}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Active Alerts</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {user.role === "super_admin" ? "All Utilities" : activeUtility}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto">
              {(["all", "critical", "high", "medium"] as FilterTab[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeFilter === filter
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span className="capitalize">{filter}</span>
                  {counts[filter] > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeFilter === filter 
                        ? "bg-primary-foreground/20" 
                        : "bg-primary/20 text-primary"
                    }`}>
                      {counts[filter]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Alert List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-[14px] font-medium">No {activeFilter !== "all" ? activeFilter : ""} alerts</p>
                <p className="text-[12px] opacity-60 mt-1">You're all clear!</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const colors = getSeverityColor(alert.severity);
                const isResolved = alert.status === "resolved";
                const isCritical = alert.severity === "critical" || alert.severity === "extreme";

                return (
                  <div
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    className={`group relative rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer ${colors.border} ${
                      isResolved ? "opacity-60" : ""
                    } ${
                      isCritical 
                        ? "!border-2 !border-red-500 shadow-lg shadow-red-500/25 bg-gradient-to-br from-red-50/80 to-card dark:from-red-950/40 dark:to-card hover:shadow-2xl hover:shadow-red-500/40" 
                        : ""
                    }`}
                  >
                    {/* Critical Emergency Pulse Indicator */}
                    {isCritical && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="relative">
                          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                          <div className="relative w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            isCritical ? "text-red-600 dark:text-red-400 animate-pulse" : colors.text
                          }`} />
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-[13px] font-semibold leading-tight ${
                              isCritical ? "text-red-700 dark:text-red-400 font-bold" : "text-foreground"
                            }`}>
                              {isCritical && "🚨 "}{alert.alertType}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {alert.timestamp}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border flex-shrink-0 ${
                          isCritical 
                            ? "bg-red-600 text-white border-red-700 shadow-md shadow-red-500/30 ring-2 ring-red-500/50 font-black" 
                            : colors.badge
                        }`}>
                          {isCritical ? (alert.severity === "extreme" ? "⚠ EXTREME" : "🚨 CRITICAL") : alert.severity}
                        </span>
                      </div>

                      {/* Utility & Location */}
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Target className={`w-3 h-3 ${isCritical ? "text-red-600 dark:text-red-400" : "text-primary"}`} />
                          <span className={`font-medium ${isCritical ? "text-red-700 dark:text-red-300" : "text-foreground"}`}>{alert.utility}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <MapPin className={`w-3 h-3 ${isCritical ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`} />
                          <span className="text-muted-foreground">{alert.location}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {/* Risk Score */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Risk Score</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-24 h-1.5 bg-secondary rounded-full overflow-hidden ${
                            isCritical ? "ring-2 ring-red-500/30" : ""
                          }`}>
                            <div
                              className={`h-full rounded-full ${
                                alert.riskScore >= 90 ? "bg-red-500" :
                                alert.riskScore >= 75 ? "bg-orange-500" :
                                alert.riskScore >= 60 ? "bg-yellow-500" : "bg-blue-500"
                              } ${isCritical ? "animate-pulse" : ""}`}
                              style={{ width: `${alert.riskScore}%` }}
                            />
                          </div>
                          <span className={`text-[12px] font-bold tabular-nums ${
                            isCritical ? "text-red-600 dark:text-red-400" : "text-foreground"
                          }`}>{alert.riskScore}</span>
                        </div>
                      </div>

                      {/* Action Buttons - Read-Only Monitoring */}
                      <div className="flex items-center gap-2">
                        {alert.link && (
                          <button
                            onClick={() => handleAlertClick(alert)}
                            className={`flex-1 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 ${
                              isCritical
                                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 font-bold"
                                : "bg-secondary hover:bg-secondary/80 text-foreground"
                            }`}
                          >
                            <span>View Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Removed Acknowledged Badge - Read-Only Monitoring */}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* AlertDetailDrawer - Opens on top of notification drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        isOpen={isDetailDrawerOpen}
        onClose={handleDetailDrawerClose}
        isForecast={true}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   HELPER: Get Alert Counts for TopBar Badge
   ═══════════════════════════════════════════════════ */
export function getGlobalAlertCounts(userRole: string, activeUtility: string) {
  let filteredAlerts = GLOBAL_ALERTS;

  // Role-based filtering
  if (userRole === "admin") {
    filteredAlerts = GLOBAL_ALERTS.filter(
      a => a.utility === activeUtility || a.utility.includes("Renewables")
    );
  } else if (userRole === "operator") {
    filteredAlerts = GLOBAL_ALERTS.filter(a => a.utility === activeUtility);
  }

  const activeAlerts = filteredAlerts.filter(a => a.status === "active");
  const extremeCount = activeAlerts.filter(a => a.severity === "extreme").length;
  const criticalCount = activeAlerts.filter(a => a.severity === "critical").length;
  const highCount = activeAlerts.filter(a => a.severity === "high").length;
  const mediumCount = activeAlerts.filter(a => a.severity === "medium").length;

  return {
    total: activeAlerts.length,
    extreme: extremeCount,
    critical: criticalCount,
    high: highCount,
    medium: mediumCount,
    highestSeverity: 
      extremeCount > 0 ? "extreme" : 
      criticalCount > 0 ? "critical" : 
      highCount > 0 ? "high" : 
      mediumCount > 0 ? "medium" : "low",
  };
}

/* ═══════════════════════════════════════════════════
   HELPER: Check if auto-open is needed
   Smart logic: Auto-open ONLY IF:
   1. First extreme severity alert in session
   2. Risk score > 95 threshold
   3. Escalation Level 3 triggered
   ═══════════════════════════════════════════════════ */
export function shouldAutoOpenAlerts(userRole: string, activeUtility: string): boolean {
  // Check if already auto-opened this session
  const hasAutoOpened = sessionStorage.getItem("weatherxpert_alert_auto_opened");
  if (hasAutoOpened === "true") {
    return false; // Never auto-open twice in same session
  }

  let filteredAlerts = GLOBAL_ALERTS;

  // Role-based filtering
  if (userRole === "admin") {
    filteredAlerts = GLOBAL_ALERTS.filter(
      a => a.utility === activeUtility || a.utility.includes("Renewables")
    );
  } else if (userRole === "operator") {
    filteredAlerts = GLOBAL_ALERTS.filter(a => a.utility === activeUtility);
  }

  const activeAlerts = filteredAlerts.filter(a => a.status === "active");

  // Check conditions for auto-open
  const hasExtremeSeverity = activeAlerts.some(a => a.severity === "extreme");
  const hasRiskAbove95 = activeAlerts.some(a => a.riskScore > 95);
  const hasEscalationLevel3 = activeAlerts.some(a => a.escalationLevel === 3);

  const shouldOpen = hasExtremeSeverity || hasRiskAbove95 || hasEscalationLevel3;

  // Mark as auto-opened in session storage
  if (shouldOpen) {
    sessionStorage.setItem("weatherxpert_alert_auto_opened", "true");
  }

  return shouldOpen;
}