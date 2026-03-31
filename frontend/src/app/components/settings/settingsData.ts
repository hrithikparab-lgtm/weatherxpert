/* ═══════════════════════════════════════════════════
   ADMIN CONSOLE — Types, mock data for all tabs
   ═══════════════════════════════════════════════════ */

// ── Tabs ──
export type SettingsTabId =
  | "users" | "roles" | "providers" | "integrations"
  | "notifications" | "utilities" | "links" | "audit" | "health"
  | "utility_admin";

export interface SettingsTabDef {
  id: SettingsTabId;
  label: string;
  shortLabel: string;
  iconKey: string;
}

export const SETTINGS_TABS: SettingsTabDef[] = [
  // Removed standalone "users" tab - now merged into Utility Administration
  { id: "roles",         label: "Roles & Permissions",  shortLabel: "Roles",       iconKey: "shield" },
  { id: "providers",     label: "Forecast Providers",   shortLabel: "Providers",   iconKey: "cloud" },
  // { id: "integrations",  label: "System Integrations",  shortLabel: "Integrations", iconKey: "server" },
  // { id: "notifications", label: "Notification Channels", shortLabel: "Notify",     iconKey: "bell" },
  // { id: "utilities",     label: "Utilities Config",     shortLabel: "Utilities",   iconKey: "zap" },
  { id: "links",         label: "External Links",       shortLabel: "Links",       iconKey: "external-link" },
  // { id: "audit",         label: "Audit Log",            shortLabel: "Audit",       iconKey: "scroll-text" },
  // { id: "health",        label: "System Health",        shortLabel: "Health",      iconKey: "activity" },
  { id: "utility_admin", label: "Utility Administration", shortLabel: "Utility",    iconKey: "building" },
];

// ═════════════════════════════════════════
// UTILITIES (for RBAC assignment)
// ═════════════════════════════════════════
export const AVAILABLE_UTILITIES = [
  { id: "all", name: "All Utilities", scope: "system" },
  { id: "mumbai", name: "Mumbai Distribution", scope: "regional" },
  { id: "delhi", name: "Delhi Distribution", scope: "regional" },
  { id: "mundra", name: "Mundra UMPP", scope: "generation" },
  { id: "renewables_solar", name: "Renewables - Solar", scope: "renewable" },
  { id: "maithon", name: "Maithon Power", scope: "generation" },
] as const;

// ═════════════════════════════════════════
// USERS
// ═════════════════════════════════════════
export type UserStatus = "active" | "invited" | "suspended";
export type CoreRoleId = "Super Admin" | "Admin" | "Operator";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: CoreRoleId;
  status: UserStatus;
  lastLogin: string;
  utility: string;
  utilityId: string; // NEW: For scoping queries
  mfa: boolean;
}

export const MANAGED_USERS: ManagedUser[] = [
  { id: "u1", name: "Rajesh Kumar",   email: "rajesh.k@tatapower.com",  role: "Super Admin", status: "active",    lastLogin: "2026-02-11 09:15", utility: "All Utilities",          utilityId: "all", mfa: true },
  { id: "u2", name: "Priya Sharma",   email: "priya.s@tatapower.com",   role: "Admin",       status: "active",    lastLogin: "2026-02-11 08:42", utility: "Mumbai Distribution",   utilityId: "mumbai", mfa: true },
  { id: "u3", name: "Amit Patel",     email: "amit.p@tatapower.com",    role: "Operator",    status: "active",    lastLogin: "2026-02-10 16:30", utility: "Mumbai Distribution",   utilityId: "mumbai", mfa: false },
  { id: "u4", name: "Neha Singh",     email: "neha.s@tatapower.com",    role: "Admin",       status: "invited",   lastLogin: "—",                utility: "Delhi Distribution",    utilityId: "delhi", mfa: false },
  { id: "u5", name: "Vikram Mehta",   email: "vikram.m@tatapower.com",  role: "Operator",    status: "active",    lastLogin: "2026-02-09 07:00", utility: "Mundra UMPP",           utilityId: "mundra", mfa: false },
  { id: "u6", name: "Sunita Reddy",   email: "sunita.r@tatapower.com",  role: "Admin",       status: "suspended", lastLogin: "2026-01-15 10:00", utility: "Renewables - Solar",    utilityId: "renewables_solar", mfa: true },
  { id: "u7", name: "Karan Joshi",    email: "karan.j@tatapower.com",   role: "Operator",    status: "active",    lastLogin: "2026-02-11 06:00", utility: "Maithon Power",         utilityId: "maithon", mfa: false },
];

// ═════════════════════════════════════════
// ROLES & PERMISSIONS
// ═════════════════════════════════════════
export interface RoleDef {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

export const PERMISSION_GROUPS = [
  { group: "Dashboard",  perms: ["view_dashboard", "edit_dashboard", "export_dashboard"] },
  { group: "Alerts",     perms: ["view_alerts", "configure_alerts", "acknowledge_alerts"] },
  { group: "Forecast",   perms: ["view_forecast", "compare_providers", "export_forecast"] },
  { group: "Map",        perms: ["view_map", "edit_layers", "add_markers"] },
  { group: "Reports",    perms: ["view_reports", "create_reports", "schedule_reports", "export_reports"] },
  { group: "Data",       perms: ["upload_data", "delete_data", "manage_templates"] },
  { group: "Admin",      perms: ["manage_users", "manage_roles", "view_audit", "system_config"] },
];

export const ROLE_DEFS: RoleDef[] = [
  { id: "r1", name: "Super Admin", description: "Full system access across all utilities", userCount: 1, isSystem: true,
    permissions: PERMISSION_GROUPS.flatMap(g => g.perms) },
  { id: "r2", name: "Admin", description: "Utility-scoped admin with configuration rights", userCount: 3, isSystem: true,
    permissions: PERMISSION_GROUPS.flatMap(g => g.perms).filter(p => !["manage_roles", "system_config"].includes(p)) },
  { id: "r3", name: "Operator", description: "View-only access to monitoring dashboards", userCount: 3, isSystem: true,
    permissions: ["view_dashboard", "view_alerts", "acknowledge_alerts", "view_forecast", "view_map"] },
  { id: "r4", name: "Analyst", description: "Custom role for data analysis team", userCount: 0, isSystem: false,
    permissions: ["view_dashboard", "view_forecast", "compare_providers", "view_reports", "export_reports", "export_forecast", "export_dashboard"] },
];

// ═════════════════════════════════════════
// FORECAST PROVIDERS
// ═════════════════════════════════════════
export type ProviderStatus = "active" | "degraded" | "offline" | "maintenance";

export interface ForecastProvider {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  apiKey: string;
  status: ProviderStatus;
  lastSync: string;
  latency: string;
  accuracy: number;
  parameters: string[];
  refreshInterval: string;
}

export const FORECAST_PROVIDERS: ForecastProvider[] = [
  { id: "fp1", name: "IMD GFS",       type: "Government",  endpoint: "https://api.imd.gov.in/gfs/v2",        apiKey: "••••••••imd_4f8a", status: "active",      lastSync: "2026-02-11 09:00", latency: "120ms",  accuracy: 87.3, parameters: ["Temperature", "Humidity", "Wind", "Rainfall"], refreshInterval: "6h" },
  { id: "fp2", name: "ECMWF IFS",     type: "International", endpoint: "https://api.ecmwf.int/v1/forecast",   apiKey: "••••••••ecm_7b2d", status: "active",      lastSync: "2026-02-11 08:45", latency: "340ms",  accuracy: 91.2, parameters: ["Temperature", "Humidity", "Wind", "Pressure", "Cloud Cover"], refreshInterval: "12h" },
  { id: "fp3", name: "AccuWeather",    type: "Commercial",  endpoint: "https://api.accuweather.com/v3",        apiKey: "••••••••acc_9e1c", status: "active",      lastSync: "2026-02-11 09:10", latency: "95ms",   accuracy: 84.8, parameters: ["Temperature", "Humidity", "Wind", "UV Index"], refreshInterval: "1h" },
  { id: "fp4", name: "Custom WRF",     type: "In-house",    endpoint: "https://wrf.internal.tatapower.com/api", apiKey: "••••••••wrf_3a5f", status: "degraded",    lastSync: "2026-02-11 07:30", latency: "1.8s",   accuracy: 89.5, parameters: ["Temperature", "Wind", "Solar Irradiance", "Rainfall"], refreshInterval: "3h" },
  { id: "fp5", name: "Open-Meteo",     type: "Open Source", endpoint: "https://api.open-meteo.com/v1/forecast", apiKey: "N/A (Public)",     status: "active",      lastSync: "2026-02-11 09:05", latency: "78ms",   accuracy: 82.1, parameters: ["Temperature", "Humidity", "Wind"], refreshInterval: "1h" },
];

// ═════════════════════════════════════════
// SYSTEM INTEGRATIONS
// ═════════════════════════════════════════
export type IntegrationStatus = "connected" | "disconnected" | "error" | "testing";

export interface SystemIntegration {
  id: string;
  name: string;
  type: "AWS" | "SCADA" | "Database" | "Cloud" | "IoT";
  description: string;
  status: IntegrationStatus;
  lastSync: string;
  config: Record<string, string>;
  healthScore: number;
}

export const SYSTEM_INTEGRATIONS: SystemIntegration[] = [
  { id: "si1", name: "AWS IoT Core",       type: "AWS",      description: "Station sensor data ingestion via MQTT",                  status: "connected",    lastSync: "2026-02-11 09:12", config: { region: "ap-south-1", thingGroup: "weather-stations", protocol: "MQTT v5" }, healthScore: 98 },
  { id: "si2", name: "AWS S3 Data Lake",    type: "AWS",      description: "Historical data archival and model training data store",   status: "connected",    lastSync: "2026-02-11 08:00", config: { bucket: "tatapower-wx-datalake", region: "ap-south-1", encryption: "AES-256" }, healthScore: 100 },
  { id: "si3", name: "SCADA Gateway",       type: "SCADA",    description: "Real-time grid operations data from SCADA/EMS",           status: "connected",    lastSync: "2026-02-11 09:14", config: { protocol: "OPC-UA", endpoint: "opc.tcp://scada.internal:4840", pollRate: "5s" }, healthScore: 95 },
  { id: "si4", name: "SCADA Historian",     type: "SCADA",    description: "PI historian for long-term operational data",              status: "error",        lastSync: "2026-02-10 22:00", config: { server: "pi-historian.internal", database: "WX_PROD", status: "Connection timeout" }, healthScore: 12 },
  { id: "si5", name: "TimescaleDB",         type: "Database",  description: "Primary time-series database for weather observations",   status: "connected",    lastSync: "2026-02-11 09:14", config: { host: "tsdb.internal:5432", database: "weatherxpert", replication: "3 nodes" }, healthScore: 99 },
  { id: "si6", name: "Campbell Scientific", type: "IoT",       description: "Direct serial interface to Campbell CR1000X dataloggers", status: "disconnected", lastSync: "2026-02-08 14:30", config: { protocol: "PakBus", stations: "16", baudRate: "115200" }, healthScore: 0 },
];

// ═════════════════════════════════════════
// NOTIFICATION CHANNELS
// ═════════════════════════════════════════
export type ChannelType = "email" | "sms" | "webhook" | "slack" | "teams";

export interface NotificationChannel {
  id: string;
  name: string;
  type: ChannelType;
  config: Record<string, string>;
  enabled: boolean;
  lastUsed: string;
  deliveryRate: number;
}

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  { id: "nc1", name: "Primary Email (SMTP)",   type: "email",   config: { host: "smtp.tatapower.com", port: "587", tls: "STARTTLS", from: "weatherxpert@tatapower.com" }, enabled: true,  lastUsed: "2026-02-11 06:00", deliveryRate: 99.2 },
  { id: "nc2", name: "SMS Gateway",            type: "sms",     config: { provider: "MSG91", apiKey: "••••msg91_key", senderId: "TATAWX", dltTemplateId: "10017xxxxx" },       enabled: true,  lastUsed: "2026-02-10 15:30", deliveryRate: 96.8 },
  { id: "nc3", name: "Ops Slack Channel",       type: "slack",   config: { workspace: "tatapower.slack.com", channel: "#wx-alerts", webhookUrl: "••••slack_hook" },            enabled: true,  lastUsed: "2026-02-11 09:00", deliveryRate: 100 },
  { id: "nc4", name: "MS Teams - Grid Ops",     type: "teams",   config: { tenant: "tatapower.onmicrosoft.com", channel: "Grid Operations", connector: "Webhook" },             enabled: false, lastUsed: "2026-01-28 10:00", deliveryRate: 94.5 },
  { id: "nc5", name: "PagerDuty Webhook",       type: "webhook", config: { url: "https://events.pagerduty.com/v2/enqueue", routingKey: "••••pd_key", severity: "critical" },   enabled: true,  lastUsed: "2026-02-09 03:45", deliveryRate: 99.9 },
];

// ═════════════════════════════════════════
// UTILITIES CONFIG
// ═════════════════════════════════════════
export const UTILITIES = [
  "Mumbai Central",
  "Mumbai East",
  "Mumbai West",
  "Renewable Energy"
];

export interface UtilityConfig {
  id: string;
  name: string;
  code: string;
  region: string;
  stations: number;
  type: "Distribution" | "Generation" | "Renewable";
  timezone: string;
  currency: string;
  active: boolean;
  contactEmail: string;
}

export const UTILITY_CONFIGS: UtilityConfig[] = [
  { id: "uc1", name: "Mumbai Distribution",  code: "TPM",  region: "Maharashtra",  stations: 5, type: "Distribution", timezone: "IST", currency: "INR", active: true,  contactEmail: "mumbai-ops@tatapower.com" },
  { id: "uc2", name: "Delhi Distribution",   code: "TPD",  region: "NCR",          stations: 4, type: "Distribution", timezone: "IST", currency: "INR", active: true,  contactEmail: "delhi-ops@tatapower.com" },
  { id: "uc3", name: "Renewables - Solar",    code: "TRS",  region: "Gujarat",      stations: 1, type: "Renewable",    timezone: "IST", currency: "INR", active: true,  contactEmail: "solar@tatapower.com" },
  { id: "uc4", name: "Renewables - Wind",     code: "TRW",  region: "Tamil Nadu",   stations: 1, type: "Renewable",    timezone: "IST", currency: "INR", active: true,  contactEmail: "wind@tatapower.com" },
  { id: "uc5", name: "Mundra UMPP",           code: "MUN",  region: "Gujarat",      stations: 2, type: "Generation",   timezone: "IST", currency: "INR", active: true,  contactEmail: "mundra@tatapower.com" },
  { id: "uc6", name: "Maithon Power",         code: "MPL",  region: "Jharkhand",    stations: 2, type: "Generation",   timezone: "IST", currency: "INR", active: true,  contactEmail: "maithon@tatapower.com" },
];

// ═════════════════════════════════════════
// EXTERNAL LINKS
// ═════════════════════════════════════════
export interface ExternalLink {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  openInNew: boolean;
  // Global Header Quick Access fields
  roleVisibility: ("super_admin" | "admin" | "operator")[];
  utilityScope?: string[]; // Optional: specific utilities (empty = all)
  priority: number; // 1-10, higher = more important
  active: boolean;
  icon?: string; // Icon name from lucide-react
}

export const EXTERNAL_LINKS: ExternalLink[] = [
  {
    id: "el-weatherex",
    name: "WeatherEx AI Map",
    url: "https://weatherex.ai/",
    category: "Weather",
    description: "AI-powered weather intelligence map with real-time layers, radar, and multi-model forecast visualization",
    openInNew: true,
    roleVisibility: ["super_admin", "admin", "operator"],
    utilityScope: [],
    priority: 10,
    active: true,
    icon: "Globe",
  },
  { 
    id: "el1", 
    name: "IMD Radar Composite", 
    url: "https://mausam.imd.gov.in/imd_latest/contents/radar.php", 
    category: "Weather", 
    description: "Real-time radar imagery from IMD", 
    openInNew: true,
    roleVisibility: ["super_admin", "admin", "operator"],
    utilityScope: [],
    priority: 9,
    active: true,
    icon: "CloudRain",
  },
  { 
    id: "el2", 
    name: "POSOCO Grid Status", 
    url: "https://posoco.in/reports/daily-reports/", 
    category: "Grid", 
    description: "Daily grid status and frequency reports", 
    openInNew: true,
    roleVisibility: ["super_admin", "admin"],
    utilityScope: [],
    priority: 8,
    active: true,
    icon: "Zap",
  },
  { 
    id: "el3", 
    name: "CERC DSM Regulations", 
    url: "https://cercind.gov.in/regulations.html", 
    category: "Regulatory", 
    description: "Deviation settlement mechanism guidelines", 
    openInNew: true,
    roleVisibility: ["super_admin", "admin"],
    utilityScope: [],
    priority: 5,
    active: true,
    icon: "FileText",
  },
  { 
    id: "el4", 
    name: "Windy.com", 
    url: "https://www.windy.com/?22.5,72.5,6", 
    category: "Weather", 
    description: "Interactive global weather visualization", 
    openInNew: true,
    roleVisibility: ["super_admin", "admin", "operator"],
    utilityScope: [],
    priority: 10,
    active: true,
    icon: "Wind",
  },
  { 
    id: "el5", 
    name: "Grafana Monitoring", 
    url: "https://grafana.internal.tatapower.com", 
    category: "Internal", 
    description: "Infrastructure monitoring dashboards", 
    openInNew: true,
    roleVisibility: ["super_admin", "admin"],
    utilityScope: [],
    priority: 7,
    active: true,
    icon: "BarChart3",
  },
  { 
    id: "el6", 
    name: "Confluence Wiki", 
    url: "https://wiki.internal.tatapower.com/weatherxpert", 
    category: "Internal", 
    description: "WeatherXpert documentation and SOPs", 
    openInNew: true,
    roleVisibility: ["super_admin", "admin", "operator"],
    utilityScope: [],
    priority: 6,
    active: true,
    icon: "BookOpen",
  },
];

// ═════════════════════════════════════════
// AUDIT LOG
// ═════════════════════════════════════════
export type AuditAction = "create" | "update" | "delete" | "login" | "export" | "config_change";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  resource: string;
  details: string;
  ip: string;
}

export const AUDIT_LOG: AuditLogEntry[] = [
  { id: "al01", timestamp: "2026-02-11 09:15", user: "Rajesh Kumar",  action: "login",         resource: "System",           details: "Logged in via SSO",                                ip: "10.20.30.41" },
  { id: "al02", timestamp: "2026-02-11 09:10", user: "Rajesh Kumar",  action: "config_change", resource: "Provider: Custom WRF", details: "Changed refresh interval from 6h to 3h",         ip: "10.20.30.41" },
  { id: "al03", timestamp: "2026-02-11 08:42", user: "Priya Sharma",  action: "login",         resource: "System",           details: "Logged in via SSO",                                ip: "10.20.30.55" },
  { id: "al04", timestamp: "2026-02-11 06:00", user: "System",        action: "export",        resource: "Daily Ops Report", details: "Scheduled report generated and sent to 2 recipients", ip: "—" },
  { id: "al05", timestamp: "2026-02-10 16:30", user: "Amit Patel",    action: "login",         resource: "System",           details: "Logged in via password",                           ip: "10.20.30.102" },
  { id: "al06", timestamp: "2026-02-10 14:00", user: "Priya Sharma",  action: "update",        resource: "Alert Rule: High Wind", details: "Changed threshold from 80 km/h to 75 km/h",    ip: "10.20.30.55" },
  { id: "al07", timestamp: "2026-02-10 11:00", user: "Rajesh Kumar",  action: "create",        resource: "User: Neha Singh", details: "Invited as Admin for Delhi Distribution",           ip: "10.20.30.41" },
  { id: "al08", timestamp: "2026-02-09 15:30", user: "Priya Sharma",  action: "export",        resource: "Accuracy Report",  details: "Manual export to priya.s@tatapower.com",            ip: "10.20.30.55" },
  { id: "al09", timestamp: "2026-02-09 03:45", user: "System",        action: "config_change", resource: "Integration: SCADA Historian", details: "Connection lost — auto-retry failed after 3 attempts", ip: "—" },
  { id: "al10", timestamp: "2026-02-08 14:30", user: "Rajesh Kumar",  action: "update",        resource: "User: Sunita Reddy", details: "Status changed from active to suspended",        ip: "10.20.30.41" },
  { id: "al11", timestamp: "2026-02-08 10:00", user: "Rajesh Kumar",  action: "delete",        resource: "External Link: Old Dashboard", details: "Removed deprecated Grafana v8 link",       ip: "10.20.30.41" },
  { id: "al12", timestamp: "2026-02-07 09:00", user: "System",        action: "config_change", resource: "Integration: Campbell Scientific", details: "Device disconnected — serial port timeout", ip: "—" },
];

// ═════════════════════════════════════════
// SYSTEM HEALTH
// ═════════════════════════════════════════
export interface HealthMetric {
  id: string;
  name: string;
  category: "API" | "Database" | "Integration" | "Infrastructure";
  status: "healthy" | "warning" | "critical" | "unknown";
  value: string;
  lastCheck: string;
  uptime: string;
  details: string;
}

export const HEALTH_METRICS: HealthMetric[] = [
  { id: "hm1",  name: "IMD GFS API",           category: "API",            status: "healthy",  value: "120ms",    lastCheck: "2026-02-11 09:14", uptime: "99.97%", details: "All endpoints responding normally" },
  { id: "hm2",  name: "ECMWF API",             category: "API",            status: "healthy",  value: "340ms",    lastCheck: "2026-02-11 09:14", uptime: "99.91%", details: "Nominal response times" },
  { id: "hm3",  name: "AccuWeather API",        category: "API",            status: "healthy",  value: "95ms",     lastCheck: "2026-02-11 09:14", uptime: "99.85%", details: "Rate limit: 42% used" },
  { id: "hm4",  name: "Custom WRF API",         category: "API",            status: "warning",  value: "1.8s",     lastCheck: "2026-02-11 09:14", uptime: "94.20%", details: "High latency — model compute backlog" },
  { id: "hm5",  name: "TimescaleDB Primary",    category: "Database",       status: "healthy",  value: "12ms",     lastCheck: "2026-02-11 09:14", uptime: "99.99%", details: "3-node cluster, all healthy" },
  { id: "hm6",  name: "Redis Cache",            category: "Database",       status: "healthy",  value: "2ms",      lastCheck: "2026-02-11 09:14", uptime: "100%",   details: "Memory: 68% used (4.1/6 GB)" },
  { id: "hm7",  name: "AWS IoT Core",           category: "Integration",    status: "healthy",  value: "Connected", lastCheck: "2026-02-11 09:12", uptime: "99.95%", details: "16 things connected, 0 shadows stale" },
  { id: "hm8",  name: "SCADA Gateway",          category: "Integration",    status: "healthy",  value: "Connected", lastCheck: "2026-02-11 09:14", uptime: "99.80%", details: "OPC-UA subscription active" },
  { id: "hm9",  name: "SCADA Historian",        category: "Integration",    status: "critical", value: "Timeout",  lastCheck: "2026-02-10 22:00", uptime: "78.50%", details: "PI server unreachable since 22:00 IST" },
  { id: "hm10", name: "Campbell Dataloggers",   category: "Integration",    status: "critical", value: "Offline",  lastCheck: "2026-02-08 14:30", uptime: "60.10%", details: "Serial connection lost — check cabling" },
  { id: "hm11", name: "SMTP Mail Server",       category: "Infrastructure", status: "healthy",  value: "45ms",     lastCheck: "2026-02-11 09:14", uptime: "99.90%", details: "Queue depth: 0 messages" },
  { id: "hm12", name: "SMS Gateway (MSG91)",     category: "Infrastructure", status: "healthy",  value: "180ms",    lastCheck: "2026-02-11 09:14", uptime: "99.50%", details: "Credits remaining: 8,420" },
];

// ── Sandbox test ──
export interface SandboxResult {
  integration: string;
  timestamp: string;
  success: boolean;
  latency: string;
  message: string;
  responsePreview?: string;
}