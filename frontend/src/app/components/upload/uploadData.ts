/* ═══════════════════════════════════════════════════
   DATA UPLOAD — Types, templates, mock data,
   validation rules, version history
   ═══════════════════════════════════════════════════ */

export type UploadStage = "idle" | "uploading" | "preview" | "validating" | "committed";

export type FileFormat = "csv" | "xlsx" | "json";

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  format: FileFormat;
  columns: string[];
  sizeHint: string;
}

export interface SystemField {
  id: string;
  label: string;
  required: boolean;
  type: "timestamp" | "number" | "string" | "enum";
  description: string;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string | null;       // null = unmapped
}

export interface ValidationIssue {
  type: "error" | "warning";
  row?: number;
  column?: string;
  message: string;
  suggestion?: string;
}

export interface UploadHistoryEntry {
  id: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  rows: number;
  station: string;
  discom: string;
  status: "committed" | "rolled_back" | "pending";
  version: number;
  errors: number;
  warnings: number;
}

export interface ParsedRow {
  [key: string]: string | number | null;
}

// ── DISCOMs & Stations ──
export const DISCOMS = [
  "TATA Power Mumbai",
  "TATA Power Delhi",
  "TATA Power Renewables",
  "Mundra UMPP",
  "Maithon Power",
];

export const STATIONS: Record<string, string[]> = {
  "TATA Power Mumbai": ["Trombay AWS", "Colaba AWS", "Powai AWS", "Borivali AWS", "Navi Mumbai AWS"],
  "TATA Power Delhi": ["Connaught Place AWS", "Dwarka AWS", "Noida Edge AWS", "Gurgaon AWS"],
  "TATA Power Renewables": ["Jaisalmer Wind Farm", "Charanka Solar Park", "Kayathar Wind Farm"],
  "Mundra UMPP": ["Mundra Port AWS", "Mundra Plant AWS"],
  "Maithon Power": ["Maithon Dam AWS", "Maithon Plant AWS"],
};

// ── System fields (target columns) ──
export const SYSTEM_FIELDS: SystemField[] = [
  { id: "timestamp",     label: "Timestamp",           required: true,  type: "timestamp", description: "ISO 8601 date-time or DD/MM/YYYY HH:mm" },
  { id: "temperature",   label: "Temperature (°C)",    required: false, type: "number",    description: "Ambient temperature in Celsius" },
  { id: "humidity",      label: "Rel. Humidity (%)",    required: false, type: "number",    description: "Relative humidity percentage" },
  { id: "wind_speed",    label: "Wind Speed (km/h)",   required: false, type: "number",    description: "Sustained wind speed" },
  { id: "wind_dir",      label: "Wind Direction (°)",   required: false, type: "number",    description: "Wind direction in degrees (0-360)" },
  { id: "rainfall",      label: "Rainfall (mm)",       required: false, type: "number",    description: "Accumulated rainfall" },
  { id: "pressure",      label: "Pressure (hPa)",      required: false, type: "number",    description: "Barometric pressure" },
  { id: "solar_irr",     label: "Solar Irr. (W/m²)",   required: false, type: "number",    description: "Global horizontal irradiance" },
  { id: "visibility",    label: "Visibility (km)",     required: false, type: "number",    description: "Horizontal visibility" },
  { id: "cloud_cover",   label: "Cloud Cover (%)",     required: false, type: "number",    description: "Sky cloud coverage percentage" },
  { id: "station_id",    label: "Station ID",          required: false, type: "string",    description: "Unique station identifier" },
  { id: "data_quality",  label: "Quality Flag",        required: false, type: "enum",      description: "good | interpolated | suspect | missing" },
];

// ── Sample templates ──
export const TEMPLATES: TemplateInfo[] = [
  {
    id: "tpl-weather-obs",
    name: "Weather Observations",
    description: "Hourly station observations — temperature, humidity, wind, rainfall",
    format: "csv",
    columns: ["Timestamp", "StationID", "Temperature_C", "Humidity_pct", "WindSpeed_kmh", "WindDir_deg", "Rainfall_mm", "Pressure_hPa"],
    sizeHint: "~2 KB",
  },
  {
    id: "tpl-solar-data",
    name: "Solar Irradiance Data",
    description: "15-min resolution GHI, DHI, DNI readings from pyranometers",
    format: "csv",
    columns: ["Timestamp", "StationID", "GHI_Wm2", "DHI_Wm2", "DNI_Wm2", "ModuleTemp_C", "AmbientTemp_C"],
    sizeHint: "~1.5 KB",
  },
  {
    id: "tpl-wind-data",
    name: "Wind Farm Data",
    description: "10-min wind speed at hub height, direction, power output",
    format: "xlsx",
    columns: ["Timestamp", "TurbineID", "WindSpeed_80m", "WindDir_deg", "PowerOutput_kW", "AmbientTemp_C"],
    sizeHint: "~3 KB",
  },
  {
    id: "tpl-forecast-verify",
    name: "Forecast Verification",
    description: "Paired forecast vs actual values for accuracy analysis",
    format: "csv",
    columns: ["Timestamp", "Parameter", "Forecast_Value", "Actual_Value", "Provider", "Region"],
    sizeHint: "~1 KB",
  },
];

// ── Simulated parsed file data ──
export function generateMockParsedData(): { headers: string[]; rows: ParsedRow[] } {
  const headers = ["Date_Time", "Station", "Temp", "RH", "WS", "WD", "Rain", "Press", "Quality"];
  const stations = ["TROM-01", "COLA-02", "POWA-03"];
  const qualities = ["good", "good", "good", "good", "interpolated", "good", "suspect", "good"];
  const rows: ParsedRow[] = [];

  const baseDate = new Date(2026, 1, 10, 0, 0);
  for (let i = 0; i < 24; i++) {
    const ts = new Date(baseDate.getTime() + i * 3600000);
    const hour = ts.getHours();
    const diurnal = Math.sin(((hour - 6) / 12) * Math.PI);

    rows.push({
      Date_Time: ts.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }),
      Station: stations[i % 3],
      Temp: i === 14 ? null : Math.round((32 + diurnal * 5 + (Math.random() - 0.5) * 2) * 10) / 10,
      RH: Math.round(65 - diurnal * 15 + (Math.random() - 0.5) * 8),
      WS: Math.round((15 + Math.random() * 12) * 10) / 10,
      WD: Math.round(Math.random() * 360),
      Rain: i === 18 || i === 19 ? Math.round(Math.random() * 8 * 10) / 10 : 0,
      Press: Math.round((1012 + (Math.random() - 0.5) * 4) * 10) / 10,
      Quality: i === 14 ? "missing" : qualities[i % qualities.length],
    });
  }

  return { headers, rows };
}

// ── Auto-mapping suggestions ──
export function suggestMapping(sourceColumns: string[]): ColumnMapping[] {
  const aliases: Record<string, string[]> = {
    timestamp:   ["date_time", "datetime", "timestamp", "time", "date"],
    temperature: ["temp", "temperature", "temperature_c", "temp_c", "ambient_temp", "ambienttemp_c"],
    humidity:    ["rh", "humidity", "humidity_pct", "rel_humidity"],
    wind_speed:  ["ws", "windspeed", "wind_speed", "windspeed_kmh"],
    wind_dir:    ["wd", "winddir", "wind_dir", "winddir_deg", "wind_direction"],
    rainfall:    ["rain", "rainfall", "rainfall_mm", "precip"],
    pressure:    ["press", "pressure", "pressure_hpa", "baro"],
    solar_irr:   ["ghi", "ghi_wm2", "solar", "irradiance", "solar_irr"],
    visibility:  ["vis", "visibility"],
    cloud_cover: ["cloud", "cloud_cover", "cloudcover"],
    station_id:  ["station", "stationid", "station_id", "turbineid"],
    data_quality:["quality", "qc", "data_quality", "flag"],
  };

  return sourceColumns.map((col) => {
    const normalized = col.toLowerCase().replace(/[\s\-]/g, "_");
    let matched: string | null = null;
    for (const [fieldId, aliasList] of Object.entries(aliases)) {
      if (aliasList.includes(normalized)) { matched = fieldId; break; }
    }
    return { sourceColumn: col, targetField: matched };
  });
}

// ── Validation engine ──
export function validateData(rows: ParsedRow[], mappings: ColumnMapping[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tsMapping = mappings.find((m) => m.targetField === "timestamp");

  if (!tsMapping) {
    issues.push({ type: "error", message: "No column mapped to Timestamp — this field is required", suggestion: "Map a date/time column to the Timestamp field" });
  }

  const mappedCount = mappings.filter((m) => m.targetField !== null).length;
  if (mappedCount < 2) {
    issues.push({ type: "warning", message: "Only 1 field mapped — consider mapping additional data columns" });
  }

  rows.forEach((row, idx) => {
    mappings.forEach((mapping) => {
      if (!mapping.targetField) return;
      const val = row[mapping.sourceColumn];
      const field = SYSTEM_FIELDS.find((f) => f.id === mapping.targetField);
      if (!field) return;

      if (val === null || val === "" || val === undefined) {
        if (field.required) {
          issues.push({ type: "error", row: idx + 1, column: mapping.sourceColumn, message: `Required field "${field.label}" is empty`, suggestion: "Fill in or interpolate missing value" });
        } else {
          issues.push({ type: "warning", row: idx + 1, column: mapping.sourceColumn, message: `Optional field "${field.label}" is empty — will be stored as NULL` });
        }
        return;
      }

      if (field.type === "number" && typeof val === "string" && isNaN(Number(val))) {
        issues.push({ type: "error", row: idx + 1, column: mapping.sourceColumn, message: `"${val}" is not a valid number for ${field.label}`, suggestion: "Ensure numeric values contain only digits and decimal points" });
      }

      if (field.id === "temperature" && typeof val === "number" && (val < -50 || val > 65)) {
        issues.push({ type: "warning", row: idx + 1, column: mapping.sourceColumn, message: `Temperature ${val}°C is outside expected range (-50 to 65)`, suggestion: "Verify sensor reading or unit conversion" });
      }
      if (field.id === "humidity" && typeof val === "number" && (val < 0 || val > 100)) {
        issues.push({ type: "error", row: idx + 1, column: mapping.sourceColumn, message: `Humidity ${val}% is out of valid range (0–100)`, suggestion: "Check for sensor calibration errors" });
      }
      if (field.id === "wind_dir" && typeof val === "number" && (val < 0 || val > 360)) {
        issues.push({ type: "error", row: idx + 1, column: mapping.sourceColumn, message: `Wind direction ${val}° must be 0–360`, suggestion: "Normalize direction values using modulo 360" });
      }
    });
  });

  // Duplicate timestamp check
  if (tsMapping) {
    const timestamps = rows.map((r) => r[tsMapping.sourceColumn]);
    const seen = new Set<string | number | null>();
    timestamps.forEach((ts, idx) => {
      const key = String(ts);
      if (seen.has(key)) {
        issues.push({ type: "warning", row: idx + 1, column: tsMapping.sourceColumn, message: `Duplicate timestamp: ${key}`, suggestion: "Remove or merge duplicate rows" });
      }
      seen.add(key);
    });
  }

  return issues;
}

// ── Upload history (mock) ──
export const UPLOAD_HISTORY: UploadHistoryEntry[] = [
  { id: "upl-007", filename: "trombay_obs_feb2026.csv", uploadedAt: "2026-02-10 16:30", uploadedBy: "Priya Sharma", rows: 720, station: "Trombay AWS", discom: "TATA Power Mumbai", status: "committed", version: 3, errors: 0, warnings: 4 },
  { id: "upl-006", filename: "colaba_hourly_jan2026.csv", uploadedAt: "2026-02-08 09:15", uploadedBy: "Rajesh Kumar", rows: 744, station: "Colaba AWS", discom: "TATA Power Mumbai", status: "committed", version: 2, errors: 0, warnings: 12 },
  { id: "upl-005", filename: "jaisalmer_wind_jan.xlsx", uploadedAt: "2026-02-05 14:00", uploadedBy: "Amit Patel", rows: 4464, station: "Jaisalmer Wind Farm", discom: "TATA Power Renewables", status: "committed", version: 1, errors: 0, warnings: 8 },
  { id: "upl-004", filename: "charanka_solar_15min.csv", uploadedAt: "2026-02-03 11:45", uploadedBy: "Priya Sharma", rows: 2880, station: "Charanka Solar Park", discom: "TATA Power Renewables", status: "rolled_back", version: 1, errors: 3, warnings: 22 },
  { id: "upl-003", filename: "delhi_obs_jan_v2.csv", uploadedAt: "2026-01-31 18:20", uploadedBy: "Rajesh Kumar", rows: 744, station: "Connaught Place AWS", discom: "TATA Power Delhi", status: "committed", version: 2, errors: 0, warnings: 6 },
  { id: "upl-002", filename: "delhi_obs_jan.csv", uploadedAt: "2026-01-28 10:00", uploadedBy: "Rajesh Kumar", rows: 744, station: "Connaught Place AWS", discom: "TATA Power Delhi", status: "rolled_back", version: 1, errors: 8, warnings: 15 },
  { id: "upl-001", filename: "mundra_port_dec2025.csv", uploadedAt: "2026-01-15 08:30", uploadedBy: "Amit Patel", rows: 744, station: "Mundra Port AWS", discom: "Mundra UMPP", status: "committed", version: 1, errors: 0, warnings: 2 },
];

// ── Tooltip hints ──
export const ERROR_TOOLTIPS: Record<string, string> = {
  timestamp: "Accepted formats: YYYY-MM-DD HH:mm, DD/MM/YYYY HH:mm, ISO 8601. Ensure consistent timezone (IST preferred).",
  number: "Numeric fields must contain only digits, decimal points, and optional negative signs. Remove units from values.",
  missing: "Missing values will be stored as NULL. Consider using interpolation or gap-fill before uploading.",
  duplicate: "Duplicate timestamps for the same station will overwrite existing data unless versioning is enabled.",
  format: "Supported file types: CSV (.csv), Excel (.xlsx), JSON (.json). Max file size: 50 MB.",
};

// ── Accepted file types ──
export const ACCEPTED_FILE_TYPES: Record<FileFormat, string> = {
  csv: ".csv",
  xlsx: ".xlsx,.xls",
  json: ".json",
};

export const MAX_FILE_SIZE_MB = 50;
