import { useState } from "react";
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, HelpCircle,
  RefreshCw, Clock, Server, Database, Link2, Cpu, ArrowUpRight,
  Shield, MapPin, Globe, Eye, PlayCircle, HardDrive, Archive,
  Download, Upload, RotateCcw, CheckCircle, AlertCircle,
  TrendingUp, Calendar, User, Mail
} from "lucide-react";
import { HEALTH_METRICS, type HealthMetric } from "./settingsData";

const STATUS_CONF: Record<HealthMetric["status"], { label: string; color: string; bg: string; icon: React.ElementType; ring: string; border: string }> = {
  healthy:  { label: "Healthy",  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2, ring: "ring-emerald-500/20", border: "border-emerald-500/20" },
  warning:  { label: "Warning",  color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10",   icon: AlertTriangle, ring: "ring-amber-500/20",   border: "border-amber-500/20" },
  critical: { label: "Critical", color: "text-red-600 dark:text-red-400",         bg: "bg-red-500/10",     icon: XCircle,      ring: "ring-red-500/20",     border: "border-red-500/20" },
  unknown:  { label: "Unknown",  color: "text-muted-foreground",                bg: "bg-secondary",      icon: HelpCircle,   ring: "ring-border",         border: "border-border" },
};

const CAT_ICONS: Record<string, React.ElementType> = {
  API: Server, Database: Database, Integration: Link2, Infrastructure: Cpu,
};

export function SystemHealthTab() {
  const [metrics] = useState(HEALTH_METRICS);
  const [refreshing, setRefreshing] = useState(false);
  const [testRunning, setTestRunning] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);

  const healthy = metrics.filter(m => m.status === "healthy").length;
  const warning = metrics.filter(m => m.status === "warning").length;
  const critical = metrics.filter(m => m.status === "critical").length;

  const overallPct = Math.round((healthy / metrics.length) * 100);
  const overallColor = critical > 0 ? "text-red-600 dark:text-red-400" : warning > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
  const overallBg = critical > 0 ? "bg-red-500/10" : warning > 0 ? "bg-amber-500/10" : "bg-emerald-500/10";
  const overallBorder = critical > 0 ? "border-red-500/20" : warning > 0 ? "border-amber-500/20" : "border-emerald-500/20";

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleBackup = () => {
    setBackupProgress(0);
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRestore = () => {
    setRestoreProgress(0);
    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRunTests = () => {
    setTestRunning(true);
    setTimeout(() => setTestRunning(false), 3000);
  };

  // Mock data for new features
  const suspiciousLogins = [
    { id: 1, user: "rajesh.k@tatapower.com", location: "Mumbai, IN", ip: "203.192.45.12", time: "2 mins ago", risk: "low", device: "Chrome on Windows" },
    { id: 2, user: "priya.s@tatapower.com", location: "Unknown", ip: "198.51.100.42", time: "12 mins ago", risk: "high", device: "Firefox on Linux" },
    { id: 3, user: "amit.p@tatapower.com", location: "Delhi, IN", ip: "110.227.88.91", time: "1 hr ago", risk: "medium", device: "Safari on macOS" },
  ];

  const apiHealthData = [
    { name: "Weather API", status: "operational", latency: "42ms", uptime: "99.98%", requests: "12.4K/hr" },
    { name: "Forecast API", status: "operational", latency: "38ms", uptime: "99.95%", requests: "8.2K/hr" },
    { name: "Historical API", status: "degraded", latency: "156ms", uptime: "98.12%", requests: "3.1K/hr" },
    { name: "Alert API", status: "operational", latency: "29ms", uptime: "100%", requests: "1.8K/hr" },
  ];

  const integrationTests = [
    { id: 1, name: "Weather Provider Auth", status: "passed", duration: "1.2s", lastRun: "5 mins ago" },
    { id: 2, name: "Database Connection", status: "passed", duration: "0.8s", lastRun: "5 mins ago" },
    { id: 3, name: "Email Service", status: "failed", duration: "2.1s", lastRun: "5 mins ago" },
    { id: 4, name: "SMS Gateway", status: "passed", duration: "1.5s", lastRun: "5 mins ago" },
  ];

  const storageData = {
    total: 500,
    used: 342,
    databases: 145,
    logs: 89,
    backups: 78,
    cache: 30,
  };

  const storagePercent = Math.round((storageData.used / storageData.total) * 100);

  // Mock heatmap data (24 hours x 7 days)
  const activityHeatmap = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const base = Math.random() * 100;
      // Peak hours: 9-17
      const isPeak = hour >= 9 && hour <= 17;
      return Math.round(isPeak ? base * 1.5 : base * 0.3);
    })
  );

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Group by category
  const categories = [...new Set(metrics.map(m => m.category))];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Health Card */}
        <div className={`col-span-1 rounded-2xl border ${overallBorder} ${overallBg} p-5 text-center relative overflow-hidden backdrop-blur-sm group`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <p className="text-[10px] text-foreground/70 font-bold uppercase tracking-widest mb-1 relative z-10">Overall Health</p>
          <div className="flex items-baseline justify-center gap-1 relative z-10">
            <p className={`text-[36px] tabular-nums font-bold ${overallColor} tracking-tighter`}>{overallPct}</p>
            <span className={`text-lg font-medium ${overallColor}`}>%</span>
          </div>
          <p className="text-[10px] text-foreground/50 tabular-nums mt-1 relative z-10 font-medium group-hover:text-foreground/70 transition-colors">
            {metrics.length} services monitored
          </p>
        </div>

        {/* Stats Cards */}
        {[
          { label: "Healthy", count: healthy, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10", icon: CheckCircle2 },
          { label: "Warning", count: warning, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10", icon: AlertTriangle },
          { label: "Critical", count: critical, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/5", border: "border-red-500/10", icon: XCircle },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl border ${card.border} ${card.bg} p-5 text-center flex flex-col items-center justify-center backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg`}>
            <card.icon className={`w-6 h-6 ${card.color} mb-2 opacity-80`} />
            <p className={`text-[24px] ${card.color} tabular-nums font-bold leading-none`}>{card.count}</p>
            <p className={`text-[10px] ${card.color} opacity-70 uppercase tracking-wider font-semibold mt-1`}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Refresh + timestamp */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
          <p className="text-[10px] text-muted-foreground font-medium tabular-nums">Last checked: <span className="text-foreground">2026-02-16 09:14 IST</span></p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="group flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-full text-[11px] text-muted-foreground font-semibold hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50 shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : "group-hover:text-primary"}`} />
          {refreshing ? "Checking..." : "Refresh Status"}
        </button>
      </div>

      {/* ═══ NEW FEATURE 1: Suspicious Login Detection Panel ═══ */}
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 ring-1 ring-red-500/20 flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-foreground tracking-tight">Suspicious Login Detection</h3>
              <p className="text-[10px] text-muted-foreground">Real-time security monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Live</span>
          </div>
        </div>
        <div className="divide-y divide-black/5 dark:divide-white/5">
          {suspiciousLogins.map(login => (
            <div key={login.id} className="px-5 py-3.5 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  login.risk === "high" ? "bg-red-500/10 ring-1 ring-red-500/20" :
                  login.risk === "medium" ? "bg-amber-500/10 ring-1 ring-amber-500/20" :
                  "bg-emerald-500/10 ring-1 ring-emerald-500/20"
                }`}>
                  <AlertTriangle className={`w-3.5 h-3.5 ${
                    login.risk === "high" ? "text-red-600 dark:text-red-400" :
                    login.risk === "medium" ? "text-amber-600 dark:text-amber-400" :
                    "text-emerald-600 dark:text-emerald-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3 h-3 text-muted-foreground/60" />
                    <span className="text-[11px] text-foreground font-medium truncate">{login.user}</span>
                    <span className={`ml-auto text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                      login.risk === "high" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                      login.risk === "medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}>{login.risk} risk</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground/70">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {login.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" />
                      {login.ip}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {login.time}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">{login.device}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ NEW FEATURE 2: User Activity Heatmap ═══ */}
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-foreground tracking-tight">User Activity Heatmap</h3>
              <p className="text-[10px] text-muted-foreground">Weekly activity patterns (last 7 days)</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-emerald-500/20" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-emerald-500/60" />
              <span>Med</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-emerald-500" />
              <span>High</span>
            </div>
          </div>
        </div>
        <div className="p-5 overflow-x-auto">
          <div className="flex gap-2">
            {/* Day labels */}
            <div className="flex flex-col gap-1.5 pr-2">
              <div className="h-4" /> {/* Spacer for hour labels */}
              {dayLabels.map(day => (
                <div key={day} className="h-3.5 flex items-center">
                  <span className="text-[9px] text-muted-foreground font-medium">{day}</span>
                </div>
              ))}
            </div>
            {/* Heatmap grid */}
            <div className="flex-1">
              {/* Hour labels */}
              <div className="flex gap-1.5 mb-1.5">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="w-3.5 flex justify-center">
                    {i % 3 === 0 && <span className="text-[8px] text-muted-foreground font-medium">{i}</span>}
                  </div>
                ))}
              </div>
              {/* Activity cells */}
              <div className="space-y-1.5">
                {activityHeatmap.map((dayData, dayIdx) => (
                  <div key={dayIdx} className="flex gap-1.5">
                    {dayData.map((value, hourIdx) => {
                      const opacity = Math.min(100, value) / 100;
                      return (
                        <div
                          key={hourIdx}
                          className="w-3.5 h-3.5 rounded-sm transition-all hover:ring-2 hover:ring-primary/40 cursor-pointer"
                          style={{
                            backgroundColor: `rgba(16, 185, 129, ${opacity * 0.8})`,
                          }}
                          title={`${dayLabels[dayIdx]} ${hourIdx}:00 - ${value} users`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ NEW FEATURE 3: API Health Monitor ═══ */}
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20 flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-foreground tracking-tight">API Health Monitor</h3>
              <p className="text-[10px] text-muted-foreground">Live endpoint performance tracking</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-black/5 dark:divide-white/5">
          {apiHealthData.map((api, idx) => (
            <div key={idx} className="px-5 py-3.5 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  api.status === "operational" ? "bg-emerald-500/10 ring-1 ring-emerald-500/20" : "bg-amber-500/10 ring-1 ring-amber-500/20"
                }`}>
                  <Server className={`w-4 h-4 ${
                    api.status === "operational" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] text-foreground font-medium">{api.name}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                      api.status === "operational" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>{api.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {api.latency}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" />
                      {api.uptime}
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                      {api.requests}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ═══ NEW FEATURE 4: Integration Test Sandbox ═══ */}
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20 flex items-center justify-center shadow-sm">
                <PlayCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-foreground tracking-tight">Integration Test Sandbox</h3>
                <p className="text-[10px] text-muted-foreground">Verify connections</p>
              </div>
            </div>
            <button
              onClick={handleRunTests}
              disabled={testRunning}
              className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <PlayCircle className={`w-3 h-3 ${testRunning ? "animate-spin" : ""}`} />
              {testRunning ? "Running..." : "Run All Tests"}
            </button>
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/5 flex-1">
            {integrationTests.map(test => (
              <div key={test.id} className="px-5 py-3 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    test.status === "passed" ? "bg-emerald-500/10 ring-1 ring-emerald-500/20" : "bg-red-500/10 ring-1 ring-red-500/20"
                  }`}>
                    {test.status === "passed" ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground font-medium truncate">{test.name}</p>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground/70 mt-0.5">
                      <span>{test.duration}</span>
                      <span>•</span>
                      <span>{test.lastRun}</span>
                    </div>
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                    test.status === "passed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}>{test.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ NEW FEATURE 5: Backup & Restore Configuration ═══ */}
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20 flex items-center justify-center shadow-sm">
                <Archive className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-foreground tracking-tight">Backup & Restore</h3>
                <p className="text-[10px] text-muted-foreground">System configuration</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4 flex-1">
            {/* Backup section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] text-foreground font-semibold">Create Backup</span>
                </div>
                <button
                  onClick={handleBackup}
                  disabled={backupProgress > 0 && backupProgress < 100}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
                >
                  {backupProgress > 0 && backupProgress < 100 ? "Creating..." : "Backup Now"}
                </button>
              </div>
              {backupProgress > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${backupProgress}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">{backupProgress}% complete</p>
                </div>
              )}
            </div>

            {/* Restore section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] text-foreground font-semibold">Restore Backup</span>
                </div>
                <button
                  onClick={handleRestore}
                  disabled={restoreProgress > 0 && restoreProgress < 100}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                >
                  {restoreProgress > 0 && restoreProgress < 100 ? "Restoring..." : "Restore"}
                </button>
              </div>
              {restoreProgress > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                      style={{ width: `${restoreProgress}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">{restoreProgress}% complete</p>
                </div>
              )}
            </div>

            {/* Recent backups */}
            <div className="pt-3 border-t border-black/5 dark:border-white/10">
              <p className="text-[10px] text-muted-foreground font-semibold mb-2">Recent Backups</p>
              <div className="space-y-1.5">
                {[
                  { name: "backup-2026-02-16-09-00.zip", size: "2.4 GB", date: "Today at 9:00 AM" },
                  { name: "backup-2026-02-15-09-00.zip", size: "2.3 GB", date: "Yesterday at 9:00 AM" },
                  { name: "backup-2026-02-14-09-00.zip", size: "2.2 GB", date: "Feb 14 at 9:00 AM" },
                ].map((backup, idx) => (
                  <div key={idx} className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-foreground font-medium truncate">{backup.name}</p>
                      <p className="text-[8px] text-muted-foreground/70">{backup.date}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-semibold ml-2">{backup.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ NEW FEATURE 6: System Storage Usage Meter ═══ */}
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20 flex items-center justify-center shadow-sm">
              <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-foreground tracking-tight">System Storage Usage</h3>
              <p className="text-[10px] text-muted-foreground">Storage allocation and capacity</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-foreground font-bold tabular-nums">{storageData.used} GB</span>
            <span className="text-[10px] text-muted-foreground">/ {storageData.total} GB</span>
          </div>
        </div>
        <div className="p-5">
          {/* Overall usage bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-foreground font-semibold">Overall Usage</span>
              <span className={`text-[11px] font-bold tabular-nums ${
                storagePercent > 85 ? "text-red-600 dark:text-red-400" :
                storagePercent > 70 ? "text-amber-600 dark:text-amber-400" :
                "text-emerald-600 dark:text-emerald-400"
              }`}>{storagePercent}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  storagePercent > 85 ? "bg-gradient-to-r from-red-500 to-red-600" :
                  storagePercent > 70 ? "bg-gradient-to-r from-amber-500 to-amber-600" :
                  "bg-gradient-to-r from-emerald-500 to-emerald-600"
                }`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>

          {/* Storage breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Databases", value: storageData.databases, color: "bg-blue-500", icon: Database },
              { label: "Logs", value: storageData.logs, color: "bg-purple-500", icon: Activity },
              { label: "Backups", value: storageData.backups, color: "bg-amber-500", icon: Archive },
              { label: "Cache", value: storageData.cache, color: "bg-emerald-500", icon: Server },
              { label: "Available", value: storageData.total - storageData.used, color: "bg-gray-400", icon: HardDrive },
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl border border-black/5 dark:border-white/10 bg-white/30 dark:bg-black/30 p-3 text-center hover:scale-105 transition-transform">
                <div className={`w-8 h-8 rounded-lg ${item.color}/10 ring-1 ${item.color}/20 flex items-center justify-center mx-auto mb-2`}>
                  <item.icon className={`w-4 h-4 ${item.color.replace("bg-", "text-")}`} />
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold mb-1">{item.label}</p>
                <p className="text-[16px] text-foreground font-bold tabular-nums">{item.value}</p>
                <p className="text-[8px] text-muted-foreground/60">GB</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services by category (original content) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map(cat => {
          const catMetrics = metrics.filter(m => m.category === cat);
          const CatIcon = CAT_ICONS[cat] || Server;
          return (
            <div key={cat} className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden shadow-sm flex flex-col h-full">
              <div className="px-5 py-3 border-b border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/50 dark:bg-white/10 flex items-center justify-center shadow-sm">
                    <CatIcon className="w-3.5 h-3.5 text-foreground/70" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground tracking-tight">{cat}</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[9px] text-muted-foreground font-semibold tabular-nums">
                  {catMetrics.length} services
                </span>
              </div>
              <div className="divide-y divide-black/5 dark:divide-white/5 flex-1">
                {catMetrics.map(m => {
                  const st = STATUS_CONF[m.status];
                  const StIcon = st.icon;
                  return (
                    <div key={m.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${st.bg} ring-1 ${st.ring} shadow-sm group-hover:scale-110 transition-transform`}>
                        <StIcon className={`w-4 h-4 ${st.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] text-foreground font-medium truncate">{m.name}</p>
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${st.bg} ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{m.details}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] text-foreground font-semibold tabular-nums">{m.value}</p>
                        <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground/50">
                          <Activity className="w-2.5 h-2.5" />
                          <span>{m.uptime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
