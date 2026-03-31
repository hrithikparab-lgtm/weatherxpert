/* ═══════════════════════════════════════════════════
   REPORTS & EXPORTS — Types, templates, components,
   schedule configs, audit trail mock data
   ═══════════════════════════════════════════════════ */

// ── Report template ──
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "operations" | "analytics" | "compliance" | "custom";
  defaultComponents: string[];
  frequency: ScheduleFrequency;
  icon: string; // lucide icon name key
  lastRun?: string;
  lastStatus?: "success" | "failed" | "pending";
  allowedRoles?: Array<"superadmin" | "admin" | "operator">; // NEW: Role-based visibility
}

// ── Builder component (draggable blocks) ──
export type ComponentType = "kpi" | "chart" | "table" | "map_snapshot" | "text" | "divider";

export interface BuilderComponent {
  id: string;
  type: ComponentType;
  label: string;
  description: string;
  defaultWidth: "full" | "half" | "third";
}

// ── Schedule ──
export type ScheduleFrequency = "daily" | "weekly" | "monthly" | "once";

export interface ScheduleConfig {
  frequency: ScheduleFrequency;
  time: string;       // HH:mm
  dayOfWeek?: number;  // 0=Sun..6=Sat
  dayOfMonth?: number; // 1..28
  timezone: string;
  enabled: boolean;
}

// ── Report configuration (what user builds) ──
export interface ReportConfig {
  id: string;
  templateId: string | null;
  name: string;
  components: string[];
  filters: ReportFilter;
  recipients: string[];
  schedule: ScheduleConfig;
  format: ExportFormat;
}

export interface ReportFilter {
  dateRange: string;
  region: string;
  stations: string[];
  providers: string[];
}

export type ExportFormat = "pdf" | "xlsx" | "csv" | "pptx";

// ── Audit trail ──
export interface AuditEntry {
  id: string;
  reportName: string;
  templateId: string;
  triggeredBy: "schedule" | "manual";
  sentTo: string[];
  sentAt: string;
  status: "delivered" | "failed" | "pending";
  format: ExportFormat;
  fileSize: string;
  duration: string;
  errorMessage?: string;
  emailTracking?: { // NEW: Email open tracking
    opens: number;
    lastOpened?: string;
    recipients: Array<{ email: string; opened: boolean; openedAt?: string }>;
  };
}

// ═════════════════════════════════════════
// MOCK DATA
// ═════════════════════════════════════════

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "tpl-daily-ops",
    name: "Daily Operations Summary",
    description: "24-hour operational overview with KPIs, alerts, and station status for shift handover",
    category: "operations",
    defaultComponents: ["kpi-weather-summary", "chart-temp-24h", "table-alerts-today", "kpi-station-uptime"],
    frequency: "daily",
    icon: "clipboard-list",
    lastRun: "2026-02-11 06:00",
    lastStatus: "success",
    allowedRoles: ["superadmin", "admin", "operator"], // Available to all
  },
  {
    id: "tpl-weekly-summary",
    name: "Weekly Performance Summary",
    description: "7-day aggregate metrics, forecast accuracy trends, and regional comparisons",
    category: "analytics",
    defaultComponents: ["kpi-accuracy-week", "chart-accuracy-trend", "table-provider-ranking", "chart-error-dist"],
    frequency: "weekly",
    icon: "calendar-days",
    lastRun: "2026-02-10 08:00",
    lastStatus: "success",
    allowedRoles: ["superadmin", "admin"], // Admin and above
  },
  {
    id: "tpl-monthly-abp",
    name: "Monthly ABP Compliance Report",
    description: "Availability-based performance report for CERC regulatory compliance",
    category: "compliance",
    defaultComponents: ["kpi-abp-metrics", "chart-generation-forecast", "table-block-accuracy", "map-region-snapshot"],
    frequency: "monthly",
    icon: "shield-check",
    lastRun: "2026-02-01 00:30",
    lastStatus: "success",
    allowedRoles: ["superadmin", "admin"], // Admin and above
  },
  {
    id: "tpl-accuracy-report",
    name: "Forecast Accuracy Report",
    description: "Detailed MAE/RMSE/MBE breakdown by provider, region, and parameter",
    category: "analytics",
    defaultComponents: ["kpi-accuracy-all", "chart-provider-comparison", "table-region-breakdown", "chart-bias-trend"],
    frequency: "monthly",
    icon: "target",
    lastRun: "2026-02-09 14:00",
    lastStatus: "failed",
    allowedRoles: ["superadmin", "admin"], // Admin and above
  },
];

export const BUILDER_COMPONENTS: BuilderComponent[] = [
  { id: "kpi-weather-summary",    type: "kpi",          label: "Weather KPIs",           description: "Current temp, humidity, wind, rainfall",  defaultWidth: "full" },
  { id: "kpi-station-uptime",     type: "kpi",          label: "Station Uptime",         description: "Uptime % across all active stations",     defaultWidth: "half" },
  { id: "kpi-accuracy-week",      type: "kpi",          label: "Weekly Accuracy KPIs",   description: "MAE, RMSE, MBE for the week",             defaultWidth: "full" },
  { id: "kpi-accuracy-all",       type: "kpi",          label: "All Accuracy Metrics",   description: "Complete accuracy KPI panel",              defaultWidth: "full" },
  { id: "kpi-abp-metrics",        type: "kpi",          label: "ABP Compliance KPIs",    description: "DSM penalty, schedule deviation",          defaultWidth: "full" },
  { id: "chart-temp-24h",         type: "chart",        label: "24h Temperature Chart",  description: "Hourly temperature time-series",           defaultWidth: "full" },
  { id: "chart-accuracy-trend",   type: "chart",        label: "Accuracy Trend",         description: "30-day accuracy trend line",                defaultWidth: "full" },
  { id: "chart-provider-comparison", type: "chart",     label: "Provider Comparison",    description: "Multi-provider error overlay",              defaultWidth: "full" },
  { id: "chart-error-dist",       type: "chart",        label: "Error Distribution",     description: "Histogram of forecast errors",              defaultWidth: "half" },
  { id: "chart-generation-forecast", type: "chart",     label: "Generation vs Forecast", description: "Actual vs scheduled generation chart",      defaultWidth: "full" },
  { id: "chart-bias-trend",       type: "chart",        label: "Bias Trend",             description: "MBE over time by provider",                 defaultWidth: "half" },
  { id: "table-alerts-today",     type: "table",        label: "Today's Alerts",         description: "All triggered alerts in last 24h",          defaultWidth: "full" },
  { id: "table-provider-ranking", type: "table",        label: "Provider Ranking",       description: "Ranked provider accuracy table",            defaultWidth: "full" },
  { id: "table-block-accuracy",   type: "table",        label: "Block-wise Accuracy",    description: "15-min block accuracy table",               defaultWidth: "full" },
  { id: "table-region-breakdown", type: "table",        label: "Region Breakdown",       description: "Per-region accuracy summary",               defaultWidth: "full" },
  { id: "map-region-snapshot",    type: "map_snapshot",  label: "Region Map Snapshot",    description: "Static map with station overlays",          defaultWidth: "half" },
  { id: "text-notes",             type: "text",         label: "Notes / Commentary",     description: "Free-text section for analyst notes",       defaultWidth: "full" },
  { id: "divider-section",        type: "divider",      label: "Section Divider",        description: "Visual separator between report sections",  defaultWidth: "full" },
];

export const REGIONS = [
  "All Regions", "Mumbai Distribution", "Delhi Distribution",
  "Jaisalmer Wind Farm", "Charanka Solar Park", "Mundra UMPP", "Maithon Power",
];

export const STATIONS_LIST = [
  "All Stations", "Trombay AWS", "Colaba AWS", "Powai AWS", "Connaught Place AWS",
  "Dwarka AWS", "Jaisalmer Wind Farm", "Charanka Solar Park", "Mundra Port AWS", "Maithon Dam AWS",
];

export const PROVIDERS_LIST = ["All Providers", "IMD", "Tomorrow.io"];

export const DATE_RANGE_OPTIONS = [
  "Last 24 hours", "Last 7 days", "Last 30 days", "Last 90 days",
  "This Month", "Last Month", "This Quarter", "Custom Range",
];

export const FORMAT_OPTIONS: { id: ExportFormat; label: string; ext: string; size: string }[] = [
  { id: "pdf",  label: "PDF Report",    ext: ".pdf",  size: "~2.4 MB" },
  { id: "xlsx", label: "Excel Workbook", ext: ".xlsx", size: "~1.8 MB" },
  { id: "csv",  label: "CSV Data",      ext: ".csv",  size: "~0.6 MB" },
  { id: "pptx", label: "PowerPoint",    ext: ".pptx", size: "~3.2 MB" },
];

export const RECIPIENT_SUGGESTIONS = [
  "rajesh.k@tatapower.com",
  "priya.s@tatapower.com",
  "amit.p@tatapower.com",
  "operations@tatapower.com",
  "compliance@tatapower.com",
  "analytics-team@tatapower.com",
  "management@tatapower.com",
  "grid-ops@tatapower.com",
];

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const TIMEZONE = "Asia/Kolkata (IST)";

// ── Audit trail mock ──
export const AUDIT_TRAIL: AuditEntry[] = [
  { 
    id: "aud-012", 
    reportName: "Daily Operations Summary", 
    templateId: "tpl-daily-ops", 
    triggeredBy: "schedule", 
    sentTo: ["operations@tatapower.com", "rajesh.k@tatapower.com"], 
    sentAt: "2026-02-11 06:00", 
    status: "delivered", 
    format: "pdf", 
    fileSize: "2.1 MB", 
    duration: "12s",
    emailTracking: {
      opens: 2,
      lastOpened: "2026-02-11 08:15",
      recipients: [
        { email: "operations@tatapower.com", opened: true, openedAt: "2026-02-11 06:45" },
        { email: "rajesh.k@tatapower.com", opened: true, openedAt: "2026-02-11 08:15" }
      ]
    }
  },
  { 
    id: "aud-011", 
    reportName: "Daily Operations Summary", 
    templateId: "tpl-daily-ops", 
    triggeredBy: "schedule", 
    sentTo: ["operations@tatapower.com", "rajesh.k@tatapower.com"], 
    sentAt: "2026-02-10 06:00", 
    status: "delivered", 
    format: "pdf", 
    fileSize: "2.3 MB", 
    duration: "14s",
    emailTracking: {
      opens: 1,
      lastOpened: "2026-02-10 07:23",
      recipients: [
        { email: "operations@tatapower.com", opened: true, openedAt: "2026-02-10 07:23" },
        { email: "rajesh.k@tatapower.com", opened: false }
      ]
    }
  },
  { 
    id: "aud-010", 
    reportName: "Weekly Performance Summary", 
    templateId: "tpl-weekly-summary", 
    triggeredBy: "schedule", 
    sentTo: ["analytics-team@tatapower.com", "management@tatapower.com"], 
    sentAt: "2026-02-10 08:00", 
    status: "delivered", 
    format: "pdf", 
    fileSize: "4.7 MB", 
    duration: "28s",
    emailTracking: {
      opens: 5,
      lastOpened: "2026-02-11 14:32",
      recipients: [
        { email: "analytics-team@tatapower.com", opened: true, openedAt: "2026-02-10 09:12" },
        { email: "management@tatapower.com", opened: true, openedAt: "2026-02-11 14:32" }
      ]
    }
  },
  { 
    id: "aud-009", 
    reportName: "Forecast Accuracy Report", 
    templateId: "tpl-accuracy-report", 
    triggeredBy: "manual", 
    sentTo: ["priya.s@tatapower.com"], 
    sentAt: "2026-02-09 15:30", 
    status: "delivered", 
    format: "xlsx", 
    fileSize: "1.9 MB", 
    duration: "8s",
    emailTracking: {
      opens: 0,
      recipients: [
        { email: "priya.s@tatapower.com", opened: false }
      ]
    }
  },
  { id: "aud-008", reportName: "Forecast Accuracy Report", templateId: "tpl-accuracy-report", triggeredBy: "schedule", sentTo: ["compliance@tatapower.com", "analytics-team@tatapower.com"], sentAt: "2026-02-01 01:00", status: "failed", format: "pdf", fileSize: "—", duration: "45s", errorMessage: "SMTP timeout: mail server unreachable after 3 retries" },
  { 
    id: "aud-007", 
    reportName: "Monthly ABP Compliance Report", 
    templateId: "tpl-monthly-abp", 
    triggeredBy: "schedule", 
    sentTo: ["compliance@tatapower.com", "grid-ops@tatapower.com", "management@tatapower.com"], 
    sentAt: "2026-02-01 00:30", 
    status: "delivered", 
    format: "pdf", 
    fileSize: "6.2 MB", 
    duration: "35s",
    emailTracking: {
      opens: 3,
      lastOpened: "2026-02-03 10:05",
      recipients: [
        { email: "compliance@tatapower.com", opened: true, openedAt: "2026-02-01 09:15" },
        { email: "grid-ops@tatapower.com", opened: true, openedAt: "2026-02-01 10:30" },
        { email: "management@tatapower.com", opened: true, openedAt: "2026-02-03 10:05" }
      ]
    }
  },
  { 
    id: "aud-006", 
    reportName: "Daily Operations Summary", 
    templateId: "tpl-daily-ops", 
    triggeredBy: "manual", 
    sentTo: ["amit.p@tatapower.com"], 
    sentAt: "2026-01-30 14:15", 
    status: "delivered", 
    format: "csv", 
    fileSize: "0.4 MB", 
    duration: "3s",
    emailTracking: {
      opens: 1,
      lastOpened: "2026-01-30 14:22",
      recipients: [
        { email: "amit.p@tatapower.com", opened: true, openedAt: "2026-01-30 14:22" }
      ]
    }
  },
  { 
    id: "aud-005", 
    reportName: "Weekly Performance Summary", 
    templateId: "tpl-weekly-summary", 
    triggeredBy: "schedule", 
    sentTo: ["analytics-team@tatapower.com"], 
    sentAt: "2026-01-27 08:00", 
    status: "delivered", 
    format: "pdf", 
    fileSize: "4.5 MB", 
    duration: "26s",
    emailTracking: {
      opens: 2,
      lastOpened: "2026-01-28 11:45",
      recipients: [
        { email: "analytics-team@tatapower.com", opened: true, openedAt: "2026-01-27 09:20" }
      ]
    }
  },
];

// ── Component type config ──
export const COMPONENT_TYPE_CONFIG: Record<ComponentType, { label: string; color: string; bgColor: string }> = {
  kpi:          { label: "KPI",      color: "text-chart-1",          bgColor: "bg-chart-1/10" },
  chart:        { label: "Chart",    color: "text-chart-3",          bgColor: "bg-chart-3/10" },
  table:        { label: "Table",    color: "text-chart-2",          bgColor: "bg-chart-2/10" },
  map_snapshot: { label: "Map",      color: "text-chart-4",          bgColor: "bg-chart-4/10" },
  text:         { label: "Text",     color: "text-muted-foreground", bgColor: "bg-secondary" },
  divider:      { label: "Divider",  color: "text-muted-foreground", bgColor: "bg-secondary" },
};