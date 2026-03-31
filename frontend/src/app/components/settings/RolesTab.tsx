import { useState, useMemo } from "react";
import { Shield, Lock, Check, X, Info, Save, RotateCcw, Clock, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   RBAC PERMISSION MANAGEMENT — Controlled Matrix
   Fixed core roles · Toggle permissions · Audit trail
   Super Admin locked · Dynamic page visibility
   ═══════════════════════════════════════════════════ */

// ── Core Role IDs (Non-deletable) ──
type CoreRoleId = "super_admin" | "admin" | "operator";

// ── Module Permission Structure ──
interface ModulePermissions {
  view: boolean;
  edit: boolean;
  export: boolean;
  configure: boolean;
}

// ── All Modules in WeatherXpert ──
type ModuleName = 
  | "command_center" 
  | "dashboard" 
  | "climate_intelligence" 
  | "analytics" 
  | "reports" 
  | "alerts" 
  | "settings";

// ── Role Permission Matrix ──
interface RolePermissionMatrix {
  command_center: ModulePermissions;
  dashboard: ModulePermissions;
  climate_intelligence: ModulePermissions;
  analytics: ModulePermissions;
  reports: ModulePermissions;
  alerts: ModulePermissions;
  settings: ModulePermissions;
}

// ── Role Definition ──
interface Role {
  id: CoreRoleId;
  name: string;
  description: string;
  userCount: number;
  isLocked: boolean;
  permissions: RolePermissionMatrix;
}

// ── Audit Log Entry ──
interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  role: string;
  module: string;
  permission: string;
  oldValue: boolean;
  newValue: boolean;
}

// ── Module Display Labels ──
const MODULE_LABELS: Record<ModuleName, string> = {
  command_center: "Command Center",
  dashboard: "Dashboard",
  climate_intelligence: "Weather Trend",
  analytics: "Analytics",
  reports: "Reports",
  alerts: "Alerts",
  settings: "Settings",
};

// ── Permission Type Labels ──
const PERMISSION_LABELS = {
  view: "View",
  edit: "Edit",
  export: "Export",
  configure: "Configure",
};

// ── Initial Role Permissions (Default State) ──
const INITIAL_ROLES: Role[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access across all modules and utilities. Cannot be modified.",
    userCount: 1,
    isLocked: true,
    permissions: {
      command_center: { view: true, edit: true, export: true, configure: true },
      dashboard: { view: true, edit: true, export: true, configure: true },
      climate_intelligence: { view: true, edit: true, export: true, configure: true },
      analytics: { view: true, edit: true, export: true, configure: true },
      reports: { view: true, edit: true, export: true, configure: true },
      alerts: { view: true, edit: true, export: true, configure: true },
      settings: { view: true, edit: true, export: true, configure: true },
    },
  },
  {
    id: "admin",
    name: "Admin",
    description: "Utility-scoped administrator with configuration rights (except system-level settings).",
    userCount: 3,
    isLocked: false,
    permissions: {
      command_center: { view: true, edit: true, export: true, configure: false },
      dashboard: { view: true, edit: true, export: true, configure: false },
      climate_intelligence: { view: true, edit: true, export: true, configure: false },
      analytics: { view: true, edit: true, export: true, configure: false },
      reports: { view: true, edit: true, export: true, configure: false },
      alerts: { view: true, edit: true, export: true, configure: true },
      settings: { view: true, edit: false, export: false, configure: false },
    },
  },
  {
    id: "operator",
    name: "Operator",
    description: "View-only access to monitoring dashboards and operational data.",
    userCount: 3,
    isLocked: false,
    permissions: {
      command_center: { view: true, edit: false, export: false, configure: false },
      dashboard: { view: true, edit: false, export: false, configure: false },
      climate_intelligence: { view: true, edit: false, export: false, configure: false },
      analytics: { view: false, edit: false, export: false, configure: false },
      reports: { view: true, edit: false, export: false, configure: false },
      alerts: { view: true, edit: false, export: false, configure: false },
      settings: { view: false, edit: false, export: false, configure: false },
    },
  },
];

interface RolesTabProps { 
  isMobile: boolean; 
}

export function RolesTab({ isMobile }: RolesTabProps) {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [activeRoleTab, setActiveRoleTab] = useState<CoreRoleId>("admin");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  // Get active role data
  const activeRole = useMemo(() => {
    return roles.find(r => r.id === activeRoleTab);
  }, [roles, activeRoleTab]);

  // Check if permission can be toggled (safeguard logic)
  const canTogglePermission = (
    roleId: CoreRoleId, 
    module: ModuleName, 
    permType: keyof ModulePermissions
  ): { allowed: boolean; reason?: string } => {
    // Super Admin is always locked
    if (roleId === "super_admin") {
      return { allowed: false, reason: "Super Admin permissions cannot be modified" };
    }

    // Prevent Admin from gaining system-level configure rights
    if (roleId === "admin" && permType === "configure") {
      if (module === "command_center" || module === "dashboard" || module === "settings") {
        return { 
          allowed: false, 
          reason: "Admin cannot have Configure rights for system-level settings" 
        };
      }
    }

    // Prevent Operator from getting escalation privileges
    if (roleId === "operator" && permType === "configure") {
      return { 
        allowed: false, 
        reason: "Operator cannot have Configure rights (escalation prevention)" 
      };
    }

    // Dependency: Can't have Edit/Export/Configure without View
    if (permType !== "view") {
      const role = roles.find(r => r.id === roleId);
      if (role && !role.permissions[module].view) {
        return { 
          allowed: false, 
          reason: "View permission required first" 
        };
      }
    }

    return { allowed: true };
  };

  // Toggle permission handler
  const handleTogglePermission = (
    module: ModuleName,
    permType: keyof ModulePermissions
  ) => {
    if (!activeRole) return;

    const check = canTogglePermission(activeRole.id, module, permType);
    if (!check.allowed) {
      toast.error("Permission Denied", {
        description: check.reason,
        duration: 3000,
      });
      return;
    }

    const currentValue = activeRole.permissions[module][permType];
    const newValue = !currentValue;

    // If disabling View, also disable all dependent permissions
    if (permType === "view" && newValue === false) {
      setRoles(prev =>
        prev.map(r =>
          r.id === activeRole.id
            ? {
                ...r,
                permissions: {
                  ...r.permissions,
                  [module]: {
                    view: false,
                    edit: false,
                    export: false,
                    configure: false,
                  },
                },
              }
            : r
        )
      );
    } else {
      setRoles(prev =>
        prev.map(r =>
          r.id === activeRole.id
            ? {
                ...r,
                permissions: {
                  ...r.permissions,
                  [module]: {
                    ...r.permissions[module],
                    [permType]: newValue,
                  },
                },
              }
            : r
        )
      );
    }

    setHasUnsavedChanges(true);

    // Add to audit log
    const auditEntry: AuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toLocaleString("en-IN"),
      user: "Rajesh Kumar", // Would come from auth context
      action: "Permission Modified",
      role: activeRole.name,
      module: MODULE_LABELS[module],
      permission: PERMISSION_LABELS[permType],
      oldValue: currentValue,
      newValue: newValue,
    };
    setAuditLog(prev => [auditEntry, ...prev].slice(0, 50)); // Keep last 50 entries
  };

  // Save changes
  const handleSave = () => {
    toast.success("Permissions saved successfully", {
      description: `${activeRole?.name} role permissions have been updated`,
      duration: 3000,
    });
    setHasUnsavedChanges(false);
  };

  // Reset to defaults
  const handleReset = () => {
    const defaultRole = INITIAL_ROLES.find(r => r.id === activeRoleTab);
    if (defaultRole) {
      setRoles(prev =>
        prev.map(r => (r.id === activeRoleTab ? { ...defaultRole } : r))
      );
      setHasUnsavedChanges(false);
      toast.info("Permissions reset to defaults", {
        description: `${activeRole?.name} role restored to original state`,
        duration: 2500,
      });
    }
  };

  if (!activeRole) return null;

  return (
    <div className="space-y-6">
      {/* ═══ Role Tabs ═══ */}
      <div className="flex flex-wrap items-center gap-2">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => {
              if (hasUnsavedChanges) {
                toast.warning("Unsaved changes", {
                  description: "Save or reset changes before switching roles",
                  duration: 2500,
                });
                return;
              }
              setActiveRoleTab(role.id);
            }}
            className={`group relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeRoleTab === role.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-white/50 dark:bg-black/20 text-muted-foreground hover:text-foreground hover:bg-white/70 dark:hover:bg-white/10 border border-black/5 dark:border-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>{role.name}</span>
              {role.isLocked && (
                <Lock className="w-3 h-3 opacity-50" />
              )}
              {role.id === activeRoleTab && !role.isLocked && hasUnsavedChanges && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ═══ Role Info Banner ═══ */}
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              activeRole.isLocked 
                ? "bg-gray-500/10 text-gray-600 dark:text-gray-400" 
                : "bg-primary/10 text-primary"
            }`}>
              {activeRole.isLocked ? <Lock className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{activeRole.name}</h3>
                {activeRole.isLocked && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/20 text-[9px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{activeRole.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {activeRole.userCount} user{activeRole.userCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save/Reset buttons */}
          {!activeRole.isLocked && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                disabled={!hasUnsavedChanges}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  hasUnsavedChanges
                    ? "bg-white/50 dark:bg-white/10 text-muted-foreground hover:text-foreground hover:bg-white/70 dark:hover:bg-white/20 border border-black/5 dark:border-white/10"
                    : "bg-secondary/30 text-muted-foreground/40 cursor-not-allowed"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  hasUnsavedChanges
                    ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg active:scale-95"
                    : "bg-secondary/30 text-muted-foreground/40 cursor-not-allowed"
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Permission Matrix ═══ */}
      {activeRole.isLocked ? (
        // Locked view for Super Admin
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden">
          <div className="px-6 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-500/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Super Admin Permissions Are Locked
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              This role has full access to all modules and cannot be modified to ensure platform stability and security.
              All permissions are permanently enabled.
            </p>
          </div>
        </div>
      ) : isMobile ? (
        // Mobile: Collapsible cards
        <div className="space-y-3">
          {(Object.keys(activeRole.permissions) as ModuleName[]).map(module => (
            <div
              key={module}
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden"
            >
              <div className="px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10">
                <h5 className="text-xs font-semibold text-foreground">
                  {MODULE_LABELS[module]}
                </h5>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                {(Object.keys(activeRole.permissions[module]) as Array<keyof ModulePermissions>).map(permType => {
                  const isEnabled = activeRole.permissions[module][permType];
                  const check = canTogglePermission(activeRole.id, module, permType);
                  const isDisabled = !check.allowed;

                  return (
                    <div key={permType} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-foreground">{PERMISSION_LABELS[permType]}</span>
                        {isDisabled && (
                          <Lock className="w-3 h-3 text-muted-foreground/30" />
                        )}
                      </div>
                      <button
                        onClick={() => !isDisabled && handleTogglePermission(module, permType)}
                        disabled={isDisabled}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          isEnabled
                            ? "bg-emerald-500"
                            : "bg-gray-300 dark:bg-gray-700"
                        } ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                        title={!check.allowed ? check.reason : undefined}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            isEnabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop: Matrix grid
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10">
                  <th className="text-left px-6 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider w-1/4">
                    Module
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider w-[18.75%]">
                    View
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider w-[18.75%]">
                    Edit
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider w-[18.75%]">
                    Export
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider w-[18.75%]">
                    Configure
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {(Object.keys(activeRole.permissions) as ModuleName[]).map(module => (
                  <tr key={module} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-xs text-foreground font-medium">
                      {MODULE_LABELS[module]}
                    </td>
                    {(Object.keys(activeRole.permissions[module]) as Array<keyof ModulePermissions>).map(permType => {
                      const isEnabled = activeRole.permissions[module][permType];
                      const check = canTogglePermission(activeRole.id, module, permType);
                      const isDisabled = !check.allowed;

                      return (
                        <td key={permType} className="text-center px-4 py-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => !isDisabled && handleTogglePermission(module, permType)}
                              disabled={isDisabled}
                              className={`group relative inline-flex h-5 w-9 items-center rounded-full transition-all ${
                                isEnabled
                                  ? "bg-emerald-500 hover:bg-emerald-600"
                                  : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                              } ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                              title={!check.allowed ? check.reason : undefined}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                                  isEnabled ? "translate-x-5" : "translate-x-0.5"
                                }`}
                              />
                              {isDisabled && (
                                <Lock className="absolute -top-1 -right-1 w-3 h-3 text-muted-foreground/50" />
                              )}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ Utility-Based Access Control Info ═══ */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Utility-Scoped Access Control Model</h4>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Super Admin */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <h5 className="text-[11px] font-bold text-purple-700 dark:text-purple-300">Super Admin</h5>
            </div>
            <ul className="space-y-1 text-[10px] text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Access <strong>all utilities</strong></span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Configure permission matrix</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Create Admin & Operator users</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Assign users to utilities</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Global system configuration</span>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <h5 className="text-[11px] font-bold text-blue-700 dark:text-blue-300">Admin (Utility-Scoped)</h5>
            </div>
            <ul className="space-y-1 text-[10px] text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Access <strong>assigned utility only</strong></span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Create Operators for utility</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Manage utility dashboards</span>
              </li>
              <li className="flex items-start gap-1.5">
                <X className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Cannot modify role matrix</span>
              </li>
              <li className="flex items-start gap-1.5">
                <X className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Cannot access other utilities</span>
              </li>
            </ul>
          </div>

          {/* Operator */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Operator (View-Only)</h5>
            </div>
            <ul className="space-y-1 text-[10px] text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>View <strong>assigned utility only</strong></span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Acknowledge alerts (if enabled)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Generate preview reports</span>
              </li>
              <li className="flex items-start gap-1.5">
                <X className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Cannot manage users</span>
              </li>
              <li className="flex items-start gap-1.5">
                <X className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Cannot modify any settings</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="px-5 py-3 bg-indigo-500/5 border-t border-indigo-500/20">
          <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 font-medium">
            <Lock className="w-3 h-3 inline mr-1" />
            <strong>Data Scoping Rule:</strong> All Admin & Operator queries are automatically filtered by <code className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded text-[9px] font-mono">WHERE utility_id = assigned_utility_id</code>
          </p>
        </div>
      </div>

      {/* ═══ Safeguards Info ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mb-1">
              Permission Dependencies
            </p>
            <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80">
              View permission is required before enabling Edit, Export, or Configure. Disabling View will automatically disable all dependent permissions.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mb-1">
              Privilege Escalation Protection
            </p>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
              Admin cannot have Configure rights for system settings. Operator cannot have Configure rights for any module.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Recent Audit Log ═══ */}
      {auditLog.length > 0 && (
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden">
          <div className="px-5 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-semibold text-foreground">Recent Permission Changes</h4>
            </div>
            <span className="text-[10px] text-muted-foreground">Last {auditLog.length} changes</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {auditLog.map(entry => (
              <div
                key={entry.id}
                className="px-5 py-3 border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground font-medium">
                      <span className="font-semibold">{entry.role}</span> · {entry.module} · {entry.permission}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                        entry.oldValue 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {entry.oldValue ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        {entry.oldValue ? "ON" : "OFF"}
                      </span>
                      <span className="text-[9px] text-muted-foreground">→</span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                        entry.newValue 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {entry.newValue ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        {entry.newValue ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[9px] text-muted-foreground">{entry.user}</p>
                    <p className="text-[9px] text-muted-foreground/60">{entry.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}