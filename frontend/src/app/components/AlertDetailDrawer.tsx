import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import React from "react";
import {
  X,
  MapPin,
  Clock,
  Wind,
  Map,
  TrendingUp,
  AlertCircle,
  Droplets,
  CloudRain,
  Zap,
  Sun,
  CloudLightning,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   ALERT DETAIL DRAWER — Universal Alert Details View
   Premium iOS-inspired glassmorphism design
   Can be used across all pages
   ═══════════════════════════════════════════════════ */

// Alert severity type
type Severity = "critical" | "high" | "medium" | "low";

// Alert interface - compatible with all pages
export interface AlertDetail {
  id: string;
  title: string;
  utility: string;
  provider: string;
  severity: Severity;
  status: string;
  location: string;
  // Forecast specific
  expectedTriggerTime?: string;
  probability?: string;
  predictedValue?: string;
  thresholdValue?: string;
  // History specific
  triggeredTime?: string;
  resolvedTime?: string;
  duration?: string;
  observedValue?: string;
  // Additional fields for details view
  receivedTime?: string;
  basedOn?: string;
  forecastedConditions?: { parameter: string; value: string; icon?: string }[];
  createdBy?: { name: string; initials: string };
  startTime?: string;
  locationTime?: string;
  isInternal?: boolean; // true if created internally, false if from provider
}

interface AlertDetailDrawerProps {
  alert: AlertDetail | null;
  isOpen: boolean;
  onClose: () => void;
  isForecast?: boolean;
}

// Severity configuration matching the design
const SEVERITY_CONFIG: Record<
  Severity,
  { color: string; bg: string; label: string; borderColor: string }
> = {
  critical: {
    color: "#ef4444",
    bg: "rgba(254, 242, 242, 0.95)",
    label: "CRITICAL",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  high: {
    color: "#f97316",
    bg: "rgba(255, 247, 237, 0.95)",
    label: "HIGH",
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  medium: {
    color: "#f59e0b",
    bg: "rgba(255, 251, 235, 0.95)",
    label: "MEDIUM",
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  low: {
    color: "#10b981",
    bg: "rgba(240, 253, 244, 0.95)",
    label: "LOW",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
};

// Icon mapping for forecasted conditions
const CONDITION_ICONS: Record<string, typeof Wind> = {
  "Wind Speed": Wind,
  "Rainfall": Droplets,
  "Temperature": Sun,
  "Humidity": CloudRain,
  "Pressure": Zap,
  "Thunderstorm": CloudLightning,
};

export function AlertDetailDrawer({
  alert,
  isOpen,
  onClose,
  isForecast = true,
}: AlertDetailDrawerProps) {
  const navigate = useNavigate();

  // Keyboard support - ESC to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!alert || !isOpen) return null;

  const severityConfig = SEVERITY_CONFIG[alert.severity];

  // Navigation handlers
  const handleViewOnMap = () => {
    // Navigate to map page with alert location
    navigate(`/map?location=${encodeURIComponent(alert.location)}&alert=${alert.id}`);
    onClose();
  };

  const handleViewWeatherTrend = () => {
    // Navigate to weather trend (forecast) page
    // If external provider, pass provider parameter
    if (!alert.isInternal && alert.provider) {
      const providerParam = alert.provider.toLowerCase().replace(/\./g, "");
      navigate(`/forecast?tab=hourly&provider=${providerParam}`);
    } else {
      navigate("/forecast?tab=hourly");
    }
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[9998]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full md:w-[650px] bg-white shadow-2xl z-[9999] overflow-y-auto"
            style={{
              borderLeft: "1px solid rgba(0, 0, 0, 0.08)",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent click through
          >
            {/* Header - Close Button */}
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 px-6 py-5 flex items-center justify-between border-b border-black/5">
              <h1 className="text-[20px] font-bold text-black">Alert Details</h1>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/5 rounded-lg transition-all duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-black/60 hover:text-black" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-8 space-y-6">
              {/* Status Badges */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-center gap-2.5 pt-2"
              >
                {/* Predicted/Historical Badge */}
                <div
                  className="px-3.5 py-2 rounded-lg backdrop-blur-sm border"
                  style={{
                    backgroundColor: "rgba(241, 245, 249, 0.95)",
                    borderColor: "rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-black/70">
                    {isForecast ? "Predicted" : "Historical"}
                  </span>
                </div>

                {/* Severity Badge */}
                <div
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold uppercase tracking-wide text-[11px] border"
                  style={{
                    backgroundColor: severityConfig.bg,
                    color: severityConfig.color,
                    borderColor: severityConfig.borderColor,
                  }}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {severityConfig.label}
                </div>
              </motion.div>

              {/* Alert Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="text-[26px] font-bold text-black leading-tight pr-4"
              >
                {alert.title}
              </motion.h2>

              {/* Received Time */}
              {alert.receivedTime && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-[15px] text-black/50 font-medium"
                >
                  Received: {alert.receivedTime}
                </motion.div>
              )}

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="flex items-center gap-2.5 text-black/80"
              >
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span className="text-[16px] font-medium">{alert.location}</span>
              </motion.div>

              {/* Start Time */}
              {alert.startTime && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-black/80" />
                    <div className="flex-1">
                      <p className="text-[16px] text-black font-medium leading-relaxed">
                        {alert.startTime}
                      </p>
                      {alert.locationTime && (
                        <p className="text-[14px] text-black/50 mt-1 font-medium">
                          {alert.locationTime}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Based On Section */}
              {alert.basedOn && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  className="space-y-3 pt-3"
                >
                  <h3 className="text-[12px] font-bold text-black/50 uppercase tracking-wider">
                    Based on
                  </h3>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: severityConfig.color }}
                    />
                    <span className="text-[16px] text-black font-medium">
                      {alert.basedOn}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Forecasted Conditions Section */}
              {alert.forecastedConditions && alert.forecastedConditions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="space-y-3 pt-3"
                >
                  <h3 className="text-[12px] font-bold text-black/50 uppercase tracking-wider">
                    Forecasted Conditions
                  </h3>
                  <div className="space-y-2.5">
                    {alert.forecastedConditions.map((condition, index) => {
                      const ConditionIcon =
                        CONDITION_ICONS[condition.parameter] || Wind;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3.5 px-4 rounded-xl backdrop-blur-sm border"
                          style={{
                            backgroundColor: "rgba(241, 245, 249, 0.8)",
                            borderColor: "rgba(0, 0, 0, 0.08)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <ConditionIcon className="w-4.5 h-4.5 text-black/60" />
                            <span className="text-[15px] text-black/70 font-medium">
                              {condition.parameter}
                            </span>
                          </div>
                          <span className="text-[17px] font-bold text-black">
                            {condition.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Predicted/Observed Value Cards */}
              {(alert.predictedValue || alert.observedValue) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.3 }}
                  className="grid grid-cols-2 gap-3 pt-2"
                >
                  {(alert.predictedValue || alert.observedValue) && (
                    <div
                      className="rounded-xl p-4 border"
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.05)",
                        borderColor: "rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      <div className="text-[11px] text-red-400 font-bold uppercase tracking-wider mb-2">
                        {isForecast ? "Predicted" : "Observed"}
                      </div>
                      <div className="text-[16px] font-black text-red-400 break-words">
                        {isForecast ? alert.predictedValue : alert.observedValue}
                      </div>
                    </div>
                  )}
                  {alert.thresholdValue && (
                    <div
                      className="rounded-xl p-4 border"
                      style={{
                        backgroundColor: "rgba(59, 130, 246, 0.05)",
                        borderColor: "rgba(59, 130, 246, 0.2)",
                      }}
                    >
                      <div className="text-[11px] text-blue-400 font-bold uppercase tracking-wider mb-2">
                        Threshold
                      </div>
                      <div className="text-[16px] font-black text-blue-400 break-words">
                        {alert.thresholdValue}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Created By / Provided by Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.3 }}
                className="space-y-3 pt-3"
              >
                <h3 className="text-[12px] font-bold text-black/50 uppercase tracking-wider">
                  {alert.isInternal ? "Created By" : "Provided by"}
                </h3>
                {alert.isInternal && alert.createdBy ? (
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: "rgba(147, 51, 234, 0.9)",
                      }}
                    >
                      <span className="text-[15px] font-bold text-white">
                        {alert.createdBy.initials}
                      </span>
                    </div>
                    <span className="text-[17px] text-black font-semibold">
                      {alert.createdBy.name}
                    </span>
                  </div>
                ) : (
                  <div className="text-[17px] text-black font-semibold">
                    {alert.provider}
                  </div>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="grid grid-cols-2 gap-3.5 pt-6"
              >
                <button
                  onClick={handleViewOnMap}
                  className="group flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl font-semibold text-[15px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: "rgba(241, 245, 249, 0.9)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    color: "#1e293b",
                  }}
                >
                  <Map className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                  View on Map
                </button>
                <button
                  onClick={handleViewWeatherTrend}
                  className="group flex items-center justify-center gap-2.5 px-5 py-4 rounded-xl font-semibold text-[15px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: "rgba(241, 245, 249, 0.9)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    color: "#1e293b",
                  }}
                >
                  <TrendingUp className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                  Weather Trend
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}