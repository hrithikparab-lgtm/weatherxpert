import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { useRole, UTILITIES } from "./RoleContext";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════════════
   UTILITY CONTEXT — Global Utility Selection & Deep Linking
   ══════════════════════════════════════════════════════════════
   Manages utility context across the entire application with:
   - Landing page selection persistence
   - URL deep linking support (?utilityId=xxx)
   - Session storage for continuity
   - RBAC enforcement (Admin/Super Admin)
   - Context change events for widget refresh
   ══════════════════════════════════════════════════════════════ */

export interface UtilityContextData {
  id: string;
  name: string;
  logo?: string;
}

interface UtilityContextType {
  /** Current utility context - can be 'all' or specific utility ID */
  selectedUtility: UtilityContextData | null;
  /** Set utility context and persist to session */
  setUtilityContext: (utility: UtilityContextData | null) => void;
  /** Check if viewing "All Utilities" */
  isAllUtilitiesView: boolean;
  /** Get utility context from URL param (for deep linking) */
  getUtilityFromUrl: () => string | null;
  /** Set utility context from landing page selection */
  setFromLanding: (utility: UtilityContextData) => void;
  /** Clear context (logout/reset) */
  clearContext: () => void;
  /** Context changed event counter (for triggering re-renders) */
  contextVersion: number;
}

const UtilityContext = createContext<UtilityContextType | null>(null);

// Session storage key
const UTILITY_SESSION_KEY = "weatherxpert_selected_utility";

// Utility ID to name mapping
const UTILITY_ID_MAP: Record<string, string> = {
  "mumbai": "Mumbai Distribution",
  "delhi": "Delhi Distribution",
  "gujarat-wind": "Renewables - Wind",
  "karnataka-solar": "Renewables - Solar",
  "rajasthan": "Mundra UMPP",
  "maithon": "Maithon Power",
};

const UTILITY_NAME_TO_ID_MAP: Record<string, string> = {
  "Mumbai Distribution": "mumbai",
  "Delhi Distribution": "delhi",
  "Renewables - Wind": "gujarat-wind",
  "Renewables - Solar": "karnataka-solar",
  "Mundra UMPP": "rajasthan",
  "Maithon Power": "maithon",
};

export function UtilityProvider({ children }: { children: ReactNode }) {
  const { user, can } = useRole();
  const [selectedUtility, setSelectedUtility] = useState<UtilityContextData | null>(null);
  const [contextVersion, setContextVersion] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(UTILITY_SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedUtility(parsed);
      } catch (e) {
        console.error("Failed to parse stored utility context:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Get utility ID from URL params
  const getUtilityFromUrl = useCallback(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("utilityId");
  }, []);

  // Set utility context with validation
  const setUtilityContext = useCallback(
    (utility: UtilityContextData | null) => {
      // RBAC validation
      if (utility && utility.id !== "all") {
        // Admin can only see assigned utilities
        if (user.role === "admin" && user.utility && user.utility !== utility.name) {
          toast.error("Access Restricted", {
            description: "You don't have access to this utility.",
          });
          return;
        }
        
        // Operator has more restricted access
        if (user.role === "operator" && user.utility && user.utility !== utility.name) {
          toast.error("Access Restricted", {
            description: "You can only view your assigned utility.",
          });
          return;
        }
      }

      // Persist to session storage
      if (utility) {
        sessionStorage.setItem(UTILITY_SESSION_KEY, JSON.stringify(utility));
      } else {
        sessionStorage.removeItem(UTILITY_SESSION_KEY);
      }

      setSelectedUtility(utility);
      setContextVersion((v) => v + 1);
    },
    [user]
  );

  // Set from landing page selection
  const setFromLanding = useCallback(
    (utility: UtilityContextData) => {
      setUtilityContext(utility);
      
      // Show subtle toast notification
      setTimeout(() => {
        toast.info(`Viewing: ${utility.name}`, {
          description: "Selected from landing page. Change utility from header.",
          duration: 6000,
        });
      }, 500);
    },
    [setUtilityContext]
  );

  // Clear context
  const clearContext = useCallback(() => {
    sessionStorage.removeItem(UTILITY_SESSION_KEY);
    setSelectedUtility(null);
    setContextVersion((v) => v + 1);
  }, []);

  // Check if viewing all utilities
  const isAllUtilitiesView = useMemo(() => {
    return selectedUtility === null || selectedUtility.id === "all";
  }, [selectedUtility]);

  const value = useMemo(
    () => ({
      selectedUtility,
      setUtilityContext,
      isAllUtilitiesView,
      getUtilityFromUrl,
      setFromLanding,
      clearContext,
      contextVersion,
    }),
    [selectedUtility, setUtilityContext, isAllUtilitiesView, getUtilityFromUrl, setFromLanding, clearContext, contextVersion]
  );

  // Don't render until initialized
  if (!isInitialized) {
    return null;
  }

  return <UtilityContext.Provider value={value}>{children}</UtilityContext.Provider>;
}

export function useUtilityContext() {
  const ctx = useContext(UtilityContext);
  if (!ctx) {
    throw new Error("useUtilityContext must be used within UtilityProvider");
  }
  return ctx;
}

// Helper function to convert utility ID to name
export function getUtilityNameFromId(id: string): string {
  return UTILITY_ID_MAP[id] || id;
}

// Helper function to convert utility name to ID
export function getUtilityIdFromName(name: string): string {
  return UTILITY_NAME_TO_ID_MAP[name] || name.toLowerCase().replace(/\s+/g, "-");
}
