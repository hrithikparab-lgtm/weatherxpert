import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code2,
  ChevronRight,
  Copy,
  Check,
  Zap,
  Cloud,
  AlertTriangle,
  BarChart3,
  Clock,
  Shield,
  Globe,
  Activity,
  Database,
  Wifi,
  Terminal,
  ChevronDown,
  Search,
  Key,
  BookOpen,
  Layers,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   WEATHERXPERT — API DOCUMENTATION PAGE
   Full reference for IMD & Tomorrow.io integrations
   ═══════════════════════════════════════════════════ */

// ── Copy button ──────────────────────────────────
function CopyButton({ text, size = "sm" }: { text: string; size?: "sm" | "xs" }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 text-slate-400 hover:text-white transition-colors ${size === "xs" ? "p-1" : "p-1.5"} rounded`}
      title="Copy"
    >
      {copied ? (
        <Check className={size === "xs" ? "w-3 h-3 text-emerald-400" : "w-3.5 h-3.5 text-emerald-400"} />
      ) : (
        <Copy className={size === "xs" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      )}
    </button>
  );
}

// ── Code block ───────────────────────────────────
function CodeBlock({
  code,
  lang = "json",
  title,
}: {
  code: string;
  lang?: string;
  title?: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 my-3">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 text-xs font-medium">{title}</span>
          </div>
          <CopyButton text={code} size="xs" />
        </div>
      )}
      <pre className="bg-slate-900 p-4 text-xs text-slate-300 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

// ── Method badge ─────────────────────────────────
function MethodBadge({ method }: { method: "GET" | "POST" | "PUT" | "DELETE" | "WS" }) {
  const styles: Record<string, string> = {
    GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
    WS: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider flex-shrink-0 ${styles[method]}`}
    >
      {method}
    </span>
  );
}

// ── Endpoint card ────────────────────────────────
function EndpointCard({
  method,
  path,
  description,
  params,
  responseExample,
  requestExample,
}: {
  method: "GET" | "POST" | "PUT" | "DELETE" | "WS";
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  responseExample?: string;
  requestExample?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-muted/40 transition-colors text-left"
      >
        <MethodBadge method={method} />
        <code className="text-foreground text-sm font-mono flex-1 truncate">{path}</code>
        <span className="text-muted-foreground text-xs hidden sm:block truncate max-w-xs">
          {description}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/40"
          >
            <div className="bg-slate-950 dark:bg-black/40">
              <div className="p-4 sm:p-5 space-y-4">
                {/* Description */}
                <p className="text-slate-300 text-sm">{description}</p>

                {/* Parameters */}
                {params && params.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Parameters
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[400px] text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-slate-500 font-semibold">Name</th>
                            <th className="text-left py-2 px-3 text-slate-500 font-semibold">Type</th>
                            <th className="text-left py-2 px-3 text-slate-500 font-semibold">Required</th>
                            <th className="text-left py-2 px-3 text-slate-500 font-semibold">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {params.map((p) => (
                            <tr key={p.name} className="border-b border-white/5">
                              <td className="py-2 px-3">
                                <code className="text-blue-400 font-mono">{p.name}</code>
                              </td>
                              <td className="py-2 px-3">
                                <code className="text-amber-400 font-mono">{p.type}</code>
                              </td>
                              <td className="py-2 px-3">
                                {p.required ? (
                                  <span className="text-red-400 font-semibold">Yes</span>
                                ) : (
                                  <span className="text-slate-500">No</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-slate-400">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Request / Response examples */}
                {requestExample && (
                  <CodeBlock code={requestExample} lang="json" title="Request Example" />
                )}
                {responseExample && (
                  <CodeBlock code={responseExample} lang="json" title="Response Example" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section header ───────────────────────────────
function DocSection({
  id,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-foreground text-base font-bold">{title}</h2>
          {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
        </div>
      </div>
      <div className="pl-0 sm:pl-12">{children}</div>
    </section>
  );
}

// ── Sidebar navigation ───────────────────────────
const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "authentication", label: "Authentication", icon: Key },
  { id: "imd-api", label: "IMD API", icon: Cloud },
  { id: "tomorrow-api", label: "Tomorrow.io API", icon: Globe },
  { id: "alerts-api", label: "Alerts API", icon: AlertTriangle },
  { id: "forecast-api", label: "Forecast API", icon: BarChart3 },
  { id: "websocket", label: "WebSocket Events", icon: Wifi },
  { id: "error-codes", label: "Error Codes", icon: Activity },
  { id: "rate-limits", label: "Rate Limits", icon: Clock },
];

// ── Main component ───────────────────────────────
export function APIDocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const filteredSections = NAV_SECTIONS.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-foreground text-lg font-bold leading-tight">API Documentation</h1>
                <p className="text-muted-foreground text-xs">WeatherXpert REST & WebSocket API Reference</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                v1.4.0
              </span>
              {/* Mobile nav toggle */}
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm border border-border"
              >
                <Layers className="w-4 h-4" />
                Sections
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-x-0 top-[var(--topbar-height)] z-30 bg-card border-b border-border shadow-xl"
          >
            <div className="p-4 grid grid-cols-2 gap-1 max-h-[50vh] overflow-y-auto">
              {NAV_SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0 lg:gap-8">
          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0 py-8">
            <div className="sticky top-[90px] space-y-1">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {filteredSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left group"
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                    {section.label}
                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0 py-8">

            {/* OVERVIEW */}
            <DocSection id="overview" icon={BookOpen} title="Overview" subtitle="Base URLs, versioning, and response format">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Production Base URL", value: "https://api.weatherxpert.tatapower.com/v1", color: "text-emerald-500" },
                    { label: "Staging Base URL", value: "https://staging-api.weatherxpert.tatapower.com/v1", color: "text-amber-500" },
                    { label: "WebSocket URL", value: "wss://ws.weatherxpert.tatapower.com/v1", color: "text-purple-500" },
                    { label: "API Version", value: "1.4.0 (Current)", color: "text-blue-500" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border">
                      <div>
                        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">{item.label}</p>
                        <p className={`text-sm font-mono font-semibold mt-0.5 ${item.color}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-blue-500/8 dark:bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-1">Response Format</p>
                  <p className="text-muted-foreground text-xs mb-3">
                    All API responses follow a consistent JSON envelope structure with status, data, and optional pagination.
                  </p>
                  <CodeBlock
                    code={`{
  "status": "success",          // "success" | "error"
  "code": 200,                  // HTTP status code
  "data": { ... },              // Response payload
  "meta": {
    "timestamp": "2026-03-24T09:15:00Z",
    "provider": "IMD",          // "IMD" | "Tomorrow.io"
    "requestId": "req_abc123"
  },
  "pagination": {               // Present on list endpoints
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPages": 8
  }
}`}
                    lang="json"
                    title="Standard Response Envelope"
                  />
                </div>
              </div>
            </DocSection>

            {/* AUTHENTICATION */}
            <DocSection id="authentication" icon={Key} title="Authentication" subtitle="API key-based auth with RBAC support">
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  WeatherXpert uses API keys passed via the{" "}
                  <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">
                    Authorization
                  </code>{" "}
                  header. Keys are scoped to utilities and roles (Super Admin, Admin, Operator).
                </p>

                <CodeBlock
                  code={`# Include in every request header
Authorization: Bearer wxp_live_xxxxxxxxxxxxxxxxxxxxxxxx

# Or via query parameter (not recommended for production)
?api_key=wxp_live_xxxxxxxxxxxxxxxxxxxxxxxx`}
                  lang="bash"
                  title="HTTP Header Authentication"
                />

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-border rounded-xl overflow-hidden min-w-[400px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Prefix</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Environment</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expiry</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rate Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { prefix: "wxp_live_", env: "Production", expiry: "365 days", rate: "1000/hr" },
                        { prefix: "wxp_test_", env: "Staging", expiry: "30 days", rate: "500/hr" },
                        { prefix: "wxp_dev_", env: "Development", expiry: "7 days", rate: "100/hr" },
                      ].map((row) => (
                        <tr key={row.prefix} className="bg-card hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <code className="text-primary text-xs font-mono">{row.prefix}</code>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{row.env}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{row.expiry}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{row.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold">Security Note</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Never expose API keys in client-side code. Store in environment variables and rotate every 90 days. 
                        API keys are scoped to the utility's geographic region and role permissions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DocSection>

            {/* IMD API */}
            <DocSection id="imd-api" icon={Cloud} title="IMD API" subtitle="India Meteorological Department — official government data endpoints">
              <p className="text-muted-foreground text-sm mb-4">
                IMD endpoints provide official government weather observations, warnings, and gridded forecasts for Indian sub-continent. 
                Data refreshes every <strong className="text-foreground">15 minutes</strong> for observations and{" "}
                <strong className="text-foreground">6 hours</strong> for forecasts.
              </p>

              <EndpointCard
                method="GET"
                path="/imd/current/{stationId}"
                description="Retrieve current weather observation for a specific IMD station"
                params={[
                  { name: "stationId", type: "string", required: true, description: "IMD station code (e.g., 42182 for Mumbai)" },
                  { name: "units", type: "string", required: false, description: "'metric' (default) or 'imperial'" },
                  { name: "fields", type: "string", required: false, description: "Comma-separated fields: temperature,humidity,wind,rainfall" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "stationId": "42182",
    "stationName": "Santacruz, Mumbai",
    "coordinates": { "lat": 19.0883, "lon": 72.8697 },
    "observedAt": "2026-03-24T09:00:00Z",
    "temperature": { "value": 32.4, "unit": "°C", "feelsLike": 37.8 },
    "humidity": { "value": 78, "unit": "%" },
    "wind": { "speed": 18.5, "direction": 245, "gust": 26.0, "unit": "km/h" },
    "rainfall": { "last1h": 0.0, "last24h": 12.4, "unit": "mm" },
    "pressure": { "value": 1008.2, "unit": "hPa" },
    "visibility": { "value": 8.0, "unit": "km" },
    "cloudCover": { "value": 65, "unit": "%" },
    "provider": "IMD"
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/imd/forecast/{stationId}"
                description="Get 5-day hourly forecast from IMD numerical weather prediction models"
                params={[
                  { name: "stationId", type: "string", required: true, description: "IMD station code" },
                  { name: "days", type: "integer", required: false, description: "Forecast horizon: 1–5 (default: 5)" },
                  { name: "interval", type: "string", required: false, description: "'hourly' or '3hourly' (default: hourly)" },
                  { name: "parameters", type: "string", required: false, description: "Specific parameters to include" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "stationId": "42182",
    "generatedAt": "2026-03-24T06:00:00Z",
    "model": "GFS-IMD-2.5deg",
    "forecast": [
      {
        "time": "2026-03-24T09:00:00Z",
        "temperature": 32.4,
        "humidity": 78,
        "windSpeed": 18.5,
        "windDirection": 245,
        "rainfall": 0.0,
        "cloudCover": 65,
        "confidence": 0.92
      }
    ],
    "provider": "IMD"
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/imd/historical"
                description="Fetch historical weather data from IMD archives (up to 10 years)"
                params={[
                  { name: "stationId", type: "string", required: true, description: "IMD station code" },
                  { name: "startDate", type: "ISO 8601", required: true, description: "Start of date range (e.g., 2025-01-01)" },
                  { name: "endDate", type: "ISO 8601", required: true, description: "End of date range (e.g., 2025-12-31)" },
                  { name: "parameters", type: "string", required: false, description: "Parameters to retrieve" },
                  { name: "aggregation", type: "string", required: false, description: "'hourly', 'daily', 'monthly'" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "stationId": "42182",
    "period": { "start": "2025-01-01", "end": "2025-12-31" },
    "records": [
      {
        "date": "2025-01-01",
        "temperature": { "min": 17.2, "max": 29.6, "avg": 23.4 },
        "humidity": { "min": 55, "max": 89, "avg": 72 },
        "rainfall": 0.0,
        "sunshine": 7.5
      }
    ],
    "total": 365,
    "provider": "IMD"
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/imd/warnings"
                description="Active IMD severe weather warnings and cyclone advisories"
                params={[
                  { name: "state", type: "string", required: false, description: "State code (e.g., MH for Maharashtra)" },
                  { name: "severity", type: "string", required: false, description: "'yellow', 'orange', 'red'" },
                  { name: "category", type: "string", required: false, description: "'cyclone', 'flood', 'heatwave', 'lightning'" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "activeWarnings": [
      {
        "id": "WRN-MH-2026-0324",
        "type": "HeavyRainfall",
        "severity": "orange",
        "headline": "Heavy to very heavy rainfall likely",
        "area": "Konkan coast, North Madhya Maharashtra",
        "validFrom": "2026-03-24T18:00:00Z",
        "validUntil": "2026-03-25T18:00:00Z",
        "issuedBy": "IMD Mumbai",
        "provider": "IMD"
      }
    ],
    "total": 1
  }
}`}
              />
            </DocSection>

            {/* TOMORROW.IO API */}
            <DocSection id="tomorrow-api" icon={Globe} title="Tomorrow.io API" subtitle="High-resolution hyperlocal forecast and climate insights">
              <p className="text-muted-foreground text-sm mb-4">
                Tomorrow.io provides 1km resolution hyperlocal forecasts with up to{" "}
                <strong className="text-foreground">15-day</strong> horizon and AI-powered climate insights. 
                Data refreshes every <strong className="text-foreground">5 minutes</strong> for realtime.
              </p>

              <EndpointCard
                method="GET"
                path="/tomorrow/realtime"
                description="Real-time hyperlocal weather at 1km resolution using Tomorrow.io Micro-Weather"
                params={[
                  { name: "lat", type: "float", required: true, description: "Latitude (e.g., 19.0883)" },
                  { name: "lon", type: "float", required: true, description: "Longitude (e.g., 72.8697)" },
                  { name: "fields", type: "string", required: false, description: "Comma-separated data layers to retrieve" },
                  { name: "units", type: "string", required: false, description: "'metric' (default) or 'imperial'" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "location": { "lat": 19.0883, "lon": 72.8697, "name": "Mumbai, India" },
    "time": "2026-03-24T09:15:00Z",
    "values": {
      "temperature": 33.1,
      "temperatureApparent": 38.7,
      "humidity": 76,
      "windSpeed": 19.2,
      "windDirection": 248,
      "windGust": 28.4,
      "precipitationIntensity": 0.0,
      "precipitationProbability": 15,
      "uvIndex": 8,
      "cloudCover": 60,
      "visibility": 9.5,
      "solarGHI": 680,
      "solarDNI": 520,
      "solarDiffuseHorizontalIrradiance": 160
    },
    "provider": "Tomorrow.io"
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/tomorrow/forecast"
                description="15-day hourly or daily forecast with confidence intervals"
                params={[
                  { name: "lat", type: "float", required: true, description: "Latitude" },
                  { name: "lon", type: "float", required: true, description: "Longitude" },
                  { name: "timestep", type: "string", required: false, description: "'1h', '6h', '1d' (default: 1h)" },
                  { name: "startTime", type: "ISO 8601", required: false, description: "Forecast start (default: now)" },
                  { name: "endTime", type: "ISO 8601", required: false, description: "Forecast end (max: now+15d)" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "timelines": [
      {
        "timestep": "1h",
        "intervals": [
          {
            "startTime": "2026-03-24T10:00:00Z",
            "values": {
              "temperature": 34.5,
              "precipitationIntensity": 0.0,
              "precipitationProbability": 10,
              "windSpeed": 22.0,
              "solarGHI": 740,
              "confidenceScore": 0.94
            }
          }
        ]
      }
    ],
    "provider": "Tomorrow.io"
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/tomorrow/climate"
                description="Long-range climate normals, anomalies, and trend analysis"
                params={[
                  { name: "lat", type: "float", required: true, description: "Latitude" },
                  { name: "lon", type: "float", required: true, description: "Longitude" },
                  { name: "parameter", type: "string", required: true, description: "Climate parameter: temperature, rainfall, wind, solar" },
                  { name: "period", type: "string", required: false, description: "'30y' (default), '20y', '10y'" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "parameter": "temperature",
    "period": "1991-2020",
    "normals": {
      "monthly": [22.1, 24.3, 28.7, 31.2, 32.8, 30.1, 28.9, 28.3, 29.7, 30.2, 27.8, 23.4]
    },
    "anomaly": {
      "current": +1.8,
      "trend": "+0.3°C per decade"
    },
    "provider": "Tomorrow.io"
  }
}`}
              />
            </DocSection>

            {/* ALERTS API */}
            <DocSection id="alerts-api" icon={AlertTriangle} title="Alerts API" subtitle="CRUD operations for weather alert rule management">
              <p className="text-muted-foreground text-sm mb-4">
                Create and manage weather monitoring alerts. Alerts trigger notifications via email, SMS, or webhook 
                when defined thresholds are exceeded.
              </p>

              <EndpointCard
                method="GET"
                path="/alerts"
                description="List all alerts for the authenticated utility with filtering and pagination"
                params={[
                  { name: "status", type: "string", required: false, description: "'active', 'inactive', 'triggered'" },
                  { name: "severity", type: "string", required: false, description: "'info', 'warning', 'critical'" },
                  { name: "parameter", type: "string", required: false, description: "Weather parameter filter" },
                  { name: "page", type: "integer", required: false, description: "Page number (default: 1)" },
                  { name: "perPage", type: "integer", required: false, description: "Results per page (default: 20, max: 100)" },
                ]}
                responseExample={`{
  "status": "success",
  "data": [
    {
      "id": "alrt_abc123",
      "name": "High Temperature Alert — Mumbai",
      "parameter": "temperature",
      "operator": "greaterThan",
      "threshold": 42,
      "unit": "°C",
      "severity": "critical",
      "locations": ["42182"],
      "isActive": true,
      "createdBy": "admin@tatapower.com",
      "createdAt": "2026-03-20T10:00:00Z",
      "lastTriggered": "2026-03-22T14:30:00Z",
      "triggerCount": 3
    }
  ],
  "pagination": { "page": 1, "perPage": 20, "total": 47 }
}`}
              />

              <EndpointCard
                method="POST"
                path="/alerts"
                description="Create a new weather alert rule with threshold conditions and notification channels"
                params={[
                  { name: "name", type: "string", required: true, description: "Human-readable alert name (max 80 chars)" },
                  { name: "parameter", type: "string", required: true, description: "Weather parameter: temperature, windSpeed, rainfall, humidity, cloudCover, solarIrradiance" },
                  { name: "operator", type: "string", required: true, description: "'greaterThan' (Maximum) or 'lessThan' (Minimum)" },
                  { name: "threshold", type: "number", required: true, description: "Numeric threshold value" },
                  { name: "severity", type: "string", required: true, description: "'info', 'warning', 'critical'" },
                  { name: "locations", type: "string[]", required: true, description: "Array of location/station IDs" },
                  { name: "notifications", type: "object", required: false, description: "Notification channels config" },
                ]}
                requestExample={`POST /v1/alerts
Authorization: Bearer wxp_live_xxx

{
  "name": "High Wind Speed — Gujarat Wind Farm",
  "parameter": "windSpeed",
  "operator": "greaterThan",
  "threshold": 65,
  "severity": "critical",
  "locations": ["wnd-4"],
  "notifications": {
    "email": ["ops@renewables.tatapower.com"],
    "webhook": "https://hooks.tatapower.com/alerts"
  }
}`}
                responseExample={`{
  "status": "success",
  "data": {
    "id": "alrt_xyz789",
    "name": "High Wind Speed — Gujarat Wind Farm",
    "status": "active",
    "createdAt": "2026-03-24T09:15:00Z",
    "message": "Alert created and monitoring active"
  }
}`}
              />

              <EndpointCard
                method="PUT"
                path="/alerts/{alertId}"
                description="Update an existing alert — partial updates supported (PATCH semantics)"
                params={[
                  { name: "alertId", type: "string", required: true, description: "Alert ID from creation response" },
                  { name: "name", type: "string", required: false, description: "Updated alert name" },
                  { name: "threshold", type: "number", required: false, description: "New threshold value" },
                  { name: "isActive", type: "boolean", required: false, description: "Enable/disable alert" },
                  { name: "severity", type: "string", required: false, description: "Updated severity level" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "id": "alrt_xyz789",
    "updated": ["threshold", "severity"],
    "updatedAt": "2026-03-24T11:00:00Z"
  }
}`}
              />

              <EndpointCard
                method="DELETE"
                path="/alerts/{alertId}"
                description="Permanently delete an alert. This action cannot be undone."
                params={[
                  { name: "alertId", type: "string", required: true, description: "Alert ID to delete" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "id": "alrt_xyz789",
    "deleted": true,
    "deletedAt": "2026-03-24T12:00:00Z"
  }
}`}
              />
            </DocSection>

            {/* FORECAST API */}
            <DocSection id="forecast-api" icon={BarChart3} title="Forecast API" subtitle="Provider-agnostic blended forecast with accuracy metadata">
              <p className="text-muted-foreground text-sm mb-4">
                The unified forecast endpoint blends IMD and Tomorrow.io data using a proprietary accuracy-weighted algorithm. 
                The active provider is determined by the utility's settings.
              </p>

              <EndpointCard
                method="GET"
                path="/forecast/blended"
                description="Accuracy-weighted blended forecast combining IMD and Tomorrow.io predictions"
                params={[
                  { name: "locationId", type: "string", required: true, description: "WeatherXpert location ID or lat,lon pair" },
                  { name: "days", type: "integer", required: false, description: "Forecast days 1–10 (default: 7)" },
                  { name: "provider", type: "string", required: false, description: "Override: 'IMD', 'Tomorrow.io', 'blended' (default)" },
                  { name: "parameters", type: "string", required: false, description: "Comma-separated parameters" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "locationId": "mumbai-colaba",
    "generatedAt": "2026-03-24T09:00:00Z",
    "blendWeights": {
      "IMD": 0.55,
      "Tomorrow.io": 0.45
    },
    "forecast": [
      {
        "date": "2026-03-24",
        "temperature": { "min": 27.2, "max": 35.8, "avg": 31.5 },
        "rainfall": { "total": 0.0, "probability": 8 },
        "wind": { "avg": 19.5, "max": 28.0, "direction": 248 },
        "solarIrradiance": { "ghi": 680, "dni": 520 },
        "confidenceScore": 0.91,
        "dominantProvider": "IMD"
      }
    ]
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/forecast/accuracy"
                description="Historical forecast accuracy comparison between IMD and Tomorrow.io for a location"
                params={[
                  { name: "locationId", type: "string", required: true, description: "WeatherXpert location ID" },
                  { name: "parameter", type: "string", required: false, description: "Weather parameter to evaluate" },
                  { name: "period", type: "string", required: false, description: "'7d', '30d', '90d', '1y' (default: 30d)" },
                  { name: "metric", type: "string", required: false, description: "'mae', 'rmse', 'bias' (default: all)" },
                ]}
                responseExample={`{
  "status": "success",
  "data": {
    "locationId": "mumbai-colaba",
    "period": "30d",
    "parameter": "temperature",
    "accuracy": {
      "IMD": {
        "mae": 1.42,
        "rmse": 1.89,
        "bias": -0.3,
        "score": 94.2
      },
      "Tomorrow.io": {
        "mae": 1.68,
        "rmse": 2.14,
        "bias": +0.5,
        "score": 91.7
      }
    },
    "recommendation": "IMD"
  }
}`}
              />
            </DocSection>

            {/* WEBSOCKET */}
            <DocSection id="websocket" icon={Wifi} title="WebSocket Events" subtitle="Real-time push events for live weather monitoring">
              <p className="text-muted-foreground text-sm mb-4">
                Connect to the WeatherXpert WebSocket server for real-time weather updates, alert triggers, and system events.
                Authentication uses the same API key passed as a query parameter on connect.
              </p>

              <CodeBlock
                code={`// Connect to WebSocket
const ws = new WebSocket(
  'wss://ws.weatherxpert.tatapower.com/v1?api_key=wxp_live_xxx'
);

// Subscribe to location updates
ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    channels: ['weather:42182', 'alerts:utility:Mumbai Distribution']
  }));
};

// Handle incoming events
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  switch (msg.event) {
    case 'weather.update':
      console.log('Weather update:', msg.data);
      break;
    case 'alert.triggered':
      console.log('Alert fired:', msg.data.alertId);
      break;
    case 'provider.switchover':
      console.log('Provider changed to:', msg.data.provider);
      break;
  }
};`}
                lang="javascript"
                title="WebSocket Client Example"
              />

              <div className="mt-4 space-y-3">
                {[
                  { event: "weather.update", channel: "weather:{stationId}", description: "Live weather observation update every 5 minutes", payload: '{ "stationId", "temperature", "wind", "humidity", "timestamp" }' },
                  { event: "alert.triggered", channel: "alerts:{utilityId}", description: "Alert threshold exceeded — requires immediate attention", payload: '{ "alertId", "alertName", "parameter", "value", "threshold", "severity" }' },
                  { event: "alert.resolved", channel: "alerts:{utilityId}", description: "Alert condition cleared, values returned to normal range", payload: '{ "alertId", "resolvedAt", "duration" }' },
                  { event: "forecast.updated", channel: "forecast:{locationId}", description: "New forecast data available from provider", payload: '{ "locationId", "provider", "horizon", "generatedAt" }' },
                  { event: "provider.switchover", channel: "system:{utilityId}", description: "Active forecast provider has changed", payload: '{ "from", "to", "reason", "timestamp" }' },
                  { event: "data.quality.alert", channel: "system:{utilityId}", description: "Data quality issue detected in provider feed", payload: '{ "provider", "issue", "affectedStations", "severity" }' },
                ].map((ev) => (
                  <div key={ev.event} className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <MethodBadge method="WS" />
                      <code className="text-foreground text-sm font-mono">{ev.event}</code>
                    </div>
                    <p className="text-muted-foreground text-xs mb-2">{ev.description}</p>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="text-muted-foreground">Channel:</span>
                      <code className="text-blue-500 font-mono">{ev.channel}</code>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] mt-1">
                      <span className="text-muted-foreground">Payload:</span>
                      <code className="text-emerald-500 font-mono">{ev.payload}</code>
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>

            {/* ERROR CODES */}
            <DocSection id="error-codes" icon={Activity} title="Error Codes" subtitle="Standardised error responses and troubleshooting guide">
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">HTTP Code</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Error Code</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { code: 400, error: "INVALID_PARAMS", desc: "Request parameters are malformed or missing required fields", fix: "Check API docs for required params" },
                      { code: 401, error: "UNAUTHORIZED", desc: "API key is missing, expired, or invalid", fix: "Regenerate API key in Settings → Integrations" },
                      { code: 403, error: "FORBIDDEN", desc: "API key lacks permission for this endpoint or utility", fix: "Check RBAC role permissions" },
                      { code: 404, error: "NOT_FOUND", desc: "Station ID, location, or alert not found", fix: "Verify IDs using the list endpoints" },
                      { code: 422, error: "VALIDATION_ERROR", desc: "Request payload fails business logic validation", fix: "Check threshold ranges for the given parameter" },
                      { code: 429, error: "RATE_LIMIT_EXCEEDED", desc: "Request rate exceeds plan limits", fix: "Implement exponential backoff, check rate limit headers" },
                      { code: 503, error: "PROVIDER_UNAVAILABLE", desc: "Upstream data provider (IMD/Tomorrow.io) is unreachable", fix: "Auto-fallback enabled; check status.weatherxpert.io" },
                    ].map((row) => (
                      <tr key={row.error} className="bg-card hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold font-mono ${row.code >= 500 ? "text-red-500" : row.code >= 400 ? "text-amber-500" : "text-emerald-500"}`}>
                            {row.code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs font-mono text-primary">{row.error}</code>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{row.desc}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{row.fix}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DocSection>

            {/* RATE LIMITS */}
            <DocSection id="rate-limits" icon={Clock} title="Rate Limits" subtitle="API call quotas and throttling policy">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { plan: "Production", limit: "1,000 / hour", burst: "50 / sec", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/20" },
                  { plan: "Staging", limit: "500 / hour", burst: "20 / sec", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/8 border-blue-500/20" },
                  { plan: "Development", limit: "100 / hour", burst: "5 / sec", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/8 border-amber-500/20" },
                ].map((tier) => (
                  <div key={tier.plan} className={`p-4 rounded-xl border ${tier.bg}`}>
                    <p className={`text-sm font-semibold ${tier.color}`}>{tier.plan}</p>
                    <p className="text-foreground text-xl font-bold mt-1">{tier.limit}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Burst: {tier.burst}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="text-foreground text-sm font-semibold mb-2">Rate Limit Response Headers</p>
                <CodeBlock
                  code={`X-RateLimit-Limit: 1000        # Total requests per window
X-RateLimit-Remaining: 847     # Remaining requests
X-RateLimit-Reset: 1711271400  # Unix timestamp when window resets
X-RateLimit-RetryAfter: 120    # Seconds to wait if 429 received`}
                  lang="http"
                  title="HTTP Response Headers"
                />
              </div>
            </DocSection>
          </main>
        </div>
      </div>
    </div>
  );
}
