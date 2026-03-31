/* ═══════════════════════════════════════════════════
   ALERTS DATA — Shared types, sample data, helpers
   ═══════════════════════════════════════════════════ */

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type AlertType = "storm" | "wind" | "heat" | "lightning" | "fog" | "flood" | "humidity" | "equipment";
export type Status = "active" | "acknowledged" | "escalated" | "resolved";
export type EscalationLevel = "L1" | "L2" | "L3";

export interface TimelineEvent {
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export interface AlertRecord {
  id: string;
  severity: Severity;
  type: AlertType;
  status: Status;
  title: string;
  description: string;
  location: string;
  discom: string;
  block: string;
  source: string;
  issuedAt: string;
  expiresAt: string;
  assignee: string | null;
  assigneeAvatar?: string; // Avatar URL or initials
  read: boolean;
  lat: number;
  lng: number;
  escalationLevel: EscalationLevel;
  slaMinutes: number; // How long the alert has been open
  timeline: TimelineEvent[]; // Incident timeline
}

// User workload tracking
export interface UserWorkload {
  name: string;
  avatar: string;
  activeAlerts: number;
  color: string;
}

export const TEAM_MEMBERS: UserWorkload[] = [
  { name: "Rajiv Sharma", avatar: "RS", activeAlerts: 3, color: "bg-blue-500" },
  { name: "Priya Mehta", avatar: "PM", activeAlerts: 5, color: "bg-purple-500" },
  { name: "Arun Desai", avatar: "AD", activeAlerts: 2, color: "bg-green-500" },
  { name: "Suresh Kumar", avatar: "SK", activeAlerts: 4, color: "bg-orange-500" },
  { name: "Neha Singh", avatar: "NS", activeAlerts: 1, color: "bg-pink-500" },
  { name: "Vikram Rao", avatar: "VR", activeAlerts: 0, color: "bg-indigo-500" },
];

// Severity visual config — token-based
export const SEVERITY_CONFIG: Record<
  Severity,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    badge: string;
    ring: string;
    dot: string;
    priority: number;
  }
> = {
  critical: {
    label: "Critical",
    bg: "bg-red-500/8 dark:bg-red-500/15",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
    badge: "bg-red-500 text-white",
    ring: "ring-red-500/20",
    dot: "bg-red-500",
    priority: 0,
  },
  high: {
    label: "High",
    bg: "bg-orange-500/8 dark:bg-orange-500/15",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
    badge: "bg-orange-500 text-white",
    ring: "ring-orange-500/20",
    dot: "bg-orange-500",
    priority: 1,
  },
  medium: {
    label: "Medium",
    bg: "bg-amber-500/8 dark:bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    badge: "bg-amber-500 text-white",
    ring: "ring-amber-500/20",
    dot: "bg-amber-500",
    priority: 2,
  },
  low: {
    label: "Low",
    bg: "bg-blue-500/8 dark:bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
    badge: "bg-blue-500 text-white",
    ring: "ring-blue-500/20",
    dot: "bg-blue-500",
    priority: 3,
  },
  info: {
    label: "Info",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    badge: "bg-secondary text-secondary-foreground",
    ring: "ring-muted",
    dot: "bg-muted-foreground",
    priority: 4,
  },
};

export const TYPE_LABELS: Record<AlertType, string> = {
  storm: "Storm",
  wind: "Wind",
  heat: "Heat Wave",
  lightning: "Lightning",
  fog: "Fog",
  flood: "Flood",
  humidity: "Humidity",
  equipment: "Equipment",
};

export const DISCOMS = [
  "Mumbai Distribution",
  "Delhi Distribution",
  "MSEDCL",
  "Ajmer DISCOM",
  "Jaisalmer Wind Farm",
  "Mundra UMPP",
];

export const BLOCKS = [
  "Colaba", "Bandra", "Andheri", "Dadar", "Thane", "Mulund",
  "Kurla", "Panvel", "Vashi", "Navi Mumbai",
];

// Sample data
export const SAMPLE_ALERTS: AlertRecord[] = [
  {
    id: "ALT-001",
    severity: "critical",
    type: "storm",
    status: "active",
    title: "Severe Thunderstorm Warning",
    description: "Heavy rainfall (50-80mm/hr), lightning, wind gusts up to 65 km/h. Multiple sub-stations at risk of flooding. Immediate action required for coastal transformers.",
    location: "Mumbai Metropolitan Region",
    discom: "Mumbai Distribution",
    block: "Colaba",
    source: "IMD",
    issuedAt: "2026-02-11 12:24",
    expiresAt: "2026-02-11 20:00",
    assignee: null,
    read: false,
    lat: 18.9067,
    lng: 72.8147,
    escalationLevel: "L3",
    slaMinutes: 120,
    timeline: [
      { timestamp: "2026-02-11 12:24", action: "Issued", user: "System", details: "Alert issued by IMD" },
      { timestamp: "2026-02-11 12:30", action: "Acknowledged", user: "Rajiv Sharma", details: "Acknowledged by Rajiv Sharma" },
      { timestamp: "2026-02-11 13:00", action: "Escalated", user: "Rajiv Sharma", details: "Escalated to L3" },
    ],
  },
  {
    id: "ALT-002",
    severity: "high",
    type: "wind",
    status: "active",
    title: "High Wind Advisory — Turbine Curtailment",
    description: "Sustained winds 55+ km/h for next 4 hours. Turbine curtailment likely. Wind farm output may drop 40-60%. Grid balancing action recommended.",
    location: "Jaisalmer Wind Farm",
    discom: "Jaisalmer Wind Farm",
    block: "Jaisalmer",
    source: "Tomorrow.io",
    issuedAt: "2026-02-11 11:49",
    expiresAt: "2026-02-11 16:00",
    assignee: "Rajiv Sharma",
    read: false,
    lat: 26.9157,
    lng: 70.9083,
    escalationLevel: "L2",
    slaMinutes: 90,
    timeline: [
      { timestamp: "2026-02-11 11:49", action: "Issued", user: "System", details: "Alert issued by Tomorrow.io" },
      { timestamp: "2026-02-11 12:00", action: "Acknowledged", user: "Rajiv Sharma", details: "Acknowledged by Rajiv Sharma" },
      { timestamp: "2026-02-11 12:30", action: "Escalated", user: "Rajiv Sharma", details: "Escalated to L2" },
    ],
  },
  {
    id: "ALT-003",
    severity: "high",
    type: "lightning",
    status: "active",
    title: "Lightning Activity — 10km Radius",
    description: "Active lightning detected within 10km of Maithon Power. Outdoor operations suspended. Equipment isolation protocols activated.",
    location: "Maithon Power, Jharkhand",
    discom: "Mundra UMPP",
    block: "Maithon",
    source: "AWS Network",
    issuedAt: "2026-02-11 12:10",
    expiresAt: "2026-02-11 15:00",
    assignee: null,
    read: true,
    lat: 23.7748,
    lng: 86.8147,
    escalationLevel: "L2",
    slaMinutes: 60,
    timeline: [
      { timestamp: "2026-02-11 12:10", action: "Issued", user: "System", details: "Alert issued by AWS Network" },
      { timestamp: "2026-02-11 12:20", action: "Acknowledged", user: "Priya Mehta", details: "Acknowledged by Priya Mehta" },
      { timestamp: "2026-02-11 12:50", action: "Escalated", user: "Priya Mehta", details: "Escalated to L2" },
    ],
  },
  {
    id: "ALT-004",
    severity: "medium",
    type: "heat",
    status: "acknowledged",
    title: "Heat Wave Alert — Transformer Risk",
    description: "Temperatures exceeding 44°C. Monitor transformer oil temperatures closely. Cooling systems on high. Peak demand surge expected 13:00-17:00.",
    location: "Mundra, Gujarat",
    discom: "Mundra UMPP",
    block: "Mundra",
    source: "IMD",
    issuedAt: "2026-02-11 11:00",
    expiresAt: "2026-02-12 06:00",
    assignee: "Priya Mehta",
    read: true,
    lat: 22.8394,
    lng: 69.7253,
    escalationLevel: "L1",
    slaMinutes: 150,
    timeline: [
      { timestamp: "2026-02-11 11:00", action: "Issued", user: "System", details: "Alert issued by IMD" },
      { timestamp: "2026-02-11 11:10", action: "Acknowledged", user: "Priya Mehta", details: "Acknowledged by Priya Mehta" },
      { timestamp: "2026-02-11 11:30", action: "Escalated", user: "Priya Mehta", details: "Escalated to L1" },
    ],
  },
  {
    id: "ALT-005",
    severity: "medium",
    type: "humidity",
    status: "active",
    title: "Humidity Spike — Corrosion Risk",
    description: "Relative humidity expected to exceed 92% for 6+ hours. Equipment corrosion risk elevated. Maintenance advisory for outdoor transformers and switchgear.",
    location: "Bandra Sub-station",
    discom: "Mumbai Distribution",
    block: "Bandra",
    source: "WRF Model",
    issuedAt: "2026-02-11 10:15",
    expiresAt: "2026-02-11 18:00",
    assignee: null,
    read: false,
    lat: 19.0544,
    lng: 72.8402,
    escalationLevel: "L1",
    slaMinutes: 45,
    timeline: [
      { timestamp: "2026-02-11 10:15", action: "Issued", user: "System", details: "Alert issued by WRF Model" },
      { timestamp: "2026-02-11 10:20", action: "Acknowledged", user: "Rajiv Sharma", details: "Acknowledged by Rajiv Sharma" },
      { timestamp: "2026-02-11 10:45", action: "Escalated", user: "Rajiv Sharma", details: "Escalated to L1" },
    ],
  },
  {
    id: "ALT-006",
    severity: "medium",
    type: "flood",
    status: "active",
    title: "Flash Flood Watch — Low-Lying Areas",
    description: "Accumulated rainfall exceeding 120mm. Flash flood risk in Panvel and Vashi sectors. Sub-station basement water levels to be monitored.",
    location: "Navi Mumbai, Panvel",
    discom: "Mumbai Distribution",
    block: "Panvel",
    source: "IMD",
    issuedAt: "2026-02-11 09:30",
    expiresAt: "2026-02-11 22:00",
    assignee: "Arun Desai",
    read: true,
    lat: 18.9894,
    lng: 73.1175,
    escalationLevel: "L2",
    slaMinutes: 75,
    timeline: [
      { timestamp: "2026-02-11 09:30", action: "Issued", user: "System", details: "Alert issued by IMD" },
      { timestamp: "2026-02-11 09:40", action: "Acknowledged", user: "Arun Desai", details: "Acknowledged by Arun Desai" },
      { timestamp: "2026-02-11 10:15", action: "Escalated", user: "Arun Desai", details: "Escalated to L2" },
    ],
  },
  {
    id: "ALT-007",
    severity: "low",
    type: "wind",
    status: "active",
    title: "Moderate Wind Advisory",
    description: "Wind speeds 30-40 km/h expected. Minor impact on distribution lines. Routine monitoring sufficient.",
    location: "Thane District",
    discom: "Mumbai Distribution",
    block: "Thane",
    source: "Tomorrow.io",
    issuedAt: "2026-02-11 08:45",
    expiresAt: "2026-02-11 14:00",
    assignee: null,
    read: false,
    lat: 19.2183,
    lng: 72.9781,
    escalationLevel: "L1",
    slaMinutes: 30,
    timeline: [
      { timestamp: "2026-02-11 08:45", action: "Issued", user: "System", details: "Alert issued by Tomorrow.io" },
      { timestamp: "2026-02-11 08:50", action: "Acknowledged", user: "Rajiv Sharma", details: "Acknowledged by Rajiv Sharma" },
      { timestamp: "2026-02-11 09:15", action: "Escalated", user: "Rajiv Sharma", details: "Escalated to L1" },
    ],
  },
  {
    id: "ALT-008",
    severity: "low",
    type: "fog",
    status: "active",
    title: "Fog Advisory — Morning Hours",
    description: "Dense fog predicted 04:00-07:00 tomorrow. Visibility may drop below 500m. Solar farm output delay expected. No grid impact.",
    location: "Delhi Distribution",
    discom: "Delhi Distribution",
    block: "South Delhi",
    source: "IMD",
    issuedAt: "2026-02-11 14:00",
    expiresAt: "2026-02-12 08:00",
    assignee: null,
    read: true,
    lat: 28.5244,
    lng: 77.1855,
    escalationLevel: "L1",
    slaMinutes: 105,
    timeline: [
      { timestamp: "2026-02-11 14:00", action: "Issued", user: "System", details: "Alert issued by IMD" },
      { timestamp: "2026-02-11 14:10", action: "Acknowledged", user: "Rajiv Sharma", details: "Acknowledged by Rajiv Sharma" },
      { timestamp: "2026-02-11 14:30", action: "Escalated", user: "Rajiv Sharma", details: "Escalated to L1" },
    ],
  },
  {
    id: "ALT-009",
    severity: "info",
    type: "equipment",
    status: "resolved",
    title: "Equipment Sensor Recalibrated",
    description: "Temperature sensor at Andheri sub-station has been recalibrated. Readings back to normal. No further action required.",
    location: "Andheri, Mumbai",
    discom: "Mumbai Distribution",
    block: "Andheri",
    source: "SCADA",
    issuedAt: "2026-02-11 07:15",
    expiresAt: "2026-02-11 08:00",
    assignee: "Suresh Kumar",
    read: true,
    lat: 19.1197,
    lng: 72.8464,
    escalationLevel: "L1",
    slaMinutes: 15,
    timeline: [
      { timestamp: "2026-02-11 07:15", action: "Issued", user: "System", details: "Alert issued by SCADA" },
      { timestamp: "2026-02-11 07:20", action: "Acknowledged", user: "Suresh Kumar", details: "Acknowledged by Suresh Kumar" },
      { timestamp: "2026-02-11 07:30", action: "Escalated", user: "Suresh Kumar", details: "Escalated to L1" },
      { timestamp: "2026-02-11 07:45", action: "Resolved", user: "Suresh Kumar", details: "Resolved by Suresh Kumar" },
    ],
  },
  {
    id: "ALT-010",
    severity: "info",
    type: "fog",
    status: "resolved",
    title: "Fog Advisory Cleared",
    description: "Morning fog has cleared. Visibility restored to normal. All systems nominal.",
    location: "Delhi Distribution",
    discom: "Delhi Distribution",
    block: "Central Delhi",
    source: "IMD",
    issuedAt: "2026-02-11 06:00",
    expiresAt: "2026-02-11 08:30",
    assignee: null,
    read: true,
    lat: 28.6139,
    lng: 77.2090,
    escalationLevel: "L1",
    slaMinutes: 120,
    timeline: [
      { timestamp: "2026-02-11 06:00", action: "Issued", user: "System", details: "Alert issued by IMD" },
      { timestamp: "2026-02-11 06:10", action: "Acknowledged", user: "Rajiv Sharma", details: "Acknowledged by Rajiv Sharma" },
      { timestamp: "2026-02-11 06:30", action: "Escalated", user: "Rajiv Sharma", details: "Escalated to L1" },
      { timestamp: "2026-02-11 07:45", action: "Resolved", user: "Rajiv Sharma", details: "Resolved by Rajiv Sharma" },
    ],
  },
];