import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAlertManagement } from "../AlertManagementContext";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

/* ═══════════════════════════════════════════════════
   NOTIFICATION BELL COMPONENT
   Animated bell that navigates to alerts page
   ═══════════════════════════════════════════════════ */

interface NotificationBellProps {
  onClick?: () => void;
  alertCounts?: {
    total: number;
    highestSeverity: string;
  };
}

export function NotificationBell({ onClick, alertCounts: externalAlertCounts }: NotificationBellProps = {}) {
  const { newAlertCount, markAlertsAsRead } = useAlertManagement();
  const [shouldShake, setShouldShake] = useState(false);
  const navigate = useNavigate();

  const hasNewAlerts = newAlertCount > 0;

  // Trigger shake animation when new alerts arrive
  useEffect(() => {
    if (hasNewAlerts) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [newAlertCount, hasNewAlerts]);

  const handleBellClick = () => {
    if (hasNewAlerts) {
      markAlertsAsRead();
    }
    if (onClick) {
      onClick();
    }
    // Navigate directly to alerts page
    navigate("/alerts");
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        onClick={handleBellClick}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        animate={shouldShake ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge Counter */}
        {hasNewAlerts && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-white">
              {newAlertCount > 9 ? "9+" : newAlertCount}
            </span>
          </motion.div>
        )}

        {/* Glow Effect */}
        {hasNewAlerts && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-red-500/20"
            animate={{ opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  );
}