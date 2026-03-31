/* ═══════════════════════════════════════════════════
   MAP DATA — Stations, alerts, layers, cluster logic
   Centralized data for the geospatial page
   ═══════════════════════════════════════════════════ */

export type MarkerType = "station" | "alert" | "cluster";
export type StationStatus = "normal" | "warning" | "critical" | "offline";
export type LayerId =
  | "satellite"
  | "cloud"
  | "wind"
  | "rain"
  | "cyclone"
  | "stations"
  | "heatmap"
  | "blocks"
  | "circles";

export interface StationRecord {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Percent position on our SVG map canvas */
  x: number;
  y: number;
  type: "thermal" | "solar" | "wind" | "hydro" | "substation" | "weather";
  status: StationStatus;
  temp: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  condition: string;
  activeAlerts: number;
  discom: string;
  forecastHigh: number;
  forecastLow: number;
  forecastCondition: string;
}

export interface AlertMarker {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  stationId: string;
}

export interface MapLayer {
  id: LayerId;
  label: string;
  group: "base" | "weather" | "overlay";
  description: string;
}

// ── Layers ──
export const MAP_LAYERS: MapLayer[] = [
  { id: "satellite", label: "Satellite", group: "base", description: "High-res satellite imagery" },
  { id: "cloud", label: "Cloud Cover", group: "weather", description: "Real-time cloud density overlay" },
  { id: "wind", label: "Wind Vector", group: "weather", description: "Wind direction & speed arrows" },
  { id: "rain", label: "Rain Accumulation", group: "weather", description: "Cumulative rainfall heatmap" },
  { id: "cyclone", label: "Cyclone Tracker", group: "weather", description: "Active cyclone paths & cones" },
  { id: "stations", label: "Stations", group: "base", description: "All TATA Power stations" },
  { id: "heatmap", label: "Heatmap", group: "overlay", description: "Temperature density heatmap" },
  { id: "blocks", label: "Block Boundaries", group: "overlay", description: "Administrative block outlines" },
  { id: "circles", label: "Coverage Circles", group: "overlay", description: "Station coverage radius" },
];

// ── Stations ──
export const STATIONS: StationRecord[] = [
  {
    id: "STN-001", name: "Mumbai Distribution HQ", lat: 19.07, lng: 72.87,
    x: 31.5, y: 54, type: "substation", status: "warning",
    temp: 34, humidity: 82, windSpeed: 18, rainfall: 12,
    condition: "Partly Cloudy", activeAlerts: 2, discom: "Mumbai Distribution",
    forecastHigh: 36, forecastLow: 27, forecastCondition: "Thunderstorms likely",
  },
  {
    id: "STN-002", name: "Delhi Distribution", lat: 28.61, lng: 77.21,
    x: 42, y: 26, type: "substation", status: "critical",
    temp: 44, humidity: 28, windSpeed: 12, rainfall: 0,
    condition: "Clear & Hot", activeAlerts: 3, discom: "Delhi Distribution",
    forecastHigh: 46, forecastLow: 32, forecastCondition: "Extreme heat continues",
  },
  {
    id: "STN-003", name: "Jaisalmer Wind Farm", lat: 26.92, lng: 70.91,
    x: 26, y: 32, type: "wind", status: "warning",
    temp: 38, humidity: 22, windSpeed: 58, rainfall: 0,
    condition: "Windy & Hot", activeAlerts: 1, discom: "Jaisalmer Wind Farm",
    forecastHigh: 40, forecastLow: 28, forecastCondition: "Sustained high winds",
  },
  {
    id: "STN-004", name: "Charanka Solar Park", lat: 23.57, lng: 71.36,
    x: 28, y: 40, type: "solar", status: "normal",
    temp: 37, humidity: 35, windSpeed: 8, rainfall: 0,
    condition: "Sunny", activeAlerts: 0, discom: "Ajmer DISCOM",
    forecastHigh: 39, forecastLow: 26, forecastCondition: "Clear skies ahead",
  },
  {
    id: "STN-005", name: "Mundra UMPP", lat: 22.84, lng: 69.73,
    x: 23, y: 43, type: "thermal", status: "normal",
    temp: 36, humidity: 55, windSpeed: 14, rainfall: 0,
    condition: "Overcast", activeAlerts: 0, discom: "Mundra UMPP",
    forecastHigh: 38, forecastLow: 27, forecastCondition: "Cloudy, no rain",
  },
  {
    id: "STN-006", name: "Maithon Power Station", lat: 23.77, lng: 86.82,
    x: 63, y: 38, type: "thermal", status: "warning",
    temp: 33, humidity: 78, windSpeed: 22, rainfall: 35,
    condition: "Thunderstorm", activeAlerts: 1, discom: "MSEDCL",
    forecastHigh: 34, forecastLow: 25, forecastCondition: "Heavy rain expected",
  },
  {
    id: "STN-007", name: "Trombay Thermal", lat: 19.01, lng: 72.91,
    x: 32, y: 55.5, type: "thermal", status: "normal",
    temp: 33, humidity: 80, windSpeed: 15, rainfall: 5,
    condition: "Humid", activeAlerts: 0, discom: "Mumbai Distribution",
    forecastHigh: 35, forecastLow: 27, forecastCondition: "Light showers",
  },
  {
    id: "STN-008", name: "Kalinganagar Steel", lat: 20.93, lng: 85.92,
    x: 60, y: 47, type: "substation", status: "normal",
    temp: 31, humidity: 72, windSpeed: 10, rainfall: 8,
    condition: "Light Rain", activeAlerts: 0, discom: "MSEDCL",
    forecastHigh: 33, forecastLow: 24, forecastCondition: "Clearing up",
  },
  {
    id: "STN-009", name: "Haldia Power", lat: 22.04, lng: 88.06,
    x: 66, y: 43, type: "thermal", status: "normal",
    temp: 32, humidity: 80, windSpeed: 16, rainfall: 10,
    condition: "Overcast", activeAlerts: 0, discom: "MSEDCL",
    forecastHigh: 34, forecastLow: 26, forecastCondition: "Intermittent rain",
  },
  {
    id: "STN-010", name: "Belgaum AWS Station", lat: 15.85, lng: 74.50,
    x: 31, y: 63, type: "weather", status: "normal",
    temp: 28, humidity: 65, windSpeed: 8, rainfall: 2,
    condition: "Partly Cloudy", activeAlerts: 0, discom: "MSEDCL",
    forecastHigh: 30, forecastLow: 22, forecastCondition: "Mild conditions",
  },
  {
    id: "STN-011", name: "Nagpur Substation", lat: 21.15, lng: 79.09,
    x: 48, y: 47, type: "substation", status: "normal",
    temp: 38, humidity: 40, windSpeed: 10, rainfall: 0,
    condition: "Hot & Dry", activeAlerts: 0, discom: "MSEDCL",
    forecastHigh: 41, forecastLow: 28, forecastCondition: "Heat advisory",
  },
  {
    id: "STN-012", name: "Kayamkulam Thermal", lat: 9.17, lng: 76.50,
    x: 35, y: 80, type: "thermal", status: "normal",
    temp: 30, humidity: 88, windSpeed: 6, rainfall: 15,
    condition: "Humid & Rainy", activeAlerts: 0, discom: "MSEDCL",
    forecastHigh: 31, forecastLow: 24, forecastCondition: "Monsoon rains",
  },
  {
    id: "STN-013", name: "Bhopal Weather Hub", lat: 23.26, lng: 77.41,
    x: 43, y: 39, type: "weather", status: "normal",
    temp: 35, humidity: 50, windSpeed: 12, rainfall: 0,
    condition: "Clear", activeAlerts: 0, discom: "MSEDCL",
    forecastHigh: 38, forecastLow: 26, forecastCondition: "Warming trend",
  },
  {
    id: "STN-014", name: "Jodhpur Solar", lat: 26.29, lng: 73.02,
    x: 27.5, y: 33, type: "solar", status: "normal",
    temp: 40, humidity: 20, windSpeed: 15, rainfall: 0,
    condition: "Sunny & Hot", activeAlerts: 0, discom: "Ajmer DISCOM",
    forecastHigh: 43, forecastLow: 29, forecastCondition: "Extreme heat",
  },
  {
    id: "STN-015", name: "Vizag Port Station", lat: 17.69, lng: 83.22,
    x: 56, y: 56, type: "substation", status: "normal",
    temp: 32, humidity: 75, windSpeed: 20, rainfall: 3,
    condition: "Breezy", activeAlerts: 0, discom: "MSEDCL",
    forecastHigh: 34, forecastLow: 26, forecastCondition: "Coastal breeze",
  },
  {
    id: "STN-016", name: "Chennai AWS", lat: 13.08, lng: 80.27,
    x: 50, y: 70, type: "weather", status: "normal",
    temp: 35, humidity: 70, windSpeed: 14, rainfall: 0,
    condition: "Hot & Humid", activeAlerts: 0, discom: "MSEDCL",
    forecastHigh: 37, forecastLow: 28, forecastCondition: "Haze",
  },
];

// ── Alert markers (overlaid on stations) ──
export const ALERT_MARKERS: AlertMarker[] = [
  { id: "AM-001", severity: "critical", title: "Severe Storm Warning", x: 31.5, y: 53, lat: 19.07, lng: 72.87, stationId: "STN-001" },
  { id: "AM-002", severity: "high", title: "Humidity Spike Alert", x: 33, y: 55, lat: 19.05, lng: 72.84, stationId: "STN-001" },
  { id: "AM-003", severity: "critical", title: "Extreme Heat Warning", x: 42, y: 25, lat: 28.61, lng: 77.21, stationId: "STN-002" },
  { id: "AM-004", severity: "high", title: "Grid Frequency Drop", x: 43.5, y: 27, lat: 28.63, lng: 77.23, stationId: "STN-002" },
  { id: "AM-005", severity: "medium", title: "Transformer Overheat", x: 41, y: 27.5, lat: 28.59, lng: 77.18, stationId: "STN-002" },
  { id: "AM-006", severity: "high", title: "Wind Curtailment Alert", x: 26, y: 31, lat: 26.92, lng: 70.91, stationId: "STN-003" },
  { id: "AM-007", severity: "medium", title: "Lightning Proximity", x: 63.5, y: 37, lat: 23.77, lng: 86.82, stationId: "STN-006" },
];

// ── Cluster helpers ──
export interface MarkerCluster {
  id: string;
  x: number;
  y: number;
  count: number;
  worstSeverity: StationStatus;
  items: StationRecord[];
}

const CLUSTER_RADIUS = 5; // % distance to cluster

export function clusterStations(stations: StationRecord[], zoomLevel: number): (StationRecord | MarkerCluster)[] {
  if (zoomLevel >= 1.3) return stations; // No clustering at higher zoom

  const used = new Set<string>();
  const result: (StationRecord | MarkerCluster)[] = [];

  for (const station of stations) {
    if (used.has(station.id)) continue;

    const nearby = stations.filter(
      (s) =>
        !used.has(s.id) &&
        s.id !== station.id &&
        Math.hypot(s.x - station.x, s.y - station.y) < CLUSTER_RADIUS
    );

    if (nearby.length === 0) {
      result.push(station);
      used.add(station.id);
    } else {
      const clusterItems = [station, ...nearby];
      clusterItems.forEach((s) => used.add(s.id));

      const avgX = clusterItems.reduce((sum, s) => sum + s.x, 0) / clusterItems.length;
      const avgY = clusterItems.reduce((sum, s) => sum + s.y, 0) / clusterItems.length;

      const severityPriority: Record<StationStatus, number> = { critical: 0, warning: 1, normal: 2, offline: 3 };
      const worst = clusterItems.reduce((w, s) =>
        severityPriority[s.status] < severityPriority[w] ? s.status : w,
        "offline" as StationStatus
      );

      result.push({
        id: `cluster-${station.id}`,
        x: avgX,
        y: avgY,
        count: clusterItems.length,
        worstSeverity: worst,
        items: clusterItems,
      });
    }
  }

  return result;
}

export function isCluster(item: StationRecord | MarkerCluster): item is MarkerCluster {
  return "count" in item;
}

// ── Timeline data ──
export const TIME_STEPS = ["Now", "+1h", "+2h", "+3h", "+4h", "+5h", "+6h"];
export const PLAYBACK_SPEEDS = [
  { label: "2 hrs", hours: 2, steps: 4 },
  { label: "4 hrs", hours: 4, steps: 8 },
  { label: "6 hrs", hours: 6, steps: 12 },
];

// ── Station type icons (for reference) ──
export const STATION_TYPE_LABELS: Record<StationRecord["type"], string> = {
  thermal: "Thermal Plant",
  solar: "Solar Park",
  wind: "Wind Farm",
  hydro: "Hydro Station",
  substation: "Substation",
  weather: "AWS Station",
};
