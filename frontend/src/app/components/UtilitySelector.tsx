import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check, Building2, Zap } from "lucide-react";
import { useUtilityContext } from "./UtilityContext";
import { useRole, UTILITIES } from "./RoleContext";

/* ══════════════════════════════════════════════════════════════
   UTILITY SELECTOR — Header Dropdown Component
   ══════════════════════════════════════════════════════════════
   Premium iOS-inspired utility selector for global context switching
   - Shows current utility with logo + name
   - Dropdown with glassmorphism effect
   - RBAC enforcement (Admin sees assigned utilities only)
   - "All Utilities" option for Super Admin
   ══════════════════════════════════════════════════════════════ */

export function UtilitySelector() {
  const { selectedUtility, setUtilityContext, isAllUtilitiesView } = useUtilityContext();
  const { user, can } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get available utilities based on role
  const availableUtilities = (() => {
    // All roles can see "All Utilities" option
    const baseUtilities = ["all", ...UTILITIES];
    
    if (user.role === "superadmin") {
      return baseUtilities;
    }
    if (user.role === "admin" && user.utility) {
      return baseUtilities;
    }
    if (user.role === "operator" && user.utility) {
      return baseUtilities;
    }
    return baseUtilities;
  })();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (utilityNameOrAll: string) => {
    if (utilityNameOrAll === "all") {
      setUtilityContext({ id: "all", name: "All Utilities" });
    } else {
      setUtilityContext({
        id: utilityNameOrAll.toLowerCase().replace(/\s+/g, "-"),
        name: utilityNameOrAll,
      });
    }
    setIsOpen(false);
  };

  // Determine display name
  const displayName = isAllUtilitiesView ? "All Utilities" : (selectedUtility?.name || "Select Utility");

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-72 z-[100]
                       bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl
                       border border-slate-200/80 dark:border-slate-700/80
                       rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40
                       overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select Utility Context
              </p>
            </div>

            {/* Options */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar py-2">
              {/* All Utilities Option - Available to all roles */}
              <button
                onClick={() => handleSelect("all")}
                className="w-full flex items-center justify-between px-4 py-3 
                           hover:bg-blue-50/80 dark:hover:bg-blue-900/20
                           transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 
                                  flex items-center justify-center shadow-sm">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      All Utilities
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Aggregated view
                    </span>
                  </div>
                </div>
                {isAllUtilitiesView && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
              <div className="mx-4 my-2 h-px bg-slate-200 dark:bg-slate-700" />

              {/* Individual Utilities */}
              {availableUtilities
                .filter((u) => u !== "all")
                .map((utilityName) => {
                  const isSelected = !isAllUtilitiesView && selectedUtility?.name === utilityName;

                  return (
                    <button
                      key={utilityName}
                      onClick={() => handleSelect(utilityName)}
                      className="w-full flex items-center justify-between px-4 py-3 
                                 hover:bg-slate-50 dark:hover:bg-slate-800/50
                                 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 
                                        dark:from-slate-700 dark:to-slate-800
                                        flex items-center justify-center shadow-sm">
                          <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {utilityName}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Footer with role info */}
            <div className="px-4 py-2.5 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center">
                {user.role === "superadmin"
                  ? "Super Admin: All utilities accessible"
                  : `${user.role === "admin" ? "Admin" : "Operator"}: ${user.utility}`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(203 213 225 / 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(148 163 184 / 0.8);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(71 85 105 / 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(100 116 139 / 0.8);
        }
      `}</style>
    </div>
  );
}