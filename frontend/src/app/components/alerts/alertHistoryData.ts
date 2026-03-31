/* ═══════════════════════════════════════════════════
   ALERT HISTORY DATA — Extended history records
   for the 7-day + custom-range table
   ═══════════════════════════════════════════════════ */

import type { Severity, AlertType, Status } from "./alertsData";

export interface HistoryRecord {
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
  issuedAtUTC: string;
  issuedAtLocal: string;
  resolvedAt: string | null;
  acknowledgedBy: string | null;
  durationMin: number;
  /** Mini sparkline data — severity intensity over event lifecycle */
  sparkline: number[];
  /** Root cause tag for filtering and analytics */
  rootCause?: "weather" | "equipment" | "grid" | "human_error" | "external" | "unknown";
  /** Day of week (0-6, 0=Sunday) */
  dayOfWeek: number;
  /** Hour of day (0-23) */
  hourOfDay: number;
}

// Generate 7 days of history data
function buildHistory(): HistoryRecord[] {
  const types: AlertType[] = ["storm", "wind", "heat", "lightning", "fog", "flood", "humidity", "equipment"];
  const severities: Severity[] = ["critical", "high", "medium", "low", "info"];
  const statuses: Status[] = ["resolved", "acknowledged", "escalated", "resolved"];
  const locations = [
    { loc: "Mumbai Metropolitan Region", discom: "Mumbai Distribution", block: "Colaba" },
    { loc: "Jaisalmer Wind Farm", discom: "Jaisalmer Wind Farm", block: "Jaisalmer" },
    { loc: "Maithon Power, Jharkhand", discom: "Mundra UMPP", block: "Maithon" },
    { loc: "Mundra, Gujarat", discom: "Mundra UMPP", block: "Mundra" },
    { loc: "Bandra Sub-station", discom: "Mumbai Distribution", block: "Bandra" },
    { loc: "Delhi Distribution", discom: "Delhi Distribution", block: "Central Delhi" },
    { loc: "Navi Mumbai, Panvel", discom: "Mumbai Distribution", block: "Panvel" },
    { loc: "Thane District", discom: "Mumbai Distribution", block: "Thane" },
    { loc: "Andheri, Mumbai", discom: "Mumbai Distribution", block: "Andheri" },
    { loc: "MSEDCL Nagpur", discom: "MSEDCL", block: "Nagpur" },
    { loc: "Ajmer Solar Park", discom: "Ajmer DISCOM", block: "Ajmer" },
    { loc: "Vashi Industrial", discom: "Mumbai Distribution", block: "Vashi" },
  ];
  const titles: Record<AlertType, string[]> = {
    storm: ["Severe Thunderstorm Warning", "Cyclonic Storm Alert", "Monsoon Burst Warning", "Squall Line Alert"],
    wind: ["High Wind Advisory", "Wind Shear Warning", "Dust Storm Alert", "Moderate Wind Advisory"],
    heat: ["Heat Wave Alert", "Extreme Temperature Warning", "Transformer Overload Risk", "Cooling System Alert"],
    lightning: ["Lightning Activity Detected", "Ground Strike Alert", "EHV Line Lightning Risk", "Close-Range Lightning"],
    fog: ["Dense Fog Advisory", "Fog Advisory Cleared", "Low Visibility Alert", "Radiation Fog Warning"],
    flood: ["Flash Flood Watch", "Urban Flooding Alert", "River Level Warning", "Sub-station Inundation Risk"],
    humidity: ["Humidity Spike — Corrosion Risk", "Dew Point Advisory", "Condensation Warning", "Equipment Moisture Alert"],
    equipment: ["Sensor Recalibration Complete", "Equipment Fault Cleared", "Relay Trip — Weather Related", "Insulator Flashover Alert"],
  };
  const sources = ["IMD", "Tomorrow.io", "AWS Network", "SCADA"];
  const people = ["Rajiv Sharma", "Priya Mehta", "Arun Desai", "Suresh Kumar", "Ananya Patel", "Vikram Singh", "Deepak Rao", null];
  const rootCauses: Array<"weather" | "equipment" | "grid" | "human_error" | "external" | "unknown"> = [
    "weather", "weather", "equipment", "grid", "human_error", "external", "unknown"
  ];

  const records: HistoryRecord[] = [];
  const now = new Date("2026-02-11T14:00:00Z");

  for (let i = 0; i < 68; i++) {
    const hoursAgo = Math.floor(Math.random() * 168); // up to 7 days
    const issued = new Date(now.getTime() - hoursAgo * 3600000);
    const dur = Math.floor(15 + Math.random() * 480); // 15 min to 8 hours
    const resolved = new Date(issued.getTime() + dur * 60000);

    const sevIdx = Math.random() < 0.12 ? 0 : Math.random() < 0.25 ? 1 : Math.random() < 0.55 ? 2 : Math.random() < 0.8 ? 3 : 4;
    const sev = severities[sevIdx];
    const typ = types[Math.floor(Math.random() * types.length)];
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const titlesForType = titles[typ];

    // Sparkline: 8 values representing severity intensity over alert lifecycle
    const sparkline = Array.from({ length: 8 }, (_, j) => {
      const phase = j / 7;
      const peak = 0.3 + Math.random() * 0.3;
      const val = phase < peak
        ? 20 + (80 * phase / peak) + (Math.random() - 0.5) * 15
        : 100 - (80 * (phase - peak) / (1 - peak)) + (Math.random() - 0.5) * 15;
      return Math.max(5, Math.min(100, Math.round(val)));
    });

    records.push({
      id: `HIS-${String(i + 1).padStart(3, "0")}`,
      severity: sev,
      type: typ,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      title: titlesForType[Math.floor(Math.random() * titlesForType.length)],
      description: `Auto-generated historical alert for ${loc.loc}. Duration: ${dur} minutes.`,
      location: loc.loc,
      discom: loc.discom,
      block: loc.block,
      source: sources[Math.floor(Math.random() * sources.length)],
      issuedAtUTC: issued.toISOString().replace("T", " ").slice(0, 16) + " UTC",
      issuedAtLocal: issued.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }),
      resolvedAt: resolved < now
        ? resolved.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Kolkata",
          })
        : null,
      acknowledgedBy: people[Math.floor(Math.random() * people.length)],
      durationMin: dur,
      sparkline,
      rootCause: rootCauses[Math.floor(Math.random() * rootCauses.length)],
      dayOfWeek: issued.getDay(),
      hourOfDay: issued.getHours(),
    });
  }

  // Sort by most recent first
  records.sort((a, b) => {
    const ta = new Date(a.issuedAtUTC.replace(" UTC", "Z")).getTime();
    const tb = new Date(b.issuedAtUTC.replace(" UTC", "Z")).getTime();
    return tb - ta;
  });

  return records;
}

export const HISTORY_RECORDS: HistoryRecord[] = buildHistory();