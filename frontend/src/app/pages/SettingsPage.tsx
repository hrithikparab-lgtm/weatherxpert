import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useRole } from "../components/RoleContext";
// Removed UsersTab import - merged into Utility Administration
import { RolesTab } from "../components/settings/RolesTab";
import { ProvidersTab } from "../components/settings/ProvidersTab";
import { IntegrationsTab } from "../components/settings/IntegrationsTab";
import { NotificationsTab } from "../components/settings/NotificationsTab";
import { UtilitiesTab } from "../components/settings/UtilitiesTab";
import { LinksTab } from "../components/settings/LinksTab";
import { AuditLogTab } from "../components/settings/AuditLogTab";
import { SystemHealthTab } from "../components/settings/SystemHealthTab";
import { UtilityAdministrationTab } from "../components/settings/UtilityAdministrationTab";
import { SETTINGS_TABS, type SettingsTabId, MANAGED_USERS, type ManagedUser } from "../components/settings/settingsData";
import {
  Settings,
  Users,
  Shield,
  Cloud,
  Server,
  Bell,
  Zap,
  ExternalLink,
  ScrollText,
  Activity,
  Eye,
  Lock,
  Building2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   ADMIN CONSOLE — Tabbed settings page
   9 tabs · Create/Edit modals · Audit log
   System health · Role-based previews · Sandbox
   Mobile: view-only for safety
   ═══════════════════════════════════════════════════ */

const TAB_ICONS: Record<string, React.ElementType> = {
  users: Users, shield: Shield, cloud: Cloud, server: Server,
  bell: Bell, zap: Zap, "external-link": ExternalLink,
  "scroll-text": ScrollText, activity: Activity, building: Building2,
};

export function SettingsPage() {
  const { user, can } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab state synced with URL
  const activeTab = (searchParams.get("tab") as SettingsTabId) || "utility_admin";
  const setActiveTab = (tab: SettingsTabId) => {
    setSearchParams({ tab });
  };

  // Lifted state for Users tab to persist data across tab switches
  const [users, setUsers] = useState<ManagedUser[]>(MANAGED_USERS);

  // Detect mobile (< 768px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Tabs available based on permissions
  const visibleTabs = useMemo(() => {
    return SETTINGS_TABS.filter(tab => {
      if (tab.id === "users" || tab.id === "roles" || tab.id === "audit") {
        return can("manage_users") || can("view_users");
      }
      return true;
    });
  }, [can]);

  // Reset tab if current is hidden
  useEffect(() => {
    if (!visibleTabs.find(t => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id || "providers");
    }
  }, [visibleTabs, activeTab]);

  const isViewOnly = isMobile;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* ═══ PAGE HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-center backdrop-blur-md shadow-sm">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Admin Console</h1>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              System configuration, user management, and integrations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role badge */}
          

          {/* View-only badge on mobile */}
          {isViewOnly && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full backdrop-blur-md">
              <Eye className="w-3 h-3 text-amber-500" />
              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide">View Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile safety notice */}
      {isViewOnly && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-sm">
          <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              Safety Lock Active
            </p>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-500/80 mt-0.5 leading-relaxed">
              Admin actions are restricted on mobile devices to prevent accidental changes. Please use a desktop interface to create, edit, or delete configurations.
            </p>
          </div>
        </div>
      )}

      {/* ═══ TAB BAR ═══ */}
      <div className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar border-b border-white/10 dark:border-white/5 bg-white/20 dark:bg-black/20">
          <div className="flex min-w-max p-1">
            {visibleTabs.map(tab => {
              const Icon = TAB_ICONS[tab.iconKey] || Settings;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "bg-white dark:bg-white/10 text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ TAB CONTENT ═══ */}
        <div className="p-4 md:p-6 min-h-[500px]">
          {activeTab === "users" && (
            <UtilityAdministrationTab 
              isMobile={isViewOnly} 
              users={users} 
              setUsers={setUsers} 
            />
          )}
          {activeTab === "roles" && <RolesTab isMobile={isViewOnly} />}
          {activeTab === "providers" && <ProvidersTab isMobile={isViewOnly} />}
          {activeTab === "integrations" && <IntegrationsTab isMobile={isViewOnly} />}
          {activeTab === "notifications" && <NotificationsTab isMobile={isViewOnly} />}
          {activeTab === "utilities" && <UtilitiesTab isMobile={isViewOnly} />}
          {activeTab === "links" && <LinksTab isMobile={isViewOnly} />}
          {activeTab === "audit" && <AuditLogTab />}
          {activeTab === "health" && <SystemHealthTab />}
          {activeTab === "utility_admin" && <UtilityAdministrationTab isMobile={isViewOnly} />}
        </div>
      </div>
    </div>
  );
}