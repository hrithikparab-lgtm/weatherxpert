import { createPortal } from "react-dom";
import { X, AlertCircle, MapPin, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";

/* ═══════════════════════════════════════════════════
   GLOBAL ALERTS PANEL COMPONENT
   Side sheet panel for displaying active alerts
   ═══════════════════════════════════════════════════ */

interface Alert {
  id: string;
  title: string;
  severity: "critical" | "warning" | "info";
  time: string;
  utility: string;
  location?: string;
}

interface GlobalAlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
}

export function GlobalAlertsPanel({ isOpen, onClose, alerts, onAlertClick }: GlobalAlertsPanelProps) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    onClose();
    navigate("/alerts");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50";
      case "warning":
        return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50";
      case "info":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50";
      default:
        return "text-slate-600 bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-900/50";
    }
  };

  const formatTime = (timeStr: string) => {
    // If it's already in relative format (e.g., "2m ago"), return as is
    if (timeStr.includes("ago") || timeStr.includes("now")) {
      return timeStr;
    }
    
    // Otherwise, try to parse as ISO date
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
      return timeStr;
    }
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Side Sheet Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white/95 dark:bg-[#1a1f2e]/95 backdrop-blur-2xl shadow-2xl z-[9999] overflow-hidden border-l border-slate-200/50 dark:border-white/10"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-white/95 to-white/80 dark:from-[#1a1f2e]/95 dark:to-[#1a1f2e]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Global Alerts
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {alerts.length} active {alerts.length === 1 ? "alert" : "alerts"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Alert List */}
            <div className="overflow-y-auto h-[calc(100vh-140px)] px-6 py-4 space-y-3 custom-scrollbar">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                    No Active Alerts
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    All systems operating normally
                  </p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      if (onAlertClick) {
                        onAlertClick(alert);
                      }
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all group ${getSeverityColor(
                      alert.severity
                    )} hover:shadow-lg`}
                  >
                    {/* Severity & Time */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          alert.severity === "critical"
                            ? "bg-red-500 text-white border-red-600"
                            : alert.severity === "warning"
                            ? "bg-amber-500 text-white border-amber-600"
                            : "bg-blue-500 text-white border-blue-600"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatTime(alert.time)}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-100">
                      {alert.title}
                    </h3>

                    {/* Location & Utility */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3 h-3" />
                        <span className="font-medium">{alert.utility}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-t from-white/95 to-white/80 dark:from-[#1a1f2e]/95 dark:to-[#1a1f2e]/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/10 px-6 py-4">
              <button
                onClick={handleViewAll}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                View All Alerts
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
