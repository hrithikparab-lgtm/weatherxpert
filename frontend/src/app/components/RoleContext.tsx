import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

/* ══════════════════════════════════════════════
   ROLE SYSTEM — AUTO-DETECTED, NEVER MANUAL
   ══════════════════════════════════════════════
   - User "logs in" once (simulated).
   - System auto-detects Role + Utility.
   - Super Admin → Master Home (all utilities)
   - Admin / Operator → Utility-specific Home
   - Same UI shell; visibility & actions change.
   - Inaccessible pages are HIDDEN, never disabled.
*/

export type UserRole = "superadmin" | "admin" | "operator";

export interface UserInfo {
  id: string;
  name: string;
  initials: string;
  title: string;
  role: UserRole;
  utility: string | null; // null = all utilities (Super Admin)
  email: string;
}

export type Permission =
  | "view_dashboard"
  | "view_alerts"
  | "view_forecast"
  | "view_map"
  | "view_reports"
  | "view_settings"
  | "view_users"
  | "view_api_config"
  | "configure_alerts"
  | "create_alerts"
  | "modify_alerts"
  | "delete_alerts"
  | "export"
  | "edit"
  | "manage_users"
  | "switch_utility"
  | "view_master_home"
  | "view_accuracy"
  | "view_upload"
  | "view_report_builder"
  | "schedule_reports";

const rolePermissions: Record<UserRole, Set<Permission>> = {
  superadmin: new Set([
    "view_dashboard",
    "view_alerts",
    "view_forecast",
    "view_map",
    "view_reports",
    "view_settings",
    "view_users",
    "view_api_config",
    "configure_alerts",
    "create_alerts",
    "modify_alerts",
    "delete_alerts",
    "export",
    "edit",
    "manage_users",
    "switch_utility",
    "view_master_home",
    "view_accuracy",
    "view_upload",
    "view_report_builder",
    "schedule_reports",
  ]),
  admin: new Set([
    "view_dashboard",
    "view_alerts",
    "view_forecast",
    "view_map",
    "view_reports",
    "view_settings",
    "configure_alerts",
    "create_alerts",
    "modify_alerts",
    "delete_alerts",
    "export",
    "edit",
    "view_accuracy",
    "view_upload",
    "view_report_builder",
    "schedule_reports",
  ]),
  operator: new Set([
    "view_dashboard",
    "view_alerts",
    "view_forecast",
    "view_map",
    "view_reports",
    "view_report_builder",
    "create_alerts",
    "modify_alerts",
  ]),
};

// Simulated user accounts — system auto-detects on "login"
const userAccounts: Record<UserRole, UserInfo> = {
  superadmin: {
    id: "usr-001",
    name: "Rajesh Kumar",
    initials: "RK",
    title: "Super Admin",
    role: "superadmin",
    utility: null, // sees all utilities
    email: "rajesh.k@tatapower.com",
  },
  admin: {
    id: "usr-002",
    name: "Priya Sharma",
    initials: "PS",
    title: "Operations Admin",
    role: "admin",
    utility: "Mumbai Distribution",
    email: "priya.s@tatapower.com",
  },
  operator: {
    id: "usr-003",
    name: "Amit Patel",
    initials: "AP",
    title: "Field Operator",
    role: "operator",
    utility: "Mumbai Distribution",
    email: "amit.p@tatapower.com",
  },
};

// All available utilities
export const UTILITIES = [
  "Mumbai Distribution",
  "Delhi Distribution",
  "Renewables - Solar",
  "Renewables - Wind",
  "Mundra UMPP",
  "Maithon Power",
] as const;

interface RoleContextType {
  user: UserInfo;
  /** Check if current user has a specific permission */
  can: (action: Permission) => boolean;
  /** Switch simulated user account (demo only) */
  switchAccount: (role: UserRole) => void;
  /** Active utility context — for Super Admin this is switchable */
  activeUtility: string;
  /** Change active utility (Super Admin only) */
  setActiveUtility: (utility: string) => void;
  /** Get the home route for the current user */
  homeRoute: string;
  /** Auth state */
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("superadmin");
  const [utilityOverride, setUtilityOverride] = useState<string>("Mumbai Distribution");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on mount
  useMemo(() => {
    setIsInitialized(true);
  }, []);

  const user = useMemo(() => userAccounts[currentRole], [currentRole]);

  const can = useCallback(
    (action: Permission) => rolePermissions[currentRole].has(action),
    [currentRole]
  );

  const switchAccount = useCallback((role: UserRole) => {
    setCurrentRole(role);
    // Reset utility to user's assigned utility or first available
    const newUser = userAccounts[role];
    setUtilityOverride(newUser.utility || "Mumbai Distribution");
  }, []);

  const login = useCallback((role: UserRole) => {
    switchAccount(role);
    setIsAuthenticated(true);
  }, [switchAccount]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const activeUtility = useMemo(() => {
    // Super Admin can switch; others see their assigned utility
    if (user.role === "superadmin") return utilityOverride;
    return user.utility || "Mumbai Distribution";
  }, [user, utilityOverride]);

  const setActiveUtility = useCallback(
    (utility: string) => {
      if (can("switch_utility")) {
        setUtilityOverride(utility);
      }
    },
    [can]
  );

  const homeRoute = useMemo(() => {
    return "/dashboard";
  }, []);

  const value = useMemo(
    () => ({ user, can, switchAccount, activeUtility, setActiveUtility, homeRoute, isAuthenticated, login, logout }),
    [user, can, switchAccount, activeUtility, setActiveUtility, homeRoute, isAuthenticated, login, logout]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    // During hot reload, context might be temporarily null
    // Provide a graceful error message
    console.error("useRole must be used within RoleProvider");
    throw new Error("useRole must be used within RoleProvider");
  }
  return ctx;
}