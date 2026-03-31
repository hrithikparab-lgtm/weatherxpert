import { useState, useCallback } from "react";
import {
  Server, CheckCircle2, XCircle, AlertTriangle, Wifi, WifiOff,
  Play, RotateCw, Settings, X, Terminal, Clock, Gauge, ArrowRight
} from "lucide-react";
import { SYSTEM_INTEGRATIONS, type SystemIntegration, type IntegrationStatus, type SandboxResult } from "./settingsData";

const STATUS_CONF: Record<IntegrationStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  connected:    { label: "Connected",    color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 },
  disconnected: { label: "Disconnected", color: "text-muted-foreground",                bg: "bg-secondary",      border: "border-border",         icon: WifiOff },
  error:        { label: "Error",        color: "text-red-600 dark:text-red-400",         bg: "bg-red-500/10",     border: "border-red-500/20",     icon: XCircle },
  testing:      { label: "Testing…",     color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: RotateCw },
};

interface IntegrationsTabProps { isMobile: boolean; }

export function IntegrationsTab({ isMobile }: IntegrationsTabProps) {
  const [integrations, setIntegrations] = useState(SYSTEM_INTEGRATIONS);
  const [sandboxResults, setSandboxResults] = useState<SandboxResult[]>([]);
  const [editModal, setEditModal] = useState<SystemIntegration | null>(null);

  const runSandboxTest = useCallback((integ: SystemIntegration) => {
    // Set to testing
    setIntegrations(prev => prev.map(i => i.id === integ.id ? { ...i, status: "testing" as IntegrationStatus } : i));

    setTimeout(() => {
      const success = integ.status !== "disconnected" && Math.random() > 0.2;
      const result: SandboxResult = {
        integration: integ.name,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        success,
        latency: success ? `${Math.round(20 + Math.random() * 200)}ms` : "—",
        message: success ? "Connection test passed — handshake successful" : "Connection refused — check endpoint configuration",
        responsePreview: success ? `{ "status": "ok", "version": "2.1.4", "uptime": "14d 3h" }` : undefined,
      };
      setSandboxResults(prev => [result, ...prev].slice(0, 10));
      setIntegrations(prev => prev.map(i =>
        i.id === integ.id ? { ...i, status: success ? "connected" : "error" } : i
      ));
    }, 1500 + Math.random() * 1000);
  }, []);

  return (
    <div className="space-y-6">
      {/* Integration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {integrations.map(integ => {
          const st = STATUS_CONF[integ.status];
          const StIcon = st.icon;
          return (
            <div key={integ.id} className={`group relative rounded-2xl border ${st.border} ${integ.status === 'connected' ? 'bg-white/60 dark:bg-black/30' : 'bg-white/40 dark:bg-black/20'} backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5`}>
              <div className="px-5 py-4">
                <div className="flex items-start gap-3.5 mb-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${st.bg} border ${st.border} shadow-sm transition-transform group-hover:scale-105`}>
                    {integ.status === "testing"
                      ? <RotateCw className={`w-5 h-5 ${st.color} animate-spin`} />
                      : <StIcon className={`w-5 h-5 ${st.color}`} />
                    }
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-[13px] text-foreground font-bold truncate leading-none">{integ.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${st.bg} ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">{integ.type}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-[11px] text-muted-foreground/70 mb-4 leading-relaxed line-clamp-2 min-h-[2.5em]">{integ.description}</p>

                {/* Health bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    <span>Health Score</span>
                    <span className="text-foreground">{integ.healthScore}%</span>
                  </div>
                  <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-full h-1.5 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      integ.healthScore >= 80 ? "bg-emerald-500" : integ.healthScore >= 40 ? "bg-amber-500" : "bg-red-500"
                    }`} style={{ width: `${integ.healthScore}%` }} />
                  </div>
                </div>

                {/* Config snippets */}
                <div className="space-y-1 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  {Object.entries(integ.config).slice(0, 3).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-[9px]">
                      <span className="text-muted-foreground/50 font-bold uppercase tracking-wider">{k}</span>
                      <span className="text-foreground/70 font-mono truncate max-w-[120px]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 bg-white/50 dark:bg-white/5 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-muted-foreground/40" />
                  <span className="text-[9px] text-muted-foreground/60 font-medium tabular-nums">Sync: {integ.lastSync.split(" ")[1]}</span>
                </div>
                {!isMobile && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => runSandboxTest(integ)} disabled={integ.status === "testing"}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold hover:bg-primary/20 transition-all disabled:opacity-40 hover:shadow-sm">
                      <Play className="w-2.5 h-2.5 fill-current" /> Test
                    </button>
                    <button onClick={() => setEditModal(integ)}
                      className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sandbox results */}
      {sandboxResults.length > 0 && (
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-black/90 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl ring-1 ring-black/5">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <Terminal className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Sandbox Console</h4>
              <p className="text-[10px] text-zinc-400 font-medium">Real-time connection diagnostics</p>
            </div>
            <span className="ml-auto text-[10px] text-zinc-500 tabular-nums px-2 py-1 rounded-full bg-white/5 border border-white/5">
              {sandboxResults.length} events
            </span>
          </div>
          <div className="max-h-[250px] overflow-y-auto divide-y divide-white/5 bg-black/50">
            {sandboxResults.map((r, idx) => (
              <div key={idx} className="flex items-start gap-4 px-6 py-3 hover:bg-white/5 transition-colors group">
                {r.success
                  ? <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                  : <div className="mt-1"><XCircle className="w-4 h-4 text-red-500" /></div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[11px] text-zinc-200 font-bold">{r.integration}</span>
                    <span className="text-[9px] text-zinc-600 font-mono tabular-nums">{r.timestamp}</span>
                    {r.success && <span className="text-[9px] text-emerald-500/80 font-mono tabular-nums px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{r.latency}</span>}
                  </div>
                  <p className={`text-[10px] font-medium ${r.success ? "text-zinc-400" : "text-red-400"}`}>{r.message}</p>
                  {r.responsePreview && (
                    <div className="mt-2 relative group-hover:block">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500/30 rounded-full" />
                      <pre className="text-[9px] text-zinc-500 font-mono pl-3 py-1 overflow-x-auto">{r.responsePreview}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
               <div>
                <h3 className="text-sm font-semibold text-foreground">Configure Integration</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Update settings for <span className="font-medium text-foreground">{editModal.name}</span>
                </p>
              </div>
              <button onClick={() => setEditModal(null)} className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground hover:text-foreground hover:bg-black/10 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              {Object.entries(editModal.config).map(([k, v]) => (
                <div key={k} className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider ml-1">{k}</label>
                  <input defaultValue={v} className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/30 rounded-xl text-xs text-foreground font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 bg-transparent border border-black/10 dark:border-white/10 rounded-xl text-xs text-muted-foreground font-semibold hover:text-foreground hover:bg-black/5 transition-colors">Cancel</button>
              <button onClick={() => setEditModal(null)} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
