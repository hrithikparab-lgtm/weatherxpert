import {
  FileText,
  Download,
  Eye,
  Thermometer,
  Activity,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  FileSpreadsheet,
} from "lucide-react";

type ReportTypeKey =
  | "executive-summary"
  | "location-performance"
  | "provider-accuracy"
  | "risk-alert"
  | "forecast-vs-historical";

type ReportFormat = "excel" | "csv";
type LocationKey = "all" | "colaba" | "andheri" | "borivali" | "kurla" | "bandra";
type DateRange = "7days" | "30days" | "custom";

const LOCATIONS = [
  { key: "all" as LocationKey, name: "All Locations" },
  { key: "colaba" as LocationKey, name: "Colaba Substation" },
  { key: "andheri" as LocationKey, name: "Andheri Substation" },
  { key: "borivali" as LocationKey, name: "Borivali Substation" },
  { key: "kurla" as LocationKey, name: "Kurla Substation" },
  { key: "bandra" as LocationKey, name: "Bandra Substation" },
];

interface ReportsTabProps {
  reportTypeKey: ReportTypeKey;
  setReportTypeKey: (type: ReportTypeKey) => void;
  reportGenerated: boolean;
  setReportGenerated: (val: boolean) => void;
  location: LocationKey;
  dateRange: DateRange;
  activeUtility: string;
  role: string;
  canViewOnly: boolean;
  setReportFormat: (format: ReportFormat) => void;
  generateReport: () => void;
}

export function ReportsTab({
  reportTypeKey,
  setReportTypeKey,
  reportGenerated,
  setReportGenerated,
  location,
  dateRange,
  activeUtility,
  role,
  canViewOnly,
  setReportFormat,
  generateReport,
}: ReportsTabProps) {
  if (canViewOnly) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">View & Download Only</h3>
        <p className="text-[13px] text-muted-foreground text-center max-w-md">
          Your role (Operator) allows viewing and downloading reports only. Contact an Admin or Super
          Admin to generate new reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Type Selection - Horizontal Segmented Control */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 bg-muted/50 rounded-lg p-1.5">
          {[
            { key: "executive-summary" as ReportTypeKey, label: "Daily Summary" },
            { key: "provider-accuracy" as ReportTypeKey, label: "Forecast Report" },
            { key: "risk-alert" as ReportTypeKey, label: "Alerts & Incidents" },
            { key: "forecast-vs-historical" as ReportTypeKey, label: "Monthly Overview" },
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => {
                setReportTypeKey(type.key);
                setReportGenerated(true);
              }}
              className={`px-5 py-2 text-[13px] font-medium rounded-md transition-all ${
                reportTypeKey === type.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Export Actions - Top Right */}
        {reportGenerated && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setReportFormat("excel");
                generateReport();
              }}
              className="px-4 py-2 bg-card border border-border rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Excel
            </button>
          </div>
        )}
      </div>

      {/* Report Preview Panel */}
      {reportGenerated && (
        <div className="bg-card rounded-[16px] border border-border overflow-hidden">
          {/* A. Report Header Block */}
          <div className="px-6 py-5 border-b border-border bg-muted/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {reportTypeKey === "executive-summary" && "Daily Weather Summary Report"}
                  {reportTypeKey === "provider-accuracy" && "7-Day Forecast Report"}
                  {reportTypeKey === "risk-alert" && "Alerts & Incidents Report"}
                  {reportTypeKey === "forecast-vs-historical" && "Monthly Weather Overview"}
                </h2>
                <div className="text-[13px] text-muted-foreground">
                  {LOCATIONS.find((l) => l.key === location)?.name} • {activeUtility}
                </div>
              </div>
              <div className="text-right text-[12px] text-muted-foreground">
                <div className="font-medium">Generated On</div>
                <div>
                  {new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="mt-1">
                  By: <span className="capitalize">{role}</span>
                </div>
              </div>
            </div>
            <div className="text-[12px] text-muted-foreground">
              Date Range:{" "}
              {dateRange === "7days"
                ? "Last 7 Days"
                : dateRange === "30days"
                ? "Last 30 Days"
                : "Custom Range"}
            </div>
          </div>

          {/* B. Executive Summary Section */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide mb-3">
              Executive Summary
            </h3>
            <div className="space-y-2 text-[13px] text-foreground/90 leading-relaxed">
              {reportTypeKey === "executive-summary" && (
                <>
                  <p>
                    <strong>Weather Overview:</strong> Temperature averaged 33.9°C across monitored
                    substations with stable conditions. Minimal rainfall recorded (2.3mm total). Wind
                    speeds remained moderate at 12-18 km/h.
                  </p>
                  <p>
                    <strong>Risk Highlight:</strong> No critical weather events detected. Low-risk
                    advisory maintained across all locations. Grid operations remain unaffected by
                    weather conditions.
                  </p>
                  <p>
                    <strong>Advisory:</strong> Continue standard monitoring protocols. No immediate
                    action required. Next review scheduled in 24 hours.
                  </p>
                </>
              )}
              {reportTypeKey === "provider-accuracy" && (
                <>
                  <p>
                    <strong>Forecast Overview:</strong> 7-day forecast indicates stable temperature
                    patterns (32-36°C range). Low probability of precipitation (15% avg). Clear skies
                    expected for next 5 days.
                  </p>
                  <p>
                    <strong>Key Observation:</strong> Tomorrow.io demonstrates highest accuracy
                    (97.2%) for Mumbai region forecasts. IMD maintains consistent performance for
                    short-term predictions.
                  </p>
                  <p>
                    <strong>Advisory:</strong> Operational planning can proceed with high confidence.
                    No weather-related disruptions anticipated for grid maintenance schedules.
                  </p>
                </>
              )}
              {reportTypeKey === "risk-alert" && (
                <>
                  <p>
                    <strong>Alert Summary:</strong> 23 total alerts generated in the reporting
                    period. 3 critical-level alerts resolved within SLA. Average response time: 12
                    minutes.
                  </p>
                  <p>
                    <strong>Critical Events:</strong> High wind advisory (Feb 18) at Kurla Substation
                    - resolved. Temperature threshold breach (Feb 19) at Borivali - under observation.
                  </p>
                  <p>
                    <strong>Advisory:</strong> Maintain heightened monitoring for Kurla and Borivali
                    locations. Review threshold parameters for false-positive reduction.
                  </p>
                </>
              )}
              {reportTypeKey === "forecast-vs-historical" && (
                <>
                  <p>
                    <strong>Monthly Trends:</strong> Average temperature increased 1.2°C compared to
                    previous month. Rainfall deficit of 18% observed. Overall weather stability
                    improved by 8%.
                  </p>
                  <p>
                    <strong>Performance Analysis:</strong> Provider accuracy maintained above 95%
                    threshold. Forecast vs actual deviation reduced to 0.4°C average across all
                    locations.
                  </p>
                  <p>
                    <strong>Advisory:</strong> Weather conditions favorable for scheduled
                    infrastructure upgrades. Continue monthly accuracy benchmarking.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* C. Data Summary Section - Cards Row */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide mb-4">
              Key Metrics
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {reportTypeKey === "executive-summary" && (
                <>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-primary" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Avg Temperature
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">33.9°C</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      Within normal range
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Total Rainfall
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">2.3mm</div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      Minimal precipitation
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Wind Speed
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">15 km/h</div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      Moderate conditions
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Risk Level
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      Low
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      All clear status
                    </div>
                  </div>
                </>
              )}
              {reportTypeKey === "provider-accuracy" && (
                <>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-primary" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        7-Day Avg Temp
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">34.2°C</div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      Range: 32-36°C
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Rain Probability
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">15%</div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      Low chance
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Extreme Alert
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      No warnings
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Advisory Level
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      Normal
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      Standard ops
                    </div>
                  </div>
                </>
              )}
              {reportTypeKey === "risk-alert" && (
                <>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Total Alerts
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">23</div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      Last 30 days
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-red-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Critical Alerts
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">3</div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      All resolved
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Avg Response Time
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">12 min</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      Within SLA
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Resolved %
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      100%
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      All cleared
                    </div>
                  </div>
                </>
              )}
              {reportTypeKey === "forecast-vs-historical" && (
                <>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Avg Risk Score
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">2.3</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      Low risk month
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-amber-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Total Events
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">47</div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      February 2026
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Most Affected Zone
                      </span>
                    </div>
                    <div className="text-lg font-bold text-foreground">Kurla</div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      14 events logged
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                        Trend Indicator
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      Improving
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-1">
                      +8% stability
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* D. Data Table Section */}
          <div className="px-6 py-5">
            <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wide mb-4">
              {reportTypeKey === "executive-summary" && "Daily Weather Data"}
              {reportTypeKey === "provider-accuracy" && "7-Day Forecast Breakdown"}
              {reportTypeKey === "risk-alert" && "Alert Log"}
              {reportTypeKey === "forecast-vs-historical" && "Monthly Performance Summary"}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    {reportTypeKey === "executive-summary" && (
                      <>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">
                          Temp (°C)
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">
                          Rainfall (mm)
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">
                          Wind (km/h)
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">
                          Risk Level
                        </th>
                      </>
                    )}
                    {reportTypeKey === "provider-accuracy" && (
                      <>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">
                          Temp High/Low
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">
                          Rain Probability
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">
                          Wind Speed
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">
                          Advisory
                        </th>
                      </>
                    )}
                    {reportTypeKey === "risk-alert" && (
                      <>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                          Alert Type
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">
                          Severity
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">
                          Location
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">
                          Status
                        </th>
                      </>
                    )}
                    {reportTypeKey === "forecast-vs-historical" && (
                      <>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Week</th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">
                          Avg Temp (°C)
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">
                          Rainfall (mm)
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-foreground">
                          Events
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-foreground">
                          Trend
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportTypeKey === "executive-summary" &&
                    [
                      {
                        date: "Feb 20, 2026",
                        temp: "36.2",
                        rain: "0.0",
                        wind: "18",
                        risk: "Low",
                      },
                      {
                        date: "Feb 19, 2026",
                        temp: "35.4",
                        rain: "0.5",
                        wind: "15",
                        risk: "Low",
                      },
                      {
                        date: "Feb 18, 2026",
                        temp: "33.1",
                        rain: "1.2",
                        wind: "12",
                        risk: "Low",
                      },
                      {
                        date: "Feb 17, 2026",
                        temp: "31.9",
                        rain: "0.6",
                        wind: "14",
                        risk: "Low",
                      },
                      {
                        date: "Feb 16, 2026",
                        temp: "34.2",
                        rain: "0.0",
                        wind: "16",
                        risk: "Low",
                      },
                      {
                        date: "Feb 15, 2026",
                        temp: "33.8",
                        rain: "0.0",
                        wind: "13",
                        risk: "Low",
                      },
                      {
                        date: "Feb 14, 2026",
                        temp: "32.5",
                        rain: "0.0",
                        wind: "11",
                        risk: "Low",
                      },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-border/30 last:border-0 ${
                          idx % 2 === 1 ? "bg-muted/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{row.date}</td>
                        <td className="px-4 py-3 text-right text-foreground">{row.temp}</td>
                        <td className="px-4 py-3 text-right text-foreground">{row.rain}</td>
                        <td className="px-4 py-3 text-right text-foreground">{row.wind}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {row.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {reportTypeKey === "provider-accuracy" &&
                    [
                      {
                        date: "Feb 21, 2026",
                        temp: "33/25",
                        rain: "10%",
                        wind: "14 km/h",
                        advisory: "Normal",
                      },
                      {
                        date: "Feb 22, 2026",
                        temp: "34/26",
                        rain: "15%",
                        wind: "16 km/h",
                        advisory: "Normal",
                      },
                      {
                        date: "Feb 23, 2026",
                        temp: "35/27",
                        rain: "20%",
                        wind: "18 km/h",
                        advisory: "Monitor",
                      },
                      {
                        date: "Feb 24, 2026",
                        temp: "36/28",
                        rain: "12%",
                        wind: "15 km/h",
                        advisory: "Normal",
                      },
                      {
                        date: "Feb 25, 2026",
                        temp: "34/26",
                        rain: "8%",
                        wind: "13 km/h",
                        advisory: "Normal",
                      },
                      {
                        date: "Feb 26, 2026",
                        temp: "33/25",
                        rain: "5%",
                        wind: "12 km/h",
                        advisory: "Normal",
                      },
                      {
                        date: "Feb 27, 2026",
                        temp: "32/24",
                        rain: "18%",
                        wind: "17 km/h",
                        advisory: "Normal",
                      },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-border/30 last:border-0 ${
                          idx % 2 === 1 ? "bg-muted/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{row.date}</td>
                        <td className="px-4 py-3 text-right text-foreground">{row.temp}</td>
                        <td className="px-4 py-3 text-right text-foreground">{row.rain}</td>
                        <td className="px-4 py-3 text-right text-foreground">{row.wind}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              row.advisory === "Monitor"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {row.advisory}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {reportTypeKey === "risk-alert" &&
                    [
                      {
                        date: "Feb 19, 2026",
                        type: "Temperature Threshold",
                        severity: "Critical",
                        location: "Borivali Substation",
                        status: "Resolved",
                      },
                      {
                        date: "Feb 18, 2026",
                        type: "High Wind",
                        severity: "Critical",
                        location: "Kurla Substation",
                        status: "Resolved",
                      },
                      {
                        date: "Feb 17, 2026",
                        type: "Humidity Alert",
                        severity: "Medium",
                        location: "Colaba Substation",
                        status: "Resolved",
                      },
                      {
                        date: "Feb 16, 2026",
                        type: "Temperature Spike",
                        severity: "Low",
                        location: "Andheri Substation",
                        status: "Resolved",
                      },
                      {
                        date: "Feb 15, 2026",
                        type: "Rain Forecast",
                        severity: "Medium",
                        location: "Bandra Substation",
                        status: "Resolved",
                      },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-border/30 last:border-0 ${
                          idx % 2 === 1 ? "bg-muted/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{row.date}</td>
                        <td className="px-4 py-3 text-foreground">{row.type}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              row.severity === "Critical"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                : row.severity === "Medium"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {row.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground">{row.location}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {reportTypeKey === "forecast-vs-historical" &&
                    [
                      {
                        week: "Week 1 (Feb 1-7)",
                        temp: "32.8",
                        rain: "5.2",
                        events: "8",
                        trend: "Stable",
                      },
                      {
                        week: "Week 2 (Feb 8-14)",
                        temp: "33.5",
                        rain: "3.1",
                        events: "12",
                        trend: "Improving",
                      },
                      {
                        week: "Week 3 (Feb 15-20)",
                        temp: "34.2",
                        rain: "2.3",
                        events: "11",
                        trend: "Improving",
                      },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-border/30 last:border-0 ${
                          idx % 2 === 1 ? "bg-muted/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{row.week}</td>
                        <td className="px-4 py-3 text-right text-foreground">{row.temp}</td>
                        <td className="px-4 py-3 text-right text-foreground">{row.rain}</td>
                        <td className="px-4 py-3 text-right text-foreground">{row.events}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              row.trend === "Improving"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {row.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}