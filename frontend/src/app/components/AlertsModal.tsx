import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  X,
  AlertTriangle,
  MapPin,
  Bell,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";

interface WeatherEvent {
  id: number;
  type: string;
  location: string;
  severity: "High" | "Medium" | "Low";
  startTime: string;
  status: "Active" | "Monitoring" | "Predicted";
}

interface AlertsModalProps {
  open: boolean;
  onClose: () => void;
  events: WeatherEvent[];
  location: string;
  provider: string;
  timeRange?: string;
  parameter?: string;
  forecastHorizon?: string;
}

type SeverityFilter = "All" | "Critical" | "High" | "Medium";

// Map event severity to alert level
const getSeverityLevel = (severity: "High" | "Medium" | "Low"): "Critical" | "High" | "Medium" => {
  if (severity === "High") return "Critical";
  if (severity === "Medium") return "High";
  return "Medium";
};

// Alert titles mapping
const alertTitles: Record<string, string> = {
  "Heavy Rain": "Catastrophic Cyclone Alert",
  "Cyclone Warning": "Catastrophic Cyclone Alert",
  "High Humidity": "High Humidity Alert",
  "Thunderstorm": "Severe Thunderstorm Alert",
  "Extreme Heat": "Extreme Heat Alert",
  "Heatwave": "Extreme Heat Alert",
  "Storm Surge": "Storm Warning",
  "Flooding Risk": "Flooding Risk Alert",
  "Wind Gusts": "Wind Gust Alert",
  "Lightning Alert": "Lightning Alert",
  "High Wind": "High Wind Alert",
  "Dust Storm": "Dust Storm Alert",
  "Sand Storm": "Sand Storm Alert",
};

// Generate risk score based on severity and event type
const getRiskScore = (severity: "High" | "Medium" | "Low", eventType: string): number => {
  const baseScore = severity === "High" ? 90 : severity === "Medium" ? 70 : 50;
  const typeBonus = eventType.includes("Cyclone") || eventType.includes("Catastrophic") ? 8 : 
                   eventType.includes("Extreme") ? 5 : 0;
  return Math.min(98, baseScore + typeBonus);
};

// Get zone info based on location
const getZoneInfo = (location: string): string => {
  const zones = [
    "Andheri Zone - Critical Infrastructure",
    "Andheri Zone - Substation 4",
    "Coastal Mumbai",
    "Western Suburbs - Grid Station",
    "Central Zone - Distribution",
    "Eastern Sector - Transmission",
  ];
  return zones[Math.floor(Math.random() * zones.length)];
};

export function AlertsModal({ 
  open, 
  onClose, 
  events, 
  location, 
  provider,
  timeRange = "Today",
  parameter = "Temperature",
  forecastHorizon = "Day Ahead"
}: AlertsModalProps) {
  const [activeFilter, setActiveFilter] = useState<SeverityFilter>("All");
  const navigate = useNavigate();

  // Convert events to alert format with severity levels
  const alerts = events.map(event => ({
    ...event,
    level: getSeverityLevel(event.severity),
    riskScore: getRiskScore(event.severity, event.type),
    zone: getZoneInfo(event.location),
    title: alertTitles[event.type] || `${event.type} Alert`,
  }));

  // Filter alerts
  const filtered = alerts.filter(alert =>
    activeFilter === "All" ? true : alert.level === activeFilter
  );

  // Calculate counts
  const counts = {
    All: alerts.length,
    Critical: alerts.filter(a => a.level === "Critical").length,
    High: alerts.filter(a => a.level === "High").length,
    Medium: alerts.filter(a => a.level === "Medium").length,
  };

  // Severity config
  const severityConfig = {
    Critical: {
      badge: "bg-red-600 text-white",
      border: "border-red-500",
      indicator: "bg-red-500",
      icon: "text-red-600",
    },
    High: {
      badge: "bg-orange-500 text-white",
      border: "border-orange-400",
      indicator: "bg-orange-500",
      icon: "text-orange-500",
    },
    Medium: {
      badge: "bg-amber-500 text-white",
      border: "border-amber-400",
      indicator: "bg-amber-500",
      icon: "text-amber-600",
    },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[720px] bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-[22px] font-semibold text-gray-900 dark:text-white">
                      Active Alerts
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {location}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mt-4">
                {(["All", "Critical", "High", "Medium"] as SeverityFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeFilter === filter
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No alerts for this filter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((alert, index) => {
                    const config = severityConfig[alert.level];
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 ${config.border} p-5 shadow-sm`}
                      >
                        {/* Pulse Indicator */}
                        <div className="absolute top-5 right-5">
                          <div className={`w-3 h-3 ${config.indicator} rounded-full animate-pulse`} />
                        </div>

                        {/* Alert Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="mt-0.5">
                            {alert.level === "Critical" && <Shield className={`w-5 h-5 ${config.icon}`} />}
                            {alert.level === "High" && <Zap className={`w-5 h-5 ${config.icon}`} />}
                            {alert.level === "Medium" && <AlertTriangle className={`w-5 h-5 ${config.icon}`} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-base font-semibold ${config.icon}`}>
                                {alert.title}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {alert.startTime}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${config.badge}`}>
                            {alert.level.toUpperCase()}
                          </div>
                        </div>

                        {/* Location Info */}
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <div className={`w-4 h-4 rounded-full ${config.indicator} flex items-center justify-center`}>
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                            <span className="font-medium">{location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-6">
                            <MapPin className="w-4 h-4" />
                            <span>{alert.zone}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className={`text-sm mb-4 font-medium ${
                          alert.level === "Critical" ? "text-red-900 dark:text-red-300" : 
                          alert.level === "High" ? "text-orange-900 dark:text-orange-300" : 
                          "text-amber-900 dark:text-amber-300"
                        }`}>
                          {alert.description}
                        </p>

                        {/* Risk Score */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              RISK SCORE
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${alert.riskScore}%` }}
                              transition={{ duration: 0.8, delay: index * 0.05 }}
                              className={`h-full rounded-full ${
                                alert.riskScore >= 95 ? "bg-red-600" : 
                                alert.riskScore >= 80 ? "bg-orange-600" : 
                                "bg-amber-600"
                              }`}
                            />
                          </div>
                        </div>

                        {/* View Details Button */}
                        <button 
                          onClick={() => {
                            navigate(`/alerts/${alert.id}`);
                            onClose();
                          }}
                          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                            alert.level === "Critical" 
                              ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30" 
                              : alert.level === "High"
                              ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30"
                              : "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30"
                          }`}>
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}